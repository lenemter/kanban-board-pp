from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
import jwt
import bcrypt

import api.db
import api.schemas
import api.utils

ACCESS_TOKEN_EXPIRE_MINUTES = 30

router = APIRouter(tags=["auth"])


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())


def authenticate_user(email: str, password: str) -> api.db.User | None:
    user = api.db.get_user_by_email(email)
    if user is None:
        return None
    if not verify_password(password, user.hashed_password):
        return None

    return user


def create_access_token(data: dict, expires_delta: timedelta) -> api.schemas.Token:
    expire = datetime.now(timezone.utc) + expires_delta

    to_encode = data.copy()
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, api.utils.read_secret("SECRET_KEY"), algorithm=api.utils.HASH_ALGORITHM)

    return api.schemas.Token(access_token=encoded_jwt, token_type="bearer")


@router.post("/token")
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]) -> api.schemas.Token:
    user = authenticate_user(form_data.username, form_data.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_create: api.schemas.UserCreate) -> api.schemas.Token:
    if api.db.get_user_by_email(user_create.email) is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Username already taken")

    new_user = api.db.register_user(
        email=user_create.email,
        hashed_password=api.utils.get_password_hash(user_create.password),
        name=user_create.name,
    )

    return create_access_token(
        data={"sub": new_user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
