from pydantic import BaseModel, Field


class ColumnPublic(BaseModel):
    id: int
    position: int
    name: str
    tasks_limit: int | None


class ColumnCreate(BaseModel):
    name: str


class ColumnUpdate(BaseModel):
    position: int = Field(default=...)
    name: str = Field(default=...)
    tasks_limit: int | None = Field(default=...)
