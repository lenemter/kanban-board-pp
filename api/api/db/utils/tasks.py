from typing import TYPE_CHECKING

from sqlmodel import Session, select

if TYPE_CHECKING:
    from .. import Column, Task, TaskTag


def get_task(session: Session, task_id: int) -> Task | None:
    from .. import Task

    return session.get(Task, task_id)


def get_tasks(column: Column) -> list[Task]:
    from .. import engine, Task

    with Session(engine) as session:
        return list(
            session.exec(
                select(Task)
                .where(Task.column_id == column.id)
                .order_by(Task.position)  # type: ignore
            ).all()
        )


def create_task(column: Column, **kwargs) -> Task:
    from .. import engine, Task

    assert column.id is not None

    with Session(engine) as session:
        new_task = Task(column_id=column.id, position=len(get_tasks(column)), **kwargs)
        session.add(new_task)
        session.commit()
        session.refresh(new_task)

        return new_task


def update_task(session: Session, task: Task, **kwargs) -> Task:
    task.sqlmodel_update(kwargs)
    session.add(task)
    session.commit()
    session.refresh(task)

    return task


def move_task(
    session: Session,
    task: Task,
    new_column: Column,
    before: Task | None,
    after: Task | None,
) -> Task:
    assert new_column.id is not None

    if before and after:
        # между двумя задачами
        new_position = (before.position + after.position) / 2
    elif before:
        # вставить перед задачей
        new_position = before.position - 1
    elif after:
        # вставить после задачи
        new_position = after.position + 1
    else:
        # колонка пустая
        new_position = 0

    task.column_id = new_column.id
    task.position = new_position

    session.add(task)
    session.commit()
    session.refresh(task)

    return task


def create_task_tag(task: Task, **kwargs) -> TaskTag:
    from .. import engine, TaskTag

    assert task.id is not None

    with Session(engine) as session:
        new_task_tag = TaskTag(task_id=task.id, **kwargs)
        session.add(new_task_tag)
        session.commit()
        session.refresh(new_task_tag)

        return new_task_tag
