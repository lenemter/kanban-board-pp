// frontend/src/components/EditTaskModal.jsx
import React, { useState, useEffect } from 'react';
import { Plus, X, Eye } from 'lucide-react';
import apiClient from '../api';

const PRIORITY_MAP = {
    'Low': 1,
    'Medium': 2,
    'High': 3,
};
const PRIORITY_ID_MAP = {
    1: 'Low',
    2: 'Medium',
    3: 'High',
};
const DEFAULT_PRIORITY_STRING = 'Medium';


function EditTaskModal({ card, onClose, onSave, boardUsers = [], currentUserId, isReadOnly = false }) {

    const initialPriorityString = PRIORITY_ID_MAP[card.priority] || DEFAULT_PRIORITY_STRING;
    const initialAssigneeId = card.assignee_id || '';

    const [title, setTitle] = useState(card.title || '');
    const [desc, setDesc] = useState(card.description || '');
    const [priority, setPriority] = useState(initialPriorityString);
    const [assigneeId, setAssigneeId] = useState(initialAssigneeId);
    const [dueDate, setDueDate] = useState(card.due_date ? card.due_date.substring(0, 10) : '');

    const [subtasks, setSubtasks] = useState([]);
    const [comments, setComments] = useState([]);

    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [newCommentText, setNewCommentText] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const users = boardUsers || [];

    const userMap = users.length > 0 ?
        Object.fromEntries(users.map(u => [
            u.id,
            u.name && u.name.trim() !== '' ? u.name : u.email
        ]))
        : {};

    const getUserName = (userId) => userMap[userId] || 'System';
    const currentUserName = getUserName(currentUserId);


    useEffect(() => {
        const loadTaskDetails = async () => {
            setLoading(true);
            setError('');
            try {
                const subtasksResponse = await apiClient.getSubtasks(card.id);
                const formattedSubtasks = subtasksResponse.map(s => ({
                    id: s.id,
                    text: s.title,
                    done: s.is_done,
                }));
                setSubtasks(formattedSubtasks);

                const commentsResponse = await apiClient.getTaskComments(card.id);
                const formattedComments = commentsResponse.map(c => ({
                    id: c.id,
                    user: c.author ? getUserName(c.author) : 'System',
                    text: c.content,
                    date: new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                }));
                setComments(formattedComments.reverse());

            } catch (err) {
                console.error("Failed to load task details:", err);
                setError(err.message || 'Failed to load task details (Subtasks/Comments).');
            } finally {
                setLoading(false);
            }
        };

        loadTaskDetails();
    }, [card.id, users]);


    const handleSave = async () => {
        if (isSaving || isReadOnly) return;

        setIsSaving(true);
        setError('');

        const priorityId = PRIORITY_MAP[priority];
        const assigneeIdNumber = assigneeId ? Number(assigneeId) : null;

        if (isNaN(priorityId)) {
            setError('Invalid priority selected.');
            setIsSaving(false);
            return;
        }

        const updateData = {
            title,
            description: desc,
            priority: priorityId,
            assignee_id: assigneeIdNumber,
            due_date: dueDate || null,
        };

        try {
            await apiClient.updateTask(card.id, updateData);

            onSave(card.id, updateData);
            onClose();

        } catch (err) {
            console.error('Task update failed:', err);
            setError(err.message || 'Failed to save changes.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddSubtask = async () => {
        if (newSubtaskTitle.trim() === '' || isSaving || isReadOnly) return;

        try {
            const newSubtask = await apiClient.createSubtask(card.id, newSubtaskTitle.trim());

            setSubtasks(prev => [...prev, {
                id: newSubtask.id,
                text: newSubtask.title,
                done: newSubtask.is_done,
            }]);
            setNewSubtaskTitle('');
        } catch (err) {
            console.error('Failed to add subtask:', err);
            setError('Failed to add subtask.');
        }
    };

    const handleToggleSubtask = async (subtaskId, currentDoneStatus) => {
        if (isReadOnly) return;
        
        const newDoneStatus = !currentDoneStatus;

        const subtaskToUpdate = subtasks.find(t => t.id === subtaskId);
        if (!subtaskToUpdate) {
            console.error('Subtask not found for ID:', subtaskId);
            return;
        }

        const updatePayload = {
            is_done: newDoneStatus,
            title: subtaskToUpdate.text
        };

        setSubtasks(prev => prev.map(t =>
            t.id === subtaskId ? { ...t, done: newDoneStatus } : t
        ));

        try {
            await apiClient.updateSubtask(subtaskId, updatePayload);
        } catch (err) {
            console.error('Failed to toggle subtask:', err);
            setError('Failed to update subtask status.');
            setSubtasks(prev => prev.map(t =>
                t.id === subtaskId ? { ...t, done: !newDoneStatus } : t
            ));
        }
    };

    const handleRemoveSubtask = async (subtaskId) => {
        if (isReadOnly) return;
        
        setSubtasks(prev => prev.filter(t => t.id !== subtaskId));

        try {
            await apiClient.deleteSubtask(subtaskId);
        } catch (err) {
            console.error('Failed to remove subtask:', err);
            setError('Failed to remove subtask.');
        }
    };

    const handleAddComment = async () => {
        if (newCommentText.trim() === '' || isSaving || isReadOnly) return;

        try {
            const newComment = await apiClient.createTaskComment(card.id, newCommentText.trim());

            const formattedNewComment = {
                id: newComment.id,
                user: currentUserName,
                text: newComment.content,
                date: new Date(newComment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            };

            setComments(prev => [formattedNewComment, ...prev]);
            setNewCommentText('');
        } catch (err) {
            console.error('Failed to add comment:', err);
            setError('Failed to add comment.');
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal task-details-modal" onClick={e => e.stopPropagation()}>

                <div className="modal-header">
                    <h3 className="modal-title">
                        Task Details
                        {isReadOnly && (
                            <span style={{
                                marginLeft: '12px',
                                padding: '4px 8px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '500',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                <Eye size={14} />
                                View Only
                            </span>
                        )}
                    </h3>
                    <button className="icon-btn" onClick={onClose}><X size={24} /></button>
                </div>

                <div className="modal-content-scroll">

                    {error && <div className="error-banner">{error}</div>}

                    <div className="task-title-input">
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="modal-title-edit"
                            disabled={isSaving || isReadOnly}
                            readOnly={isReadOnly}
                        />
                    </div>

                    <div className="task-meta-row">
                        <div className="meta-group">
                            <label>Priority</label>
                            <select 
                                value={priority} 
                                onChange={e => setPriority(e.target.value)} 
                                disabled={isSaving || isReadOnly}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>

                        <div className="meta-group">
                            <label>Assignee</label>
                            <select 
                                value={assigneeId} 
                                onChange={e => setAssigneeId(e.target.value)} 
                                disabled={isSaving || isReadOnly}
                            >
                                <option value="">Unassigned</option>
                                {users.map(user => {
                                    const label = user.name && user.name.trim() !== '' ? user.name : user.email;
                                    return (
                                        <option key={user.id} value={user.id}>{label}</option>
                                    );
                                })}
                            </select>
                        </div>

                        <div className="meta-group">
                            <label>Due Date</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={e => setDueDate(e.target.value)}
                                    disabled={isSaving || isReadOnly}
                                    readOnly={isReadOnly}
                                    style={{ flex: 1 }}
                                />
                                {dueDate && !isReadOnly && (
                                    <button 
                                        className="icon-btn" 
                                        onClick={() => setDueDate('')}
                                        title="Remove due date"
                                        disabled={isSaving}
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <label>Description</label>
                    <textarea
                        value={desc}
                        onChange={e => setDesc(e.target.value)}
                        placeholder="Enter task description"
                        disabled={isSaving || isReadOnly}
                        readOnly={isReadOnly}
                    />

                    <h4 className="section-title">Subtasks {loading && subtasks.length === 0 ? '(Loading...)' : ''}</h4>
                    <div className="subtasks-list">
                        {subtasks.map(sub => (
                            <div key={sub.id} className="subtask-item">
                                <input
                                    type="checkbox"
                                    checked={sub.done}
                                    onChange={() => handleToggleSubtask(sub.id, sub.done)}
                                    disabled={isSaving || isReadOnly}
                                    title={isReadOnly ? 'Read-only access' : ''}
                                    style={{ cursor: isReadOnly ? 'not-allowed' : 'pointer' }}
                                />
                                <span className={sub.done ? 'subtask-done' : ''}>{sub.text}</span>
                                {!isReadOnly && (
                                    <button 
                                        className="icon-btn remove-subtask-btn" 
                                        onClick={() => handleRemoveSubtask(sub.id)} 
                                        disabled={isSaving}
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {!isReadOnly && (
                        <div className="add-input-group">
                            <input
                                value={newSubtaskTitle}
                                onChange={e => setNewSubtaskTitle(e.target.value)}
                                placeholder="Add a subtask..."
                                onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubtask() }}
                                disabled={isSaving}
                            />
                            <button 
                                className="icon-btn add-btn" 
                                onClick={handleAddSubtask} 
                                disabled={isSaving || newSubtaskTitle.trim() === ''}
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    )}

                    <h4 className="section-title">Comments {loading && comments.length === 0 ? '(Loading...)' : ''}</h4>
                    <div className="comments-section">
                        {comments.length === 0 && !loading ? (
                            <div className="no-comments-placeholder">No comments yet</div>
                        ) : (
                            <div className="comments-list">
                                {comments.map(c => (
                                    <div key={c.id} className="comment-item">
                                        <div className="comment-header">
                                            <span className="comment-user">
                                                <strong>{c.user}</strong>
                                            </span>
                                            <span className="comment-date-time">{c.date}</span>
                                        </div>
                                        <div className="comment-body">
                                            <p className="comment-text">{c.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {!isReadOnly && (
                        <div className="add-input-group comment-input-group">
                            <input
                                value={newCommentText}
                                onChange={e => setNewCommentText(e.target.value)}
                                placeholder="Write a comment..."
                                onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment() }}
                                disabled={isSaving}
                            />
                            <button 
                                className="icon-btn add-btn" 
                                onClick={handleAddComment} 
                                disabled={isSaving || newCommentText.trim() === ''}
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    )}

                </div>

                <div className="modal-actions">
                    <button className="btn ghost" onClick={onClose}>
                        {isReadOnly ? 'Close' : 'Cancel'}
                    </button>
                    {!isReadOnly && (
                        <button 
                            className="btn" 
                            onClick={handleSave} 
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EditTaskModal;