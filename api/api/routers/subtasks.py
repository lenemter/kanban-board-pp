from fastapi import APIRouter, status

import api.db
import api.dependencies
import api.schemas

router = APIRouter(tags=["subtasks"])


@router.get("/tasks/{task_id}/subtasks", response_model=list[api.schemas.SubtaskPublic])
async def get_subtask(board_column_and_task: api.dependencies.BoardColumnTaskDep):
    _, _, task = board_column_and_task
    return api.db.get_subtasks(task)


@router.post(
    "/tasks/{task_id}/subtasks",
    status_code=status.HTTP_201_CREATED,
    response_model=api.schemas.SubtaskPublic
)
async def create_subtask(
    board_column_and_task: api.dependencies.BoardColumnTaskDep,
    subtask_create: api.schemas.SubtaskCreate,
    current_user: api.dependencies.CurrentUserDep,
):
    _, _, task = board_column_and_task
    return api.db.create_subtask(task, **subtask_create.model_dump(exclude_unset=True))


@router.patch("/subtasks/{subtask_id}", response_model=api.schemas.SubtaskPublic)
async def update_subtask(
    board_column_task_and_subtask: api.dependencies.BoardColumnTaskSubtaskDep,
    subtask_update: api.schemas.SubtaskUpdate,
    session: api.dependencies.SessionDep,
):
    _, _, _, subtask = board_column_task_and_subtask
    return api.db.update_subtask(session, subtask, **subtask_update.model_dump(exclude_unset=True))


@router.delete("/subtasks/{subtask_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subtask(
    board_column_task_and_subtask: api.dependencies.BoardColumnTaskSubtaskDep,
    session: api.dependencies.SessionDep
):
    _, _, _, subtask = board_column_task_and_subtask
    return api.db.delete_subtask(session, subtask)
