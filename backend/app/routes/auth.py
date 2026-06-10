from fastapi import APIRouter, HTTPException, Header
from uuid import uuid4
from datetime import datetime, timezone

from app.models.user import UserSignup, UserLogin
from app.database import users_collection
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/signup")
async def signup(user: UserSignup):
    existing_user = await users_collection.find_one({"email": user.email})

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = {
        "_id": str(uuid4()),
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password),
        "created_at": datetime.now(timezone.utc),
    }

    await users_collection.insert_one(new_user)

    token = create_access_token({"sub": new_user["_id"]})

    return {
        "message": "User registered successfully",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user["_id"],
            "name": new_user["name"],
            "email": new_user["email"],
        },
    }


@router.post("/login")
async def login(user: UserLogin):
    db_user = await users_collection.find_one({"email": user.email})

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": db_user["_id"]})

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": db_user["_id"],
            "name": db_user["name"],
            "email": db_user["email"],
        },
    }


@router.get("/me")
async def get_me(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    token = authorization.replace("Bearer ", "")
    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload.get("sub")
    db_user = await users_collection.find_one({"_id": user_id})

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": db_user["_id"],
        "name": db_user["name"],
        "email": db_user["email"],
    }

