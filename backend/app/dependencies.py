import os

import jwt
from fastapi import Header, HTTPException


def decode_jwt(token: str) -> dict:
    jwt_secret = os.getenv("JWT_SECRET")
    if not jwt_secret:
        raise ValueError("JWT_SECRET not set")
    return jwt.decode(token, jwt_secret, algorithms=["HS256"])

async def getUser(authorization: str = Header(default=None)) -> dict:
    if not authorization:
        raise HTTPException(401, "Authorization header missing")
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Invalid token format")
    try:
        return decode_jwt(authorization.split(" ")[1])
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid or expired token")
