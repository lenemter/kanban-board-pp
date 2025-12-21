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
                    _status: 'unchanged',
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
            // First, update task main fields
            await apiClient.updateTask(card.id, updateData);

            // Then process subtasks changes in batch
            const toCreate = subtasks.filter(s => s._status === 'added');
            const toUpdate = subtasks.filter(s => s._status === 'modified' && !String(s.id).startsWith('temp-'));
            const toDelete = subtasks.filter(s => s._status === 'deleted' && !String(s.id).startsWith('temp-'));

            // Create new subtasks and honor their `done` state if user toggled it before save
            for (const s of toCreate) {
                try {
                    const created = await apiClient.createSubtask(card.id, s.text);
                    if (s.done) {
                        try {
                            await apiClient.updateSubtask(created.id, { title: created.title, is_done: true });
                        } catch (innerErr) {
                            console.warn('Failed to set new subtask done state:', innerErr);
                        }
                    }
                } catch (createErr) {
                    console.error('Failed to create subtask:', createErr);
                    // continue processing others
                }
            }

            // Update changed subtasks
            const updatePromises = toUpdate.map(s => apiClient.updateSubtask(s.id, { title: s.text, is_done: s.done }));
            // Delete removed subtasks
            const deletePromises = toDelete.map(s => apiClient.deleteSubtask(s.id));

            await Promise.all([...updatePromises, ...deletePromises]);

            onSave(card.id, updateData, { fromModal: true });
            onClose();

        } catch (err) {
            console.error('Task update failed:', err);
            setError(err.message || 'Failed to save changes.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddSubtask = () => {
        if (newSubtaskTitle.trim() === '' || isSaving || isReadOnly) return;

        const tempId = `temp-${Date.now()}`;
        const newSub = {
            id: tempId,
            text: newSubtaskTitle.trim(),
            done: false,
            _status: 'added',
        };

        setSubtasks(prev => [...prev, newSub]);
        setNewSubtaskTitle('');
    };

    const handleToggleSubtask = (subtaskId, currentDoneStatus) => {
        if (isReadOnly) return;

        const newDoneStatus = !currentDoneStatus;

        setSubtasks(prev => prev.map(t => {
            if (t.id !== subtaskId) return t;
            const base = { ...t, done: newDoneStatus };
            if (t._status === 'unchanged') base._status = 'modified';
            return base;
        }));
    };

    const handleRemoveSubtask = (subtaskId) => {
        if (isReadOnly) return;

        setSubtasks(prev => prev.map(t => {
            if (t.id !== subtaskId) return t;
            if (String(t.id).startsWith('temp-')) return null;
            return { ...t, _status: 'deleted' };
        }).filter(Boolean));
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

    // Only show subtasks that are not marked as deleted.
    const visibleSubtasks = subtasks.filter(s => s._status !== 'deleted');

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
                                    <button
                                        className="icon-btn"
                                        onClick={() => {
                                            if (isSaving || isReadOnly) return;
                                            if (!dueDate) return;
                                            setDueDate('');
                                        }}
                                        title={dueDate ? 'Remove due date' : 'No due date set'}
                                        disabled={isSaving || isReadOnly || !dueDate}
                                        aria-disabled={isSaving || isReadOnly || !dueDate}
                                    >
                                        <X size={18} />
                                    </button>
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

                    <h4 className="section-title">Subtasks {loading && visibleSubtasks.length === 0 ? '(Loading...)' : ''}</h4>
                    <div className="subtasks-list">
                        {visibleSubtasks.length === 0 && !loading ? (
                            <div className="no-subtasks-placeholder">No subtasks yet</div>
                        ) : (
                            visibleSubtasks.map(sub => (
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
                            ))
                        )}
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