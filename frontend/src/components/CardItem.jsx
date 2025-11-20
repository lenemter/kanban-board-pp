import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

import { User, Clock, CheckSquare } from 'lucide-react'; 

function CardItem({ card, index, onOpenEdit }) {
  return (
    <Draggable draggableId={String(card.id)} index={index}>
      {(provided, snapshot) => (
        <div
          className={`card ${snapshot.isDragging ? 'dragging' : ''}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onDoubleClick={onOpenEdit}
        >
          <div className="card-title">{card.title}</div>
          <div className="card-desc">{card.description}</div>
          
          {(card.subtasks_total > 0) && (
            <div className="subtasks-wrap">
                <CheckSquare size={14} className="subtask-icon" />
                <div className="subtasks">{card.subtasks_done}/{card.subtasks_total} subtasks</div>
            </div>
          )}
          
          <div className="card-footer">
            <div className="card-left-meta">
                <div className={`chip priority-${card.priority?.toLowerCase() || 'low'}`}>{card.priority}</div>
            </div>

            <div className="meta">
                <span><User size={14} /> {card.assignee}</span>
                <span><Clock size={14} /> {card.due_date}</span>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default CardItem;