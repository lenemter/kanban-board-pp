from pydantic import BaseModel, Field


class BoardTagPublic(BaseModel):
    id: int
    name: str
    color: str


class BoardTagCreate(BaseModel):
    name: str
    color: str


class BoardTagUpdate(BaseModel):
    name: str = Field(default=...)
    color: str = Field(default=...)
