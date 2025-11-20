import React from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd'; 
import Column from './Column';

function Board({ board, onMoveLocal, onOpenCreate, onOpenEdit, onOpenCreateColumn, onRequestDeleteColumn }) {
  const getCardsForColumn = (col) => {
    return col.card_ids.map(id => board.cards.find(c => c.id === id)).filter(Boolean);
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId, type } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newBoard = JSON.parse(JSON.stringify(board));

    if (type === 'column') {
      const newColumnOrder = Array.from(newBoard.columns);
      const [movedColumn] = newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, movedColumn);
      
      newBoard.columns = newColumnOrder;
      onMoveLocal(newBoard);
      return;
    }

    const sourceCol = newBoard.columns.find(c => String(c.id) === source.droppableId);
    const destCol = newBoard.columns.find(c => String(c.id) === destination.droppableId);
    
    sourceCol.card_ids.splice(source.index, 1);
    destCol.card_ids.splice(destination.index, 0, Number(draggableId));

    onMoveLocal(newBoard);

    // TODO: добавить бекенд API-вызов для обновления позиции
  };

  return (
    <div className="board-wrap">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board-columns" direction="horizontal" type="column">
          {(provided) => (
            <div 
              className="columns"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {board.columns.map((col, index) => (
                <Column
                  key={col.id}
                  column={col}
                  cards={getCardsForColumn(col)}
                  index={index} 
                  onOpenCreate={() => onOpenCreate(col.id)}
                  onOpenEdit={onOpenEdit}
                  onRequestDelete={() => onRequestDeleteColumn && onRequestDeleteColumn(col.id, col.title)}
                />
              ))}
              
              {provided.placeholder}

              <div className="column add-column">
                <button
                  className="btn primary"
                  onClick={onOpenCreateColumn}
                >
                  + Add Column
                </button>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default Board;