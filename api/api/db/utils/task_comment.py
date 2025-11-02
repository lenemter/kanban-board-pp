from typing import TYPE_CHECKING

from sqlmodel import Session, select

if TYPE_CHECKING:
    from .. import User, Task, TaskComment


def get_task_comments(task: Task) -> list[TaskComment]:
    from .. import engine, TaskComment

    with Session(engine) as session:
        return list(
            session.exec(
                select(TaskComment).where(
                    TaskComment.task_id == task.id
                )
            )
        )


def create_task_comment(task: Task, author: User, **kwargs) -> TaskComment:
    from .. import engine, TaskComment

    assert task.id is not None
    assert author.id is not None

    with Session(engine) as session:
        new_task_comment = TaskComment(task_id=task.id, created_by=author.id, **kwargs)
        session.add(new_task_comment)
        session.commit()
        session.refresh(new_task_comment)

        return new_task_comment


def update_task_comment(session: Session, task_comment: TaskComment, **kwargs) -> TaskComment:
    task_comment.sqlmodel_update(kwargs)
    session.add(task_comment)
    session.commit()
    session.refresh(task_comment)

    return task_comment


def delete_task_comment(session: Session, task_comment: TaskComment) -> None:
    session.delete(task_comment)
    session.commit()
