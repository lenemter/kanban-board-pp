from pydantic import BaseModel, Field


class BoardPublic(BaseModel):
    id: int
    name: str
    owner_id: int
    is_public: bool


class BoardCreate(BaseModel):
    name: str


class BoardUpdate(BaseModel):
    name: str = Field(default=...)
    is_public: bool = Field(default=...)
