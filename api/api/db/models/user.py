import uuid

from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(unique=True)
    name: str = Field()
    hashed_password: str = Field()
    is_verified: bool = Field(default=False)
    verification_token: str | None = Field(default_factory=lambda: str(uuid.uuid4()))
