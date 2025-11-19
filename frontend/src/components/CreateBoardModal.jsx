import React, { useState } from 'react';

function CreateBoardModal({ onClose, onCreate }) {
  const [boardName, setBoardName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!boardName.trim()) {
      setError("Название доски не может быть пустым.");
      return;
    }
    
    setError(null);
    setLoading(true);
    
    try {
      await onCreate(boardName.trim());
      
    } catch (err) {
      console.error("Board creation failed:", err);
      setError(err.message || "Could not create board. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>

        {/* Шапка модального окна */}
        <div className="modal-header">
          <h3 className="modal-title">Create New Board</h3>
          <button className="icon-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          
          <label>Board Name*</label>
          <input
            type="text"
            value={boardName}
            onChange={e => setBoardName(e.target.value)}
            disabled={loading}
            placeholder="For example: Project Alpha"
            required
          />
          
          {error && <p className="error-message" style={{color: 'red', marginTop: '10px'}}>{error}</p>}

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn ghost" 
              onClick={onClose} 
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn" 
              disabled={loading || !boardName.trim()}
            >
              {loading ? 'Creating...' : 'Create Board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateBoardModal;