from typing import TYPE_CHECKING
from sqlmodel import Session, select

if TYPE_CHECKING:
    from .. import User


def get_user_by_id(user_id: int | None) -> User | None:
    from .. import engine, User

    with Session(engine) as session:
        return session.exec(select(User).where(User.id == user_id)).first()


def get_user_by_username(username: str) -> User | None:
    from .. import engine, User

    with Session(engine) as session:
        return session.exec(select(User).where(User.username == username)).first()


def register_user(**kwargs) -> User:
    from .. import engine, User

    with Session(engine) as session:
        new_user = User(**kwargs)
        session.add(new_user)
        session.commit()
        session.refresh(new_user)

        return new_user


def update_user(session: Session, user: User, **kwargs) -> User:
    user.sqlmodel_update(kwargs)
    session.add(user)
    session.commit()
    session.refresh(user)

    return user
