import React from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd'; 
import Column from './Column';

function Board({ board, onMoveLocal, onTaskMove, onOpenCreate, onOpenEdit, onOpenCreateColumn, onRequestDeleteColumn }) {
  const getCardsForColumn = (col) => {
    return col.card_ids.map(id => board.cards.find(c => String(c.id) === String(id))).filter(Boolean);
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

    const taskId = Number(draggableId);
    const sourceColId = Number(source.droppableId);
    const destColId = Number(destination.droppableId);

    const sourceCol = newBoard.columns.find(c => c.id === sourceColId);
    const destCol = newBoard.columns.find(c => c.id === destColId);

    if (!sourceCol || !destCol) {
      console.error('Column not found', { sourceColId, destColId });
      return;
    }

    sourceCol.card_ids = sourceCol.card_ids.filter(id => Number(id) !== taskId);
    
    destCol.card_ids.splice(destination.index, 0, taskId);

    const movedCard = newBoard.cards.find(c => Number(c.id) === taskId);
    if (movedCard) {
      movedCard.columnId = destColId;
    }

    onMoveLocal(newBoard);

    if (typeof onTaskMove === 'function') {
      try {
        onTaskMove(taskId, destColId, destination.index);
      } catch (err) {
        console.error('onTaskMove handler failed', err);
      }
    }
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