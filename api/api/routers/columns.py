from fastapi import APIRouter, HTTPException, status

import api.db
import api.dependencies
import api.schemas

router = APIRouter(tags=["columns"])


def validate_move(column: api.db.Column, before: api.db.Column | None, after: api.db.Column | None) -> None:
    if before and before.board_id != column.board_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid before column")

    if after and after.board_id != column.board_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid after column")


@router.get("/boards/{board_id}/columns", response_model=list[api.schemas.ColumnPublic])
async def get_columns(board: api.dependencies.BoardViewAccessDep):
    return api.db.get_columns(board)


@router.post("/boards/{board_id}/columns", status_code=status.HTTP_201_CREATED, response_model=api.schemas.ColumnPublic)
async def create_column(board: api.dependencies.BoardCollaboratorAccessDep, column_create: api.schemas.ColumnCreate):
    return api.db.create_column(board, **column_create.model_dump())


@router.get("/columns/{column_id}", response_model=api.schemas.ColumnPublic)
async def get_column(board_and_column: api.dependencies.BoardColumnDep):
    _, column = board_and_column
    return column


@router.patch("/columns/{column_id}", response_model=api.schemas.ColumnPublic)
async def update_column(
    board_and_column: api.dependencies.BoardCollaboratorColumnDep,
    column_update: api.schemas.ColumnUpdate,
    session: api.dependencies.SessionDep
):
    board, column = board_and_column

    return api.db.update_column(session, column, **column_update.model_dump(exclude_unset=True))


@router.patch("/columns/{column_id}/move", response_model=api.schemas.ColumnPublic)
async def move_column(
    board_and_column: api.dependencies.BoardCollaboratorColumnDep,
    move_payload: api.schemas.MoveColumnPayload,
    session: api.dependencies.SessionDep,
):
    board, column = board_and_column

    before = api.db.get_column_by_id(session, move_payload.before_id) if move_payload.before_id else None
    after = api.db.get_column_by_id(session, move_payload.after_id) if move_payload.after_id else None

    validate_move(column, before, after)

    return api.db.move_column(session, column, before, after)


@router.delete("/columns/{column_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_column(
    board_and_column: api.dependencies.BoardColumnDep,
    session: api.dependencies.SessionDep
) -> None:
    _, column = board_and_column
    api.db.delete_object(session, column)
