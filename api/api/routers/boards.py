from fastapi import APIRouter, HTTPException, status

import api.db
import api.dependencies
import api.schemas

router = APIRouter(tags=["boards"])


@router.get("/boards", response_model=list[api.schemas.BoardPublic])
async def get_owned_boards(current_user: api.dependencies.CurrentUserDep):
    return api.db.get_owned_boards(current_user.id)


@router.get("/boards/shared", response_model=list[api.schemas.BoardPublic])
async def get_shared_boards(current_user: api.dependencies.CurrentUserDep):
    return api.db.get_shared_boards(current_user.id)


@router.post("/boards", status_code=status.HTTP_201_CREATED, response_model=api.schemas.BoardPublic)
async def create_board(current_user: api.dependencies.CurrentUserDep, board_create: api.schemas.BoardCreate):
    board = api.db.create_board(current_user, **board_create.model_dump())

    api.db.create_column(board, name="To Do")
    api.db.create_column(board, name="In Progress")
    api.db.create_column(board, name="Done")

    return board


@router.get("/boards/{board_id}", response_model=api.schemas.BoardPublic)
async def get_board(board: api.dependencies.BoardViewAccessDep):
    return board


@router.patch("/boards/{board_id}", response_model=api.schemas.BoardPublic)
async def update_board(
    board: api.dependencies.BoardCollaboratorAccessDep,
    board_update: api.schemas.BoardUpdate,
    session: api.dependencies.SessionDep
):
    return api.db.update_board(session, board, **board_update.model_dump(exclude_unset=True))


@router.delete("/boards/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_board(board: api.dependencies.BoardOwnerAccessDep, session: api.dependencies.SessionDep) -> None:
    api.db.delete_object(session, board)


@router.get("/boards/{board_id}/users", response_model=list[api.schemas.UserPublic])
def get_board_users(board: api.dependencies.BoardCollaboratorAccessDep, session: api.dependencies.SessionDep):
    return api.db.get_board_users(session, board)


@router.post(
    "/boards/{board_id}/users",
    status_code=status.HTTP_201_CREATED,
    response_model=api.schemas.BoardUserAccessPublic
)
def add_user_to_board(board: api.dependencies.BoardOwnerAccessDep, email: str, session: api.dependencies.SessionDep):
    user = api.db.get_user_by_email(email)
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User doesn't exist")

    return api.db.add_user_to_board(session, board, user)


@router.delete("/boards/{board_id}/users", status_code=status.HTTP_204_NO_CONTENT)
async def remove_user_from_board(
    board: api.dependencies.BoardOwnerAccessDep,
    user_id: int,
    session: api.dependencies.SessionDep
) -> None:
    user = api.db.get_user_by_id(user_id)
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User doesn't exist")

    if board.owner_id == user_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Can't remove an owner from a board")

    board_user_access = api.db.get_board_user_access(session, board, user)
    if board_user_access is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User doesn't have access to this board")

    api.db.delete_object(session, board_user_access)
