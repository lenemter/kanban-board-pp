from datetime import datetime, timedelta, timezone
import os
from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
import jwt
import bcrypt

import api.db
import api.dependencies
from api.mail_utils import mail_support, send_verification_email
import api.schemas
import api.utils

ACCESS_TOKEN_EXPIRE_DAYS = 3

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

    secret_key = os.getenv("SECRET_KEY")
    assert secret_key is not None

    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=api.utils.HASH_ALGORITHM)

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

    if not user.is_verified:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Please verify your email before logging in")

    return create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    )


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    request: Request,
    background_tasks: BackgroundTasks,
    user_create: api.schemas.UserCreate,
    session: api.dependencies.SessionDep
) -> dict:
    if api.db.get_user_by_email(user_create.email) is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already taken")

    new_user = api.db.register_user(
        email=user_create.email,
        hashed_password=api.utils.get_password_hash(user_create.password.internal_string),
        name=user_create.name,
    )

    if mail_support:
        base_url = str(request.base_url).rstrip("/")
        background_tasks.add_task(send_verification_email, base_url, new_user)
        return {"message": "User created successfully. Please verify your email."}
    else:
        api.db.verify_user(session, new_user)
        return {"message": "User created successfully. Your account was automatically verified."}


@router.get("/verify/{token}", status_code=status.HTTP_200_OK)
def verify_email(token: str, session: api.dependencies.SessionDep) -> dict:

    user = api.db.get_user_by_verification_token(session, token)
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token")

    api.db.verify_user(session, user)

    return {"message": "Email verified successfully!"}


@router.get("/resend-verification", status_code=status.HTTP_200_OK)
def resend_verification(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    request: Request,
    background_tasks: BackgroundTasks,
    session: api.dependencies.SessionDep
) -> dict:
    user = authenticate_user(form_data.username, form_data.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.is_verified:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already verified")

    if mail_support:
        base_url = str(request.base_url).rstrip("/")
        background_tasks.add_task(send_verification_email, base_url, user)
    else:
        api.db.verify_user(session, user)

    return {"message": "Verification email resent successfully"}
