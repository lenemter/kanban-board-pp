from datetime import datetime

from sqlmodel import Field, SQLModel


class TaskComment(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    task_id: int = Field(foreign_key="task.id", ondelete="CASCADE")
    content: str = Field()
    created_at: datetime = Field(default_factory=datetime.now)
    created_by: int | None = Field(default=None, foreign_key="user.id")
