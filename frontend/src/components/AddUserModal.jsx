// frontend/src/components/AddUserModal.jsx
import React, { useState, useEffect } from 'react';
import { UserPlus, Link as LinkIcon, Copy, Check } from 'lucide-react';
import apiClient from '../api';

function AddUserModal({ onClose, onSelectAssignee, onAddUser, currentBoardId, currentBoard, isOwner }) { 
  const [email, setEmail] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(currentBoard?.is_public || false);
  const [copied, setCopied] = useState(false);
  const [updatingPublic, setUpdatingPublic] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const me = await apiClient.getUserMe();

        if (currentBoardId) {
          try {
            const board = await apiClient.getBoard(currentBoardId);
            setIsPublic(board.is_public || false);

            const boardUsers = await apiClient.getBoardUsers(currentBoardId);
            let participants = [];

            if (Array.isArray(boardUsers) && boardUsers.length > 0) {
              if (boardUsers[0] && boardUsers[0].user_id) {
                participants = await Promise.all(boardUsers.map(bu => apiClient.getUser(bu.user_id)));
              } else {
                participants = boardUsers;
              }
            }

            let ownerUser = null;
            if (board && board.owner_id) {
              try {
                ownerUser = await apiClient.getUser(board.owner_id);
              } catch (e) {
                console.warn('Failed to load board owner user:', e);
              }
            }

            const byId = new Map();
            if (ownerUser) byId.set(ownerUser.id, ownerUser);
            participants.forEach(p => { if (p && p.id) byId.set(p.id, p); });
            if (me && me.id) byId.set(me.id, me);

            const merged = Array.from(byId.values());
            setUsers(merged);
            return;
          } catch (innerErr) {
            console.warn('Could not load board users, falling back to current user only', innerErr);
          }
        }

        setUsers([me]);
      } catch (err) {
        console.error('Failed to load current user:', err);
      }
    })();
  }, [currentBoardId]);

  const handleAddUser = async () => {
    if (!email) return;
    if (!currentBoardId) {
      alert('Board not selected.');
      return;
    }

    setLoading(true);
    try {
      const boardUserAccess = await apiClient.addUserToBoard(currentBoardId, email);

      let addedUser = null;
      if (boardUserAccess && boardUserAccess.user_id) {
        addedUser = await apiClient.getUser(boardUserAccess.user_id);
      } else if (boardUserAccess && boardUserAccess.user) {
        addedUser = boardUserAccess.user;
      } else {
        try {
          const refreshed = await apiClient.getBoardUsers(currentBoardId);
          if (Array.isArray(refreshed) && refreshed.length > 0) {
            const participants = refreshed[0] && refreshed[0].user_id
              ? await Promise.all(refreshed.map(bu => apiClient.getUser(bu.user_id)))
              : refreshed;

            const me = await apiClient.getUserMe();
            const uniq = [me, ...participants.filter(p => p.id !== me.id)];
            setUsers(uniq);
          }
        } catch (refreshErr) {
          console.warn('Failed to refresh board users after add:', refreshErr);
        }
      }

      if (addedUser) {
        setUsers(prev => {
          if (prev.some(u => u.id === addedUser.id)) return prev;
          return [...prev, addedUser];
        });
      }

      if (onAddUser) onAddUser(addedUser);
      setEmail('');
    } catch (err) {
      console.error('Failed to add user to board:', err);
      alert(err.message || 'Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublic = async () => {
    if (!isOwner) return;
    
    setUpdatingPublic(true);
    try {
      const newPublicState = !isPublic;
      await apiClient.updateBoard(currentBoardId, { is_public: newPublicState });
      setIsPublic(newPublicState);
    } catch (err) {
      console.error('Failed to update board public status:', err);
      alert(err.message || 'Failed to update board public status');
    } finally {
      setUpdatingPublic(false);
    }
  };

  const handleCopyLink = () => {
    const boardUrl = `${window.location.origin}/board/${currentBoardId}`;
    navigator.clipboard.writeText(boardUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSelect = (userName) => {
    if (onSelectAssignee) onSelectAssignee(userName);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        
        <div className="modal-header">
            <h3 className="modal-title">Manage Board Access</h3>
            <button className="icon-btn" onClick={onClose}>×</button>
        </div>

        {/* Public Access Section - Only for owner */}
        {isOwner && (
          <div style={{
            background: 'var(--color-card)',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid var(--color-border-default)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LinkIcon size={18} />
                <span style={{ fontWeight: '600' }}>Public Access</span>
              </div>
              <label style={{ 
                position: 'relative', 
                display: 'inline-block', 
                width: '50px', 
                height: '26px',
                margin: 0
              }}>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={handleTogglePublic}
                  disabled={updatingPublic}
                  style={{
                    opacity: 0,
                    width: 0,
                    height: 0
                  }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: updatingPublic ? 'not-allowed' : 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: isPublic ? 'var(--color-accent)' : 'var(--color-border-default)',
                  transition: '0.3s',
                  borderRadius: '26px',
                  opacity: updatingPublic ? 0.5 : 1
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '',
                    height: '20px',
                    width: '20px',
                    left: isPublic ? '27px' : '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    transition: '0.3s',
                    borderRadius: '50%'
                  }} />
                </span>
              </label>
            </div>
            
            <p style={{ 
              fontSize: '13px', 
              color: 'var(--color-text-muted)', 
              margin: '0 0 12px 0',
              lineHeight: '1.4'
            }}>
              {isPublic 
                ? 'Anyone with the link can view this board (read-only)' 
                : 'Only invited users can access this board'}
            </p>

            {isPublic && (
              <button
                onClick={handleCopyLink}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  background: 'var(--color-panel)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: '6px',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  width: '100%',
                  justifyContent: 'center'
                }}
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy Board Link
                  </>
                )}
              </button>
            )}
          </div>
        )}
        
        <label className="modal-label-small">Current users</label>
        <div className="user-list-container">
          {users.map(user => (
            <div 
              key={user.id} 
              className="user-card"
              onClick={() => handleSelect(user.name)} 
            >
              <div className="user-name">{user.name}</div>
              <div className="user-email">{user.email}</div>
            </div>
          ))}
        </div>

        <label>Add User by Email</label>
        <input 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          placeholder="Enter user email"
          type="email"
          disabled={!isOwner}
        />

        <button 
          className="btn btn-primary-full" 
          onClick={handleAddUser} 
          disabled={loading || !isOwner || !email}
          title={!isOwner ? 'Only the board owner can add users' : ''}
        >
          <UserPlus size={18} /> {loading ? 'Adding...' : 'Add User'}
        </button>
      </div>
    </div>
  );
}

export default AddUserModal;