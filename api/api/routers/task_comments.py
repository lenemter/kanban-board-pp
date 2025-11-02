from fastapi import APIRouter, HTTPException, status

import api.db
import api.dependencies
import api.schemas

router = APIRouter(tags=["task comments"])


@router.get("/tasks/{task_id}/comments", response_model=list[api.schemas.TaskCommentPublic])
async def get_task_comments(board_column_and_task: api.dependencies.BoardColumnTaskDep):
    _, _, task = board_column_and_task
    return api.db.get_task_comments(task)


@router.post(
    "/tasks/{task_id}/comments",
    status_code=status.HTTP_201_CREATED,
    response_model=api.schemas.TaskCommentPublic
)
async def create_task_comment(
    board_column_and_task: api.dependencies.BoardColumnTaskDep,
    task_comment_create: api.schemas.TaskCommentCreate,
    current_user: api.dependencies.CurrentUserDep,
):
    _, _, task = board_column_and_task
    return api.db.create_task_comment(task, current_user, **task_comment_create.model_dump(exclude_unset=True))


@router.patch("/comments/{task_comment_id}", response_model=api.schemas.TaskCommentPublic)
async def update_task_comment(
    board_column_task_and_comment: api.dependencies.BoardColumnTaskCommentDep,
    task_comment_update: api.schemas.TaskCommentUpdate,
    session: api.dependencies.SessionDep,
):
    _, _, _, comment = board_column_task_and_comment
    return api.db.update_task_comment(session, comment, **task_comment_update.model_dump(exclude_unset=True))


@router.delete("/comments/{task_comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task_comment(
    board_column_task_and_comment: api.dependencies.BoardColumnTaskCommentDep,
    session: api.dependencies.SessionDep,
    current_user: api.dependencies.CurrentUserDep
):
    _, _, _, comment = board_column_task_and_comment

    if current_user.id != comment.created_by:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not enough permissions")

    return api.db.delete_task_comment(session, comment)
