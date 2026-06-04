from fastapi import FastAPI, UploadFile, File,status, HTTPException, Depends
import shutil
from services.data_ingestion import process_document
from services.llm_call import getEmbeddings, generateAnswer
from services.chromadb import search_embeddings
from pydantic import BaseModel
from dotenv import load_dotenv
load_dotenv()
import os
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from db.models import User

from google.oauth2 import id_token
from google.auth.transport import requests
import jwt
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.get("/")
def info():
    return(f"rag application active")


@app.post("/upload-doc",status_code=status.HTTP_201_CREATED)
async def upload_document(file: UploadFile = File(...)):
    file_path = f"uploads/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    process_document(file_path)
    return {
        "message": "uploaded"
    }
    
@app.post("/chat")
async def chat(request: ChatRequest):
    message =request.message
    embeddedMessage = getEmbeddings([message])
    if not embeddedMessage:
        return {
            "message": "embedding generation failed"
        }
    vector  = embeddedMessage[0].values
    if not vector:
        return{
            "message":"embedding generation failed"
        }
    response = search_embeddings(vector)
    context = "\n\n".join(response["documents"][0])
    llmResponse = await generateAnswer(context,message)    
        
    return {
        "response": llmResponse
    }
    
class GoogleAuthRequest(BaseModel):
    token: str

@app.post("/api/v1/auth/google")
async def googleAuth(payload:GoogleAuthRequest,db: AsyncSession = Depends(get_db)):
    print("req received")
    google_client_id = os.getenv("GOOGLE_CLIENT_ID")
    if google_client_id is None:
        raise ValueError("google_client_id not set")
    jwt_secret = os.getenv("JWT_SECRET")
    if jwt_secret is None:
        raise ValueError("jwt_secret not set")

    if not payload.token:
            raise HTTPException(
                status_code=400,
                detail="Google token is required"
            )
    
    # Verify Google ID Token
    token_info = id_token.verify_oauth2_token(
        payload.token,
        requests.Request(),
        google_client_id
    )
    
    email = token_info.get("email")
    name = token_info.get("name")
    google_id = token_info.get("sub")
    picture = token_info.get("picture")

    if not email:
        raise HTTPException(
        status_code=400,
        detail="Invalid Google token"
        )
      
    # Find user
    stmt = select(User).where(
        User.email == email
    )

    result = await db.execute(stmt)

    user = result.scalar_one_or_none()

        # Create user if not exists
    if not user:
        user = User(
            email=email,
            name=name,
            google_id=google_id
        )

        db.add(user)

        await db.commit()

        await db.refresh(user)

    # Generate JWT
    app_token = jwt.encode(
            {
                "userId": user.id,
                "email": user.email,
            },
            jwt_secret,
            algorithm="HS256",
        )

    return {
            "message": "Login successful",
            "token": app_token,
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "image": picture,
            },
        }  
    