import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Trash2, GripVertical, MoreVertical, Edit2 } from 'lucide-react';
import CardItem from './CardItem';

function Column({ 
  column, 
  cards, 
  index, 
  onOpenCreate, 
  onOpenEdit, 
  onRequestDelete,
  onRenameColumn,
  isReadOnly = false 
}) {
  const cardCount = cards.length;
  const [showMenu, setShowMenu] = React.useState(false);
  const [isRenaming, setIsRenaming] = React.useState(false);
  const [columnName, setColumnName] = React.useState(column.title);

  const handleRename = () => {
    if (columnName.trim() && columnName !== column.title) {
      onRenameColumn?.(column.id, columnName.trim());
    }
    setIsRenaming(false);
  };

  return (
    <Draggable 
      draggableId={`column-${column.id}`} 
      index={index}
      isDragDisabled={isReadOnly}
    >
      {(provided, snapshot) => (
        <div 
          className={`column ${snapshot.isDragging ? 'dragging' : ''}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.95 : 1,
          }}
        >
          <div className="column-header">
            <div 
              className="drag-handle" 
              {...provided.dragHandleProps}
              style={{ cursor: isReadOnly ? 'not-allowed' : 'grab' }}
            > 
              <GripVertical size={16} /> 
            </div>

            <div className="col-title-wrap">
              {isRenaming && !isReadOnly ? (
                <input
                  type="text"
                  value={columnName}
                  onChange={(e) => setColumnName(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename();
                    if (e.key === 'Escape') {
                      setColumnName(column.title);
                      setIsRenaming(false);
                    }
                  }}
                  autoFocus
                  style={{
                    background: 'var(--color-bg-base)',
                    border: '1px solid var(--color-accent)',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '15px',
                    fontWeight: '700',
                    color: 'var(--color-text-primary)',
                    width: '150px',
                  }}
                />
              ) : (
                <>
                  <div className="col-title">{column.title}</div>
                  <div className="col-count">{cardCount}</div>
                </>
              )}
            </div>

            <div className="col-actions">
              {!isReadOnly && (
                <>
                  <button className="icon-btn" onClick={onOpenCreate} title="Add task">
                    +
                  </button>
                  <div style={{ position: 'relative' }}>
                    <button 
                      className="icon-btn" 
                      onClick={() => setShowMenu(!showMenu)}
                      title="Column options"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {showMenu && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          zIndex: 100,
                          background: 'var(--color-panel)',
                          border: '1px solid var(--color-border-default)',
                          borderRadius: '8px',
                          marginTop: '4px',
                          boxShadow: '0 4px 12px var(--shadow-dark)',
                          minWidth: '160px',
                        }}
                      >
                        <button
                          className="icon-btn"
                          onClick={() => {
                            setIsRenaming(true);
                            setShowMenu(false);
                          }}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '10px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                          }}
                        >
                          <Edit2 size={14} />
                          Rename
                        </button>
                        <button
                          className="icon-btn"
                          onClick={() => {
                            onRequestDelete?.();
                            setShowMenu(false);
                          }}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '10px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: 'var(--color-danger)',
                            fontSize: '14px',
                          }}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <Droppable droppableId={`column-${column.id}`} type="task">
            {(provided, snapshot) => (
              <div 
                ref={provided.innerRef} 
                {...provided.droppableProps} 
                className={`column-body ${snapshot.isDraggingOver ? 'over' : ''}`}
                style={{
                  minHeight: snapshot.isDraggingOver ? '100px' : '50px',
                  position: 'relative',
                }}
              >
                {cards.length === 0 && !snapshot.isDraggingOver && (
                  <div
                    style={{
                      padding: '20px',
                      textAlign: 'center',
                      color: 'var(--color-text-muted)',
                      fontSize: '13px',
                    }}
                  >
                    {isReadOnly ? 'No tasks' : 'Drop tasks here or click + to add'}
                  </div>
                )}
                {cards.map((card, idx) => (
                  <CardItem 
                    key={card.id} 
                    card={card} 
                    index={idx} 
                    onOpenEdit={() => onOpenEdit(card.id)}
                    isReadOnly={isReadOnly}
                  />
                ))}
                {provided.placeholder}
                {snapshot.isDraggingOver && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      border: '2px dashed var(--color-accent)',
                      borderRadius: '12px',
                      pointerEvents: 'none',
                      background: 'rgba(var(--color-accent), 0.05)',
                    }}
                  />
                )}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
}

export default Column;