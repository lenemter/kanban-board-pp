from typing import TYPE_CHECKING

from sqlmodel import Session, select

if TYPE_CHECKING:
    from .. import Task, Subtask


def get_subtasks(session: Session, task: Task) -> list[Subtask]:
    from .. import Subtask

    return list(
        session.exec(
            select(Subtask).where(
                Subtask.task_id == task.id
            )
        )
    )


def create_subtask(session: Session, task: Task, **kwargs) -> Subtask:
    from .. import Subtask

    assert task.id is not None

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
