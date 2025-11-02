from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlmodel import Session

import api.db

# --- Session ---


def get_session():
    with Session(api.db.engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]

# --- User Validation ---

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> api.db.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, api.utils.read_secret("SECRET_KEY"), algorithms=[api.utils.HASH_ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.InvalidTokenError:
        raise credentials_exception

    user = api.db.get_user_by_username(username)
    if user is None:
        raise credentials_exception
    if user.id is None:
        raise credentials_exception

    return user


CurrentUserDep = Annotated[api.db.User, Depends(get_current_user)]

# -- Board ---


def owner_get_board(board_id: int, current_user: CurrentUserDep, session: SessionDep) -> api.db.Board:
    board = session.get(api.db.Board, board_id)
    if board is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Board not found")
    if board.owner_id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not enough permissions")

    return board


BoardOwnerAccessDep = Annotated[api.db.Board, Depends(owner_get_board)]
