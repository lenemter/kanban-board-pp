from typing import TYPE_CHECKING

from sqlmodel import Session, select

if TYPE_CHECKING:
    from .. import Board, BoardTag


def get_board_tags(board: Board) -> list[BoardTag]:
    from .. import engine, BoardTag

    with Session(engine) as session:
        return list(
            session.exec(
                select(BoardTag).where(
                    BoardTag.board_id == board.id
                )
            ).all()
        )


def create_board_tag(board: Board, **kwargs) -> BoardTag:
    from .. import engine, BoardTag

    assert board.id is not None

    with Session(engine) as session:
        new_tag = BoardTag(board_id=board.id, **kwargs)
        session.add(new_tag)
        session.commit()
        session.refresh(new_tag)

        return new_tag


def update_board_tag(session: Session, tag: BoardTag, **kwargs) -> BoardTag:
    tag.sqlmodel_update(kwargs)
    session.add(tag)
    session.commit()
    session.refresh(tag)

    return tag


def delete_board_tag(session: Session, tag: BoardTag) -> None:
    session.delete(tag)
    session.commit()
