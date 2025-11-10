from typing import TYPE_CHECKING

from sqlmodel import Session

if TYPE_CHECKING:
    from .. import Board, BoardUserAccess, BoardTag, Column, Task, TaskComment, Subtask, TaskTag


def delete_object(
    session: Session,
    obj: Board | BoardUserAccess | BoardTag | Column | Task | TaskComment | Subtask | TaskTag
) -> None:
    session.delete(obj)
    session.commit()
