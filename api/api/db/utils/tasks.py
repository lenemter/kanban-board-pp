from typing import TYPE_CHECKING

from sqlmodel import Session, select

if TYPE_CHECKING:
    from .. import Column, Task


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


def delete_task(session: Session, task: Task) -> None:
    session.delete(task)
    session.commit()
