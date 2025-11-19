import os
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlmodel import Session, select

import api.db

# --- Session ---


def get_session():
    with Session(api.db.engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]

# --- User Validation ---

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{api.utils.PREFIX}/token")


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> api.db.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    secret_key = os.getenv("SECRET_KEY")
    assert secret_key is not None

    try:
        payload = jwt.decode(token, secret_key, algorithms=[api.utils.HASH_ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.InvalidTokenError:
        raise credentials_exception

    user = api.db.get_user_by_email(email)
    if user is None:
        raise credentials_exception
    if user.id is None:
        raise credentials_exception

    return user


CurrentUserDep = Annotated[api.db.User, Depends(get_current_user)]

# -- Board ---


def board_if_owned_by_user(board_id: int, current_user: CurrentUserDep, session: SessionDep) -> api.db.Board:
    board = session.get(api.db.Board, board_id)
    if board is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Board not found")
    if board.owner_id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not enough permissions")

    return board


def board_if_user_collaborator(board_id: int, current_user: CurrentUserDep, session: SessionDep) -> api.db.Board:
    board = session.get(api.db.Board, board_id)
    if board is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Board not found")

    if board.owner_id == current_user.id:
        return board

    board_user_access = session.exec(
        select(api.db.BoardUserAccess).where(
            api.db.BoardUserAccess.board_id == board.id,
            api.db.BoardUserAccess.user_id == current_user.id
        )
    ).first()

    if board_user_access is None:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not enough permissions")

    return board


def board_if_accessible_by_user(board_id: int, current_user: CurrentUserDep, session: SessionDep) -> api.db.Board:
    board = session.get(api.db.Board, board_id)
    if board is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Board not found")

    if board.is_public:
        return board

    return board_if_user_collaborator(board_id, current_user, session)


BoardOwnerAccessDep = Annotated[api.db.Board, Depends(board_if_owned_by_user)]
BoardCollaboratorAccessDep = Annotated[api.db.Board, Depends(board_if_user_collaborator)]
BoardViewAccessDep = Annotated[api.db.Board, Depends(board_if_accessible_by_user)]

# --- Board Tag ---


def get_board_and_tag_collaborator(
    current_user: CurrentUserDep,
    tag_id: int,
    session: SessionDep
) -> tuple[api.db.Board, api.db.BoardTag]:
    tag = session.get(api.db.BoardTag, tag_id)
    if tag is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tag not found")

    board = board_if_user_collaborator(tag.board_id, current_user, session)

    return board, tag


def get_board_and_tag_view(
    current_user: CurrentUserDep,
    tag_id: int,
    session: SessionDep
) -> tuple[api.db.Board, api.db.BoardTag]:
    tag = session.get(api.db.BoardTag, tag_id)
    if tag is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tag not found")

    board = board_if_accessible_by_user(tag.board_id, current_user, session)

    return board, tag


BoardTagCollaboratorDep = Annotated[tuple[api.db.Board, api.db.BoardTag], Depends(board_if_user_collaborator)]
BoardTagViewDep = Annotated[tuple[api.db.Board, api.db.BoardTag], Depends(get_board_and_tag_view)]

# --- Column ---


def get_board_and_column(
    current_user: CurrentUserDep,
    column_id: int,
    session: SessionDep
) -> tuple[api.db.Board, api.db.Column]:
    column = session.get(api.db.Column, column_id)
    if column is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Column not found")

    board = board_if_accessible_by_user(column.board_id, current_user, session)

    return board, column


BoardColumnDep = Annotated[tuple[api.db.Board, api.db.Column], Depends(get_board_and_column)]

# --- Task ---


def get_board_column_and_task(
    current_user: CurrentUserDep,
    task_id: int,
    session: SessionDep
) -> tuple[api.db.Board, api.db.Column, api.db.Task]:
    task = session.get(api.db.Task, task_id)
    if task is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Task not found")

    board, column = get_board_and_column(current_user, task.column_id, session)

    return board, column, task


BoardColumnTaskDep = Annotated[tuple[api.db.Board, api.db.Column, api.db.Task], Depends(get_board_column_and_task)]

# --- Task Tag ---


def get_board_column_task_and_tag(
    current_user: CurrentUserDep,
    task_tag_id: int,
    session: SessionDep
) -> tuple[api.db.Board, api.db.Column, api.db.Task, api.db.TaskTag]:
    task_tag = session.get(api.db.TaskTag, task_tag_id)
    if task_tag is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Task tag not found")

    board, column, task = get_board_column_and_task(current_user, task_tag.task_id, session)

    return board, column, task, task_tag


BoardColumnTaskTagDep = Annotated[
    tuple[api.db.Board, api.db.Column, api.db.Task, api.db.TaskTag],
    Depends(get_board_column_task_and_tag)
]

# --- Task Comment ---


def get_board_column_task_and_comment(
    current_user: CurrentUserDep,
    task_comment_id: int,
    session: SessionDep
) -> tuple[api.db.Board, api.db.Column, api.db.Task, api.db.TaskComment]:
    task_comment = session.get(api.db.TaskComment, task_comment_id)
    if task_comment is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Task comment not found")

    board, column, task = get_board_column_and_task(current_user, task_comment.task_id, session)

    return board, column, task, task_comment


BoardColumnTaskCommentDep = Annotated[
    tuple[api.db.Board, api.db.Column, api.db.Task, api.db.TaskComment],
    Depends(get_board_column_task_and_comment)
]

# --- Subtask ---


def get_board_column_task_and_subtask(
    current_user: CurrentUserDep,
    subtask_id: int,
    session: SessionDep
) -> tuple[api.db.Board, api.db.Column, api.db.Task, api.db.Subtask]:
    subtask = session.get(api.db.Subtask, subtask_id)
    if subtask is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Subtask not found")

    board, column, task = get_board_column_and_task(current_user, subtask.task_id, session)

    return board, column, task, subtask


BoardColumnTaskSubtaskDep = Annotated[
    tuple[api.db.Board, api.db.Column, api.db.Task, api.db.Subtask],
    Depends(get_board_column_task_and_subtask)
]
