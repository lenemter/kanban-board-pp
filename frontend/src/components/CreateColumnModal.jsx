import React, { useState } from 'react';

function CreateColumnModal({ onClose, onCreate }) {
  const [columnName, setColumnName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!columnName.trim()) {
      setError("Column name cannot be empty.");
      return;
    }
    
    setError(null);
    setLoading(true);
    
    try {
      await onCreate(columnName.trim());
      
    } catch (err) {
      setError(err.message || "Failed to create column.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Create New Column</h3>
          <button className="icon-btn" onClick={onClose} disabled={loading}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          
          <label>Column Name*</label>
          <input
            type="text"
            value={columnName}
            onChange={e => setColumnName(e.target.value)}
            disabled={loading}
            placeholder="E.g.: To Do, In Progress"
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
              disabled={loading || !columnName.trim()}
            >
              {loading ? 'Creating...' : 'Create Column'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateColumnModal;