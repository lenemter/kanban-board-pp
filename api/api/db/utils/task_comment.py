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


def create_task_comment(task: Task, author: User | None, **kwargs) -> TaskComment:
    from .. import engine, TaskComment

    assert task.id is not None

    created_by = author.id if author is not None else None

    with Session(engine) as session:
        new_task_comment = TaskComment(task_id=task.id, author=created_by, **kwargs)
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
