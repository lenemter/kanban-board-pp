import React from 'react';

function ConfirmModal({ title = 'Confirm', message = 'Are you sure?', onCancel, onConfirm }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal small" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="icon-btn" onClick={onCancel}>×</button>
        </div>

        <div style={{ padding: '8px 0 12px', color: 'var(--muted)' }}>{message}</div>

        <div className="modal-actions">
          <button className="btn ghost" onClick={onCancel}>Cancel</button>
          <button className="btn" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
