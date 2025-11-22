from typing import TYPE_CHECKING

from sqlmodel import Session, func, select

if TYPE_CHECKING:
    from .. import Board, BoardUserAccess, User


def get_owned_boards(user_id: int | None) -> list[Board]:
    from .. import engine, Board

    with Session(engine) as session:
        return list(
            session.exec(
                select(Board).where(
                    Board.owner_id == user_id
                )
            ).all()
        )


def get_shared_boards(user_id: int | None) -> list[Board]:
    from .. import engine, Board, BoardUserAccess

    with Session(engine) as session:
        shared = list(
            session.exec(
                select(Board)
                .join(BoardUserAccess)
                .where(BoardUserAccess.user_id == user_id)
            ).all()
        )

        return get_owned_boards(user_id) + shared


def create_board(owner: User, **kwargs) -> Board:
    from .. import engine, Board

    assert owner.id is not None

    with Session(engine) as session:
        new_board = Board(owner_id=owner.id, **kwargs)
        session.add(new_board)
        session.commit()
        session.refresh(new_board)

        return new_board


def get_n_columns(board: Board) -> int:
    from .. import engine, Column

    with Session(engine) as session:
        return session.exec(select(func.count()).select_from(Column).where(Column.board_id == board.id)).one()


def get_n_tasks(board: Board) -> int:
    from .. import engine, Column, Task

    with Session(engine) as session:
        statement = (
            select(func.count(Task.id))  # type: ignore
            .select_from(Task)
            .join(Column, Column.id == Task.column_id)  # type: ignore
            .where(Column.board_id == board.id)
        )

        return session.exec(statement).one()


def update_board(session: Session, board: Board, **kwargs) -> Board:
    board.sqlmodel_update(kwargs)
    session.add(board)
    session.commit()
    session.refresh(board)

    return board


def get_board_users(session: Session, board: Board) -> list[User]:
    from .. import BoardUserAccess, User

    assert board.owner_id is not None

    board_user_accesses = session.exec(
        select(BoardUserAccess).where(
            BoardUserAccess.board_id == board.id
        )
    ).all()

    owner = session.get(User, board.owner_id)
    assert owner is not None

    users: list[User] = [owner]
    for bua in board_user_accesses:
        user = session.get(User, bua.user_id)
        if user is not None:
            users.append(user)

    return users


def add_user_to_board(session: Session, board: Board, user: User) -> BoardUserAccess:
    from .. import BoardUserAccess

    assert board.id is not None and user.id is not None

    board_user_access = BoardUserAccess(board_id=board.id, user_id=user.id)
    session.add(board_user_access)
    session.commit()
    session.refresh(board_user_access)

    return board_user_access


def get_board_user_access(session: Session, board: Board, user: User) -> BoardUserAccess | None:
    return session.get(BoardUserAccess, (board.id, user.id))
