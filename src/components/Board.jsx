import React from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import Column from './Column';

function Board({ board, onMoveLocal, onOpenCreate, onOpenEdit }) {
  const getCardsForColumn = (col) => {
    return col.card_ids.map(id => board.cards.find(c => c.id === id)).filter(Boolean);
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newBoard = JSON.parse(JSON.stringify(board));
    const sourceCol = newBoard.columns.find(c => c.id === source.droppableId);
    const destCol = newBoard.columns.find(c => c.id === destination.droppableId);

    sourceCol.card_ids.splice(source.index, 1);
    destCol.card_ids.splice(destination.index, 0, draggableId);

    onMoveLocal(newBoard);

    // TODO: добавить бекенд
  };

  return (
    <div className="board-wrap">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="columns">
          {board.columns.map(col => (
            <Column
              key={col.id}
              column={col}
              cards={getCardsForColumn(col)}
              onOpenCreate={() => onOpenCreate(col.id)}
              onOpenEdit={onOpenEdit}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

export default Board;