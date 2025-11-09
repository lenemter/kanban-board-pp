from fastapi import APIRouter, status

import api.db
import api.dependencies
import api.schemas

router = APIRouter(tags=["boards tag"])


@router.get("/boards/{board_id}/tags", response_model=list[api.schemas.BoardTagPublic])
async def get_board_tags(board: api.dependencies.BoardViewAccessDep):
    return api.db.get_board_tags(board)


@router.post("/boards/{board_id}/tags", status_code=status.HTTP_201_CREATED, response_model=api.schemas.BoardTagPublic)
async def create_tag(board: api.dependencies.BoardCollaboratorAccessDep, board_tag_create: api.schemas.BoardTagCreate):
    return api.db.create_board_tag(board, **board_tag_create.model_dump())


@router.get("/board-tags/{tag_id}", response_model=api.schemas.BoardTagPublic)
async def get_tag(board_and_tag: api.dependencies.BoardTagViewDep):
    _, tag = board_and_tag
    return tag


@router.patch("/board-tags/{tag_id}", response_model=api.schemas.BoardTagPublic)
async def update_tag(
    board_and_tag: api.dependencies.BoardTagCollaboratorDep,
    tag_update: api.schemas.BoardTagUpdate,
    session: api.dependencies.SessionDep
):
    _, tag = board_and_tag
    return api.db.update_board_tag(session, tag, **tag_update.model_dump(exclude_unset=True))


@router.delete("/board-tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(
    board_and_tag: api.dependencies.BoardTagCollaboratorDep,
    session: api.dependencies.SessionDep
) -> None:
    _, tag = board_and_tag
    api.db.delete_object(session, tag)
