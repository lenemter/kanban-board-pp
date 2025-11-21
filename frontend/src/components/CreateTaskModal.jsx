import React, { useState } from 'react';

// Константы для маппинга приоритетов
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
    if (!title.trim() || !assignee || !dueDate) {
      alert('Пожалуйста, заполните все обязательные поля (Title, Assignee, Due Date).');
      return;
    }


    const priorityId = PRIORITY_MAP[priority] || PRIORITY_MAP[DEFAULT_PRIORITY_STRING];

    const assigneeIdNumber = parseInt(assignee,10);
    console.log(`assigneeIdNumber: ${assigneeIdNumber}`, typeof assigneeIdNumber); // Debug i
    if (isNaN(assigneeIdNumber)) {
      console.error('Ошибка: assignee ID не является числом или пуст.');
      alert('Неверный ID исполнителя.');
      return;
    }

    onCreate(Number(currentColumnId), {
      title,
      description: desc,
      priority: priorityId,
      assignee_id: assigneeIdNumber ?? 2, 
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

        <label>Assignee*</label>
        <select
          value={assignee}
          onChange={e => setAssignee(e.target.value)}
        >
          <option value="" disabled>Select assignee</option>
          {users.map(u => {
            const uid = u.id ?? u.user_id ?? u._id ?? u.email ?? u.username ?? u.name ?? u.full_name ?? u.display_name;
            const label = u.name ?? u.full_name ?? u.display_name ?? u.username ?? u.email ?? uid;
            return (
              <option key={uid} value={uid}>{label}</option>
            );
          })}
        </select>

        <label>Due Date*</label>
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
        />

        <div className="modal-actions">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={handleCreate}>Create Task</button>
        </div>
      </div>
    </div>
  );
}

export default CreateTaskModal;