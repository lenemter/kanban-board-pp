import React, { useState } from 'react';

// Constants for priority mapping
const PRIORITY_MAP = {
  'Low': 1,
  'Medium': 2,
  'High': 3,
};
const DEFAULT_PRIORITY_STRING = 'Medium';


function CreateTaskModal({ onClose, onCreate, boardUsers = [], currentColumnId }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState(DEFAULT_PRIORITY_STRING);
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');

  const users = boardUsers || [];

  const handleCreate = () => {
    if (!title.trim()) {
      alert('Please fill in the title field.');
      return;
    }

    const priorityId = PRIORITY_MAP[priority] || PRIORITY_MAP[DEFAULT_PRIORITY_STRING];

    let assigneeIdNumber = null;
    if (assignee) {
      assigneeIdNumber = parseInt(assignee, 10);
      console.log(`assigneeIdNumber: ${assigneeIdNumber}`, typeof assigneeIdNumber); // Debug
      if (isNaN(assigneeIdNumber)) {
        console.error('Error: assignee ID is not a number.');
        alert('Invalid assignee ID.');
        return;
      }
    }

    onCreate(Number(currentColumnId), {
      title,
      description: desc,
      priority: priorityId,
      assignee_id: assigneeIdNumber,
      due_date: dueDate || null,
    });
    onClose();
  };


  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <h3 className="modal-title">Create new task</h3>
          <button className="icon-btn" onClick={onClose}>×</button>
        </div>
        <div className="account-content-scroll">
          <label>Title*</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Enter task title"
          />

          <label>Description</label>
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Enter task description"
          />

          <label>Priority</label>
          <select value={priority} onChange={e => setPriority(e.target.value)}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <label>Assignee</label>
          <select
            value={assignee}
            onChange={e => setAssignee(e.target.value)}
          >
            <option value="">Unassigned</option>
            {users.map(u => {
              const uid = u.id ?? u.user_id ?? u._id ?? u.email ?? u.username ?? u.name ?? u.full_name ?? u.display_name;
              const label = u.name ?? u.full_name ?? u.display_name ?? u.username ?? u.email ?? uid;
              return (
                <option key={uid} value={uid}>{label}</option>
              );
            })}
          </select>

          <label>Due Date</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              style={{ flex: 1 }}
            />
            {dueDate && (
              <button
                className="icon-btn"
                onClick={() => setDueDate('')}
                title="Remove due date"
                style={{ padding: '4px 8px' }}
              >
                ×
              </button>
            )}
          </div>

          <div className="modal-actions">
            <button className="btn ghost" onClick={onClose}>Cancel</button>
            <button className="btn" onClick={handleCreate}>Create Task</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateTaskModal;