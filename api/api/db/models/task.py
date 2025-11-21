from datetime import datetime, date

from sqlmodel import Field, SQLModel, Relationship

from api.schemas.task import Priority


class Task(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    column_id: int = Field(foreign_key="column.id", ondelete="CASCADE")
    position: int = Field()
    title: str = Field()
    description: str | None = Field()
    priority: Priority | None = Field()
    assignee_id: int | None = Field(foreign_key="user.id")
    due_date: date | None = Field()
    created_at: datetime = Field(default_factory=datetime.now)
    author: int = Field(foreign_key="user.id")
    tags: list["TaskTag"] = Relationship(back_populates="task", sa_relationship_kwargs={"lazy": "selectin"})


class TaskTag(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    task_id: int = Field(foreign_key="task.id", ondelete="CASCADE")
    tag_id: int = Field(foreign_key="boardtag.id", ondelete="CASCADE")

    task: Task | None = Relationship(back_populates="tags")
