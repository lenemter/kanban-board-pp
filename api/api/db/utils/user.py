from typing import TYPE_CHECKING, Union

from sqlmodel import Session, select

if TYPE_CHECKING:
    from .. import User


# "User" | None doesn't work even in python 3.13 ¯\_(ツ)_/¯
def get_user_by_username(username: str) -> Union["User", None]:
    from .. import engine, User

    with Session(engine) as session:
        return session.exec(select(User).where(User.username == username)).first()


def register_user(**kwargs) -> "User":
    from .. import engine, User

    with Session(engine) as session:
        new_user = User(**kwargs)
        session.add(new_user)
        session.commit()
        session.refresh(new_user)

        return new_user
