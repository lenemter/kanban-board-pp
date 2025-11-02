from typing import TYPE_CHECKING, Any

from sqlmodel import Session, select

if TYPE_CHECKING:
    from .. import User, UserDB


def _get_user_db_by_id(session: Session, user_id: int) -> UserDB:
    user_db = session.get(UserDB, user_id)
    if (user_db is None):
        raise ValueError(f"Board with id {user_id} not found")

    return user_db


def get_user_by_id(user_id: int | None) -> User | None:
    from .. import engine, User, UserDB

    with Session(engine) as session:
        user_db = session.exec(select(UserDB).where(UserDB.id == user_id)).first()
        if user_db is None:
            return None

        return User.model_validate(user_db)


def get_user_by_username(username: str) -> User | None:
    from .. import engine, User, UserDB

    with Session(engine) as session:
        user_db = session.exec(select(UserDB).where(UserDB.username == username)).first()
        if user_db is None:
            return None

        return User.model_validate(user_db)


def register_user(**kwargs) -> User:
    from .. import engine, User, UserDB

    with Session(engine) as session:
        new_user = UserDB(**kwargs)
        session.add(new_user)
        session.commit()
        session.refresh(new_user)

        return User.model_validate(new_user)


def update_user(session: Session, user: User, update: dict[str, Any]) -> User:
    user_db = _get_user_db_by_id(session, user.id)
    user_db.sqlmodel_update(update)
    session.add(user_db)
    session.commit()
    session.refresh(user_db)

    return User.model_validate(user_db)
