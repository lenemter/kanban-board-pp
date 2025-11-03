from pydantic import BaseModel


class TaskTagPublic(BaseModel):
    id: int
    tag_id: int


class TaskTagCreate(BaseModel):
    tag_id: int
