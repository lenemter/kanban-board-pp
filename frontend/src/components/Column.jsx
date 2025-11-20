import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Trash2, GripVertical } from 'lucide-react'; 
import CardItem from './CardItem';

function Column({ column, cards, index, onOpenCreate, onOpenEdit, onRequestDelete }) {
  const cardCount = cards.length; 

  return (
    // Draggable для колонки: column.id (число) преобразуем в строку
    <Draggable draggableId={String(column.id)} index={index} type="column">
      {(provided) => (
        <div 
          className="column"
          ref={provided.innerRef} 
          {...provided.draggableProps} 
        >
          <div className="column-header">
            
            <div 
              className="drag-handle" 
              {...provided.dragHandleProps} 
            > 
              <GripVertical size={16} /> 
            </div>

            <div className="col-title-wrap">
              <div className="col-title">{column.title}</div>
              <div className="col-count">{cardCount}</div> 
            </div>

            <div className="col-actions">
              <button className="icon-btn" onClick={onOpenCreate}>+</button>
              <button className="icon-btn" title={`Delete ${column.title}`} onClick={() => onRequestDelete && onRequestDelete() }>
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <Droppable droppableId={String(column.id)} type="card">
            {(provided, snapshot) => (
              <div 
                ref={provided.innerRef} 
                {...provided.droppableProps} 
                className={`column-body ${snapshot.isDraggingOver ? 'over' : ''}`}
              >
                {cards.map((card, idx) => (
                  <CardItem key={card.id} card={card} index={idx} onOpenEdit={() => onOpenEdit(card.id)} />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
}

export default Column;