import os
import shutil
import uuid

from app.db.database import get_db
from app.db.models import Chat, Document, Message
from app.dependencies import getUser
from app.services.chromadb import delete_embeddings
from app.services.data_ingestion import process_document_in_background
from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/chats", tags=["chats"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_chat(
    payload: dict = Depends(getUser),  # noqa: B008
    db: AsyncSession = Depends(get_db),  # noqa: B008
):
    chat = Chat(id=str(uuid.uuid4()), user_id=payload["userId"], title="New Chat")
    db.add(chat)
    await db.commit()
    await db.refresh(chat)
    return {"id": chat.id, "title": chat.title, "created_at": chat.created_at}


@router.get("")
async def list_chats(
    payload: dict = Depends(getUser), db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Chat)
        .where(Chat.user_id == payload["userId"])
        .order_by(Chat.created_at.desc())
    )

    result = await db.execute(stmt)
    chats = result.scalars().all()
    response = [
        {"id": chat.id, "title": chat.title, "created_at": chat.created_at}
        for chat in chats
    ]
    return response


@router.delete("/{chat_id}", status_code=status.HTTP_200_OK)
async def delete_chat(
    chat_id: str,
    payload: dict = Depends(getUser),  # noqa: B008
    db: AsyncSession = Depends(get_db),  # noqa: B008
):
    chat_stmt = select(Chat).where(
        Chat.id == chat_id, Chat.user_id == payload["userId"]
    )
    chat_result = await db.execute(chat_stmt)
    chat = chat_result.scalar_one_or_none()
    if not chat:
        raise HTTPException(404, "Chat not found")

    doc_stmt = select(Document).where(Document.chat_id == chat_id)
    doc_result = await db.execute(doc_stmt)
    docs = doc_result.scalars().all()

    doc_ids = [d.id for d in docs]
    if doc_ids:
        delete_embeddings(doc_ids)

    await db.execute(delete(Message).where(Message.chat_id == chat_id))
    await db.execute(delete(Document).where(Document.chat_id == chat_id))
    await db.execute(delete(Chat).where(Chat.id == chat_id))
    await db.commit()

    return {"message": "Chat deleted successfully"}


@router.get("/{chat_id}/messages")
async def get_messages(
    chat_id: str,
    payload: dict = Depends(getUser),  # noqa: B008
    db: AsyncSession = Depends(get_db),  # noqa: B008
):
    chat_stmt = select(Chat).where(
        Chat.id == chat_id, Chat.user_id == payload["userId"]
    )
    chat_result = await db.execute(chat_stmt)
    chat = chat_result.scalar_one_or_none()
    if not chat:
        raise HTTPException(404, "Chat not found")

    stmt = (
        select(Message)
        .where(Message.chat_id == chat_id)
        .order_by(Message.created_at.asc())
    )
    result = await db.execute(stmt)
    messages = result.scalars().all()

    doc_stmt = select(Document).where(Document.chat_id == chat_id)
    doc_result = await db.execute(doc_stmt)
    docs = {d.document_name: d for d in doc_result.scalars().all()}

    return [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "created_at": m.created_at,
            "is_clarification": m.is_clarification,
            "status": docs[m.content].status
            if (m.role == "document" and m.content in docs)
            else "indexed",
        }
        for m in messages
    ]


@router.post("/{chat_id}/upload-doc", status_code=status.HTTP_201_CREATED)
async def upload_documents(
    chat_id: str,
    background_tasks: BackgroundTasks,
    files: list[UploadFile] = File(...),  # noqa: B008
    payload: dict = Depends(getUser),  # noqa: B008
    db: AsyncSession = Depends(get_db),  # noqa: B008
):
    if chat_id == "new":
        chat = Chat(id=str(uuid.uuid4()), user_id=payload["userId"], title="New Chat")
        db.add(chat)
    else:
        chat_stmt = select(Chat).where(
            Chat.id == chat_id, Chat.user_id == payload["userId"]
        )
        chat_result = await db.execute(chat_stmt)
        chat = chat_result.scalar_one_or_none()
        if not chat:
            raise HTTPException(404, "Chat not found")

    documents_created = []
    os.makedirs("uploads", exist_ok=True)

    for file in files:
        file_path = f"uploads/{file.filename}"
        with open(file_path, "wb") as buffer:  # noqa: ASYNC230
            shutil.copyfileobj(file.file, buffer)

        document_id = str(uuid.uuid4())
        document = Document(
            id=document_id,
            document_name=file.filename,
            user_id=payload["userId"],
            chat_id=chat.id,
            is_embedded=False,
            status="pending",
        )
        db.add(document)

        if not chat.title or chat.title == "New Chat":
            chat.title = file.filename

        doc_msg = Message(
            id=str(uuid.uuid4()),
            chat_id=chat.id,
            role="document",
            content=file.filename,
        )
        db.add(doc_msg)

        documents_created.append((document, file_path))

    await db.commit()

    for doc, path in documents_created:
        background_tasks.add_task(process_document_in_background, doc.id, path)

    return {
        "message": "uploaded",
        "chat_id": chat.id,
        "chat_title": chat.title,
        "documents": [
            {"id": doc.id, "name": doc.document_name} for doc, _ in documents_created
        ],
    }
