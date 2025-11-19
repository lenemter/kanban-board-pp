import React, { useState } from 'react';
import { initialUsers } from '../utils/usersData';
import { Plus, X } from 'lucide-react';

// Получаем имена пользователей
const userNames = initialUsers.map(user => user.name);

// TODO: добавить с бекенда
const initialSubtasks = [
    { id: 1, text: "Find relevant papers", done: true },
    { id: 2, text: "Read and analyze", done: false },
    { id: 3, text: "Write summary", done: false },
];
const initialComments = [
  // TODO: добавить с бекенда
];


function EditTaskModal({ card, onClose, onSave }) {
    const [title, setTitle] = useState(card.title || '');
    const [desc, setDesc] = useState(card.description || '');
    const [priority, setPriority] = useState(card.priority || 'Medium');
    const [assignee, setAssignee] = useState(card.assignee || '');
    const [dueDate, setDueDate] = useState(card.due_date || 'Oct 20');
    
    const [subtasks, setSubtasks] = useState(initialSubtasks);
    const [newSubtaskText, setNewSubtaskText] = useState('');
    const [comments, setComments] = useState(initialComments);
    const [newCommentText, setNewCommentText] = useState('');

    const handleSave = () => {
        // Логика сохранения
        onSave(card.id, { 
            title, 
            description: desc, 
            priority, 
            assignee, 
            due_date: dueDate,
        });
        onClose();
    };

    const handleAddSubtask = () => {
        if (newSubtaskText.trim()) {
            const newSubtask = {
                id: Date.now(),
                text: newSubtaskText.trim(),
                done: false,
            };
            setSubtasks([...subtasks, newSubtask]);
            setNewSubtaskText('');
        }
    };

    const handleToggleSubtask = (id) => {
        setSubtasks(subtasks.map(t => 
            t.id === id ? { ...t, done: !t.done } : t
        ));
    };
    
    const handleRemoveSubtask = (id) => {
        setSubtasks(subtasks.filter(t => t.id !== id));
    };

    const handleAddComment = () => {
        if (newCommentText.trim()) {
            const newComment = {
                id: Date.now(),
                user: "Current User",
                text: newCommentText.trim(),
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            };
            setComments([...comments, newComment]);
            setNewCommentText('');
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal task-details-modal" onClick={e => e.stopPropagation()}>
                
                <div className="modal-header">
                    <h3 className="modal-title">Task Details</h3>
                    <button className="icon-btn" onClick={onClose}>×</button>
                </div>
                
                <div className="task-title-input">
                    <input 
                        value={title} 
                        onChange={e => setTitle(e.target.value)} 
                        className="modal-title-edit"
                    />
                </div>

                <div className="task-meta-row">
                    <div className="meta-group">
                        <label>Priority</label>
                        <select value={priority} onChange={e => setPriority(e.target.value)}>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>

                    <div className="meta-group">
                        <label>Assignee</label>
                        <select value={assignee} onChange={e => setAssignee(e.target.value)}>
                            <option value="" disabled>Select assignee</option>
                            {userNames.map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="meta-group">
                        <label>Due Date</label>
                        <input 
                            type="text"
                            value={dueDate} 
                            onChange={e => setDueDate(e.target.value)}
                        />
                    </div>
                </div>

                <label>Description</label>
                <textarea 
                    value={desc} 
                    onChange={e => setDesc(e.target.value)} 
                    placeholder="Enter task description"
                />

                <h4 className="section-title">Subtasks</h4>
                <div className="subtasks-list">
                    {subtasks.map(sub => (
                        <div key={sub.id} className="subtask-item">
                            <input 
                                type="checkbox" 
                                checked={sub.done}
                                onChange={() => handleToggleSubtask(sub.id)}
                            />
                            <span className={sub.done ? 'subtask-done' : ''}>{sub.text}</span>
                            <button className="icon-btn remove-subtask-btn" onClick={() => handleRemoveSubtask(sub.id)}>
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="add-input-group">
                    <input 
                        value={newSubtaskText} 
                        onChange={e => setNewSubtaskText(e.target.value)} 
                        placeholder="Add a subtask..."
                        onKeyDown={(e) => {if (e.key === 'Enter') handleAddSubtask()}}
                    />
                    <button className="icon-btn add-btn" onClick={handleAddSubtask}>
                        <Plus size={18} />
                    </button>
                </div>

                <h4 className="section-title">Comments</h4>
                <div className="comments-section">
                    {comments.length === 0 ? (
                        <div className="no-comments-placeholder">No comments yet</div>
                    ) : (
                        <div className="comments-list">
                            {comments.map(c => (
                                <div key={c.id} className="comment-item">
                                    <span className="comment-user">{c.user}</span>
                                    <span className="comment-text">{c.text}</span>
                                    <span className="comment-date">{c.date}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                <div className="add-input-group comment-input-group">
                    <input 
                        value={newCommentText} 
                        onChange={e => setNewCommentText(e.target.value)} 
                        placeholder="Write a comment..."
                        onKeyDown={(e) => {if (e.key === 'Enter') handleAddComment()}}
                    />
                    <button className="icon-btn add-btn" onClick={handleAddComment}>
                        <Plus size={18} />
                    </button>
                </div>


                <div className="modal-actions">
                    <button className="btn ghost" onClick={onClose}>Cancel</button>
                    <button className="btn" onClick={handleSave}>Save Changes</button>
                </div>
            </div>
        </div>
    );
}

export default EditTaskModal;