import React, { useState } from 'react';
import { initialUsers } from '../utils/usersData';


// Извлекаем имена пользователей
const userNames = initialUsers.map(user => user.name);


function CreateTaskModal({ onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleCreate = () => {
    if (!title.trim() || !assignee || !dueDate) {
      alert('Пожалуйста, заполните все обязательные поля (Title, Assignee, Due Date).');
      return;
    }

    onCreate('col-1', {
      title,
      description: desc,
      priority,
      assignee,
      due_date: dueDate,
      subtasks_total: 0,
      subtasks_done: 0
    });
    onClose();
  };


  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>

        {/* Шапка модального окна */}
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
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>

        <label>Assignee*</label>
        <select
          value={assignee}
          onChange={e => setAssignee(e.target.value)}
        >
          <option value="" disabled>Select assignee</option>
          {/* Перебираем имена пользователей из файла users.js */}
          {userNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        <label>Due Date*</label>
        <input
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          placeholder="e.g, Oct 20"
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