from typing import TYPE_CHECKING

from sqlmodel import Session, select

if TYPE_CHECKING:
    from .. import Column, Task, TaskTag


def get_tasks(column: Column) -> list[Task]:
    from .. import engine, Task

    with Session(engine) as session:
        return list(
            session.exec(
                select(Task).where(
                    Task.column_id == column.id
                )
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


def insert_task_to_position(session: Session, task: Task, column: Column, new_position: int) -> Task:
    tasks = get_tasks(column)
    tasks.sort(key=lambda t: t.position)
    for i in range(min(task.position,  new_position), max(task.position, new_position)):
        tasks[i].position += 1
        session.merge(tasks[i])

    task.position = new_position
    session.merge(task)
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
