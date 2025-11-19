import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import CardItem from './CardItem';

function Column({ column, cards, onOpenCreate, onOpenEdit }) {
  // Получаем количество карточек в этой колонке
  const cardCount = cards.length; 

  return (
    <div className="column">
      <div className="column-header">
        <div className="col-title-wrap">
        <div className="col-title">{column.title}</div>
          <div className="col-count">{cardCount}</div> 
        </div>

        <div className="col-actions">
          <button className="icon-btn" onClick={onOpenCreate}>+</button>
        </div>
      </div>

      <Droppable droppableId={column.id}>
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
  );
}

export default Column;