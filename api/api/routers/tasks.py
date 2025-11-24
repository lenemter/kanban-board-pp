from fastapi import APIRouter, HTTPException, status

import api.db
import api.dependencies
import api.schemas

router = APIRouter(tags=["tasks"])


def validate_move(before: api.db.Task | None, after: api.db.Task | None) -> None:
    if before and before.column_id is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid before task")

    if after and after.column_id is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid after task")

    if before and after and before.column_id != after.column_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Before/after must belong to same column")


def validate_new_assignee(board: api.db.Board, assignee_id: int | None) -> api.db.User | None:
    if assignee_id is None:
        return None

    assigned_user = api.db.get_user_by_id(assignee_id)
    if assigned_user is None:
        raise HTTPException(status.HTTP_409_CONFLICT, "This user doesn't exist")

    if board.owner_id != assignee_id:  # TODO: Check for other users
        raise HTTPException(status.HTTP_409_CONFLICT, "This user doesn't have access to this board")

    return assigned_user


@router.get("/columns/{column_id}/tasks", response_model=list[api.schemas.TaskPublic])
async def get_tasks(board_and_column: api.dependencies.BoardColumnDep):
    _, column = board_and_column
    return api.db.get_tasks(column)


@router.post("/columns/{column_id}/tasks", status_code=status.HTTP_201_CREATED, response_model=api.schemas.TaskPublic)
async def add_task(
    board_and_column: api.dependencies.BoardColumnDep,
    task_create: api.schemas.TaskCreate,
    current_user: api.dependencies.CurrentUserDep,
):
    board, column = board_and_column

    validate_new_assignee(board, task_create.assignee_id)

    return api.db.create_task(column, author=current_user.id, **task_create.model_dump())


@router.get("/tasks/{task_id}", response_model=api.schemas.TaskPublic)
async def get_task(board_column_and_task: api.dependencies.BoardColumnTaskDep):
    _, _, task = board_column_and_task
    return task


@router.patch("/tasks/{task_id}", response_model=api.schemas.TaskPublic)
async def update_task(
    board_column_and_task: api.dependencies.BoardColumnTaskDep,
    task_update: api.schemas.TaskUpdate,
    session: api.dependencies.SessionDep,
):
    board, column, task = board_column_and_task

    if not isinstance(task_update.assignee_id, api.schemas.UnsetType) and task.assignee_id != task_update.assignee_id:
        old_assignee = api.db.get_user_by_id(task.assignee_id)
        if old_assignee is not None:
            api.db.create_task_comment(task, None, content=f"Unassigned {old_assignee.name}")

        new_assignee = validate_new_assignee(board, task_update.assignee_id)
        if new_assignee is not None:
            api.db.create_task_comment(task, None, content=f"Assigned {new_assignee.name}")

    if not isinstance(task_update.title, api.schemas.UnsetType) and task_update.title != task.title:
        api.db.create_task_comment(task, None, content=f"~~{task.title}~~ {task_update.title}")

    return api.db.update_task(session, task, **task_update.model_dump(exclude_unset=True))


@router.patch("/tasks/{task_id}/move", response_model=api.schemas.TaskPublic)
async def move_task(
    board_column_and_task: api.dependencies.BoardColumnTaskDep,
    move_payload: api.schemas.MoveTaskPayload,
    session: api.dependencies.SessionDep,
):
    board, column, task = board_column_and_task

    new_column = api.db.get_column_by_id(session, move_payload.new_column_id)
    if not new_column:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Column not found")

    before = api.db.get_task(session, move_payload.before_id) if move_payload.before_id else None
    after = api.db.get_task(session, move_payload.after_id) if move_payload.after_id else None

    validate_move(before, after)

    return api.db.move_task(session, task, new_column, before, after)


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    board_column_and_task: api.dependencies.BoardColumnTaskDep,
    session: api.dependencies.SessionDep,
):
    _, _, task = board_column_and_task
    api.db.delete_object(session, task)


@router.post("/tasks/{task_id}/tags", status_code=status.HTTP_201_CREATED, response_model=api.schemas.TaskTagPublic)
async def add_task_tag(
    board_column_and_task: api.dependencies.BoardColumnTaskDep,
    task_tag_create: api.schemas.TaskTagCreate,
):
    _, _, task = board_column_and_task
    return api.db.create_task_tag(task, **task_tag_create.model_dump(exclude_unset=True))


@router.delete("/task-tags/{task_tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task_tag(
    board_column_task_tag: api.dependencies.BoardColumnTaskTagDep,
    session: api.dependencies.SessionDep,
):
    _, _, _, task_tag = board_column_task_tag
    api.db.delete_object(session, task_tag)
