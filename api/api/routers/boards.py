from fastapi import APIRouter, status

import api.db
import api.dependencies
import api.schemas

router = APIRouter(tags=["boards"])


@router.get("/boards/", response_model=list[api.schemas.BoardPublic])
async def get_owned_boards(current_user: api.dependencies.CurrentUserDep):
    return api.db.get_owned_boards(current_user.id)


@router.get("/boards/shared/", response_model=list[api.schemas.BoardPublic])
async def get_shared_boards(current_user: api.dependencies.CurrentUserDep):
    return api.db.get_shared_boards(current_user.id)


@router.post("/boards/", status_code=status.HTTP_201_CREATED, response_model=api.schemas.BoardPublic)
async def create_board(
    current_user: api.dependencies.CurrentUserDep,
    board_create: api.schemas.BoardCreate
):
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
    api.db.delete_board(session, board)
