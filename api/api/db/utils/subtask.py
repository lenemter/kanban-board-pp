from typing import TYPE_CHECKING

from sqlmodel import Session, select

if TYPE_CHECKING:
    from .. import Task, Subtask


def get_subtasks(task: Task) -> list[Subtask]:
    from .. import engine, Subtask

    with Session(engine) as session:
        return list(
            session.exec(
                select(Subtask).where(
                    Subtask.task_id == task.id
                )
            )
        )


def create_subtask(task: Task, **kwargs) -> Subtask:
    from .. import engine, Subtask

    assert task.id is not None

    with Session(engine) as session:
        new_task_comment = Subtask(task_id=task.id, **kwargs)
        session.add(new_task_comment)
        session.commit()
        session.refresh(new_task_comment)

        return new_task_comment


def update_subtask(session: Session, subtask: Subtask, **kwargs) -> Subtask:
    subtask.sqlmodel_update(kwargs)
    session.add(subtask)
    session.commit()
    session.refresh(subtask)

    return subtask


def delete_subtask(session: Session, subtask: Subtask) -> None:
    session.delete(subtask)
    session.commit()
