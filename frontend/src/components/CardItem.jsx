import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

import { User, Clock, CheckSquare } from 'lucide-react'; 

const PRIORITY_MAP = {
  'Low': 1,
  'Medium': 2,
  'High': 3,
};

function ToDifficultyString(priorityId) {
  for (const [key, value] of Object.entries(PRIORITY_MAP)) {
    if (value === priorityId) {
      return key;
    }
  }
  return 'Medium';
}

function CardItem({ card, index, onOpenEdit }) {
  const formatDate = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    if (!isNaN(dt)) {
      // Format like "Oct 20"
      return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return d;
  };

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
                <div className={`chip priority-${ToDifficultyString(card.priority)?.toLowerCase() || 'low'}`}>{ToDifficultyString(card.priority)}</div>
            </div>

            <div className="meta">
                <span><User size={14} /> {card.assignee_name || card.assignee_id || ''}</span>
                <span><Clock size={14} /> {formatDate(card.due_date)}</span>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default CardItem;