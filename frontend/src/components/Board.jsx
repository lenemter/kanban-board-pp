import React, { useState } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd'; 
import Column from './Column';
import apiClient from '../api';

function Board({ 
  board, 
  onMoveLocal, 
  onOpenCreate, 
  onOpenEdit, 
  onOpenCreateColumn, 
  onRequestDeleteColumn,
  currentBoardId,
  onReloadBoard 
}) {
  const [isDraggingColumn, setIsDraggingColumn] = useState(false);
  
  const getCardsForColumn = (col) => {
    return col.card_ids.map(id => board.cards.find(c => String(c.id) === String(id))).filter(Boolean);
  };

  const calculateNewPosition = (columnCards, destinationIndex) => {
    if (columnCards.length === 0) return 0;
    
    if (destinationIndex === 0) {
      return columnCards[0].position - 1;
    } else if (destinationIndex >= columnCards.length) {
      return columnCards[columnCards.length - 1].position + 1;
    } else {
      const prevPosition = columnCards[destinationIndex - 1].position;
      const nextPosition = columnCards[destinationIndex].position;
      return (prevPosition + nextPosition) / 2;
    }
  };

  const onDragStart = (start) => {
    // Определяем, началось ли перетаскивание колонки
    if (start.type === 'column') {
      setIsDraggingColumn(true);
    }
  };

  const onDragEnd = async (result) => {
    setIsDraggingColumn(false);
    
    const { destination, source, draggableId, type } = result;
    
    if (!destination) return;

    // Обработка перемещения колонок
    if (type === 'column') {
      if (destination.droppableId === source.droppableId && destination.index === source.index) return;

      const newBoard = JSON.parse(JSON.stringify(board));
      const newColumnOrder = Array.from(newBoard.columns);
      
      const columnId = parseInt(draggableId.replace('column-', ''));
      const sourceIndex = newColumnOrder.findIndex(col => col.id === columnId);
      
      if (sourceIndex === -1) return;
      
      const [movedColumn] = newColumnOrder.splice(sourceIndex, 1);
      newColumnOrder.splice(destination.index, 0, movedColumn);
      
      newBoard.columns = newColumnOrder;
      onMoveLocal(newBoard);

      try {
        let before_id = null;
        let after_id = null;

        if (destination.index > 0) {
          before_id = newColumnOrder[destination.index - 1].id;
        }
        if (destination.index < newColumnOrder.length - 1) {
          after_id = newColumnOrder[destination.index + 1].id;
        }

        await apiClient.moveColumn(columnId, {
          before_id,
          after_id
        });
      } catch (error) {
        console.error('Failed to persist column move:', error);
        if (onReloadBoard) onReloadBoard();
      }
      return;
    }

    // Обработка перемещения задач
    if (type === 'task') {
      if (destination.droppableId === source.droppableId && destination.index === source.index) return;

      const taskId = parseInt(draggableId.replace('task-', ''));
      const sourceColId = parseInt(source.droppableId.replace('column-', ''));
      const destColId = parseInt(destination.droppableId.replace('column-', ''));

      const newBoard = JSON.parse(JSON.stringify(board));

      const sourceCol = newBoard.columns.find(c => c.id === sourceColId);
      const destCol = newBoard.columns.find(c => c.id === destColId);

      if (!sourceCol || !destCol) {
        console.error('Column not found', { sourceColId, destColId });
        return;
      }

      const destColumnCards = board.cards.filter(card => card.columnId === destColId)
        .sort((a, b) => a.position - b.position);
      
      const newPosition = calculateNewPosition(destColumnCards, destination.index);

      sourceCol.card_ids = sourceCol.card_ids.filter(id => Number(id) !== taskId);
      destCol.card_ids.splice(destination.index, 0, taskId);

      const movedCard = newBoard.cards.find(c => Number(c.id) === taskId);
      if (movedCard) {
        movedCard.columnId = destColId;
        movedCard.position = newPosition;
      }

      onMoveLocal(newBoard);

      try {
        // compute before/after based on the updated destCol.card_ids in newBoard
        const insertedIndex = destCol.card_ids.findIndex(id => Number(id) === taskId);
        let before_id = null;
        let after_id = null;
        if (insertedIndex > 0) {
          before_id = Number(destCol.card_ids[insertedIndex - 1]);
        }
        if (insertedIndex >= 0 && insertedIndex < destCol.card_ids.length - 1) {
          after_id = Number(destCol.card_ids[insertedIndex + 1]);
        }

        // pass before_id and after_id to the API so it knows which tasks this one was moved between
        await apiClient.moveTask(taskId, destColId, before_id, after_id);
      } catch (error) {
        console.error('Failed to persist task move:', error);
        if (onReloadBoard) onReloadBoard();
      }
    }
  };

  return (
    <div className="board-wrap">
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <Droppable droppableId="board-columns" direction="horizontal" type="column">
          {(provided, snapshot) => (
            <div 
              className={`columns ${isDraggingColumn ? 'column-dragging' : ''} ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
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

              <div
                className={`column add-column ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
                role="button"
                tabIndex={0}
                onClick={onOpenCreateColumn}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onOpenCreateColumn();
                  }
                }}
              >
                <div className="add-column-button">+ Add Column</div>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default Board;