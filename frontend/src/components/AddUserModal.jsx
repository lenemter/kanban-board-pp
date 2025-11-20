import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import apiClient from '../api';

/**
 *
 * * @param {function} onClose
 * @param {function} onSelectAssignee
 * @param {function} onAddUser
 */

function AssigneeManagerModal({ onClose, onSelectAssignee, onAddUser, currentBoardId }) { 
  const [email, setEmail] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const me = await apiClient.getUserMe();

        if (currentBoardId) {
          try {
            const board = await apiClient.getBoard(currentBoardId);

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
  }, []);

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
      } else {
        try {
          const board = await apiClient.getBoard(currentBoardId);
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
            try { ownerUser = await apiClient.getUser(board.owner_id); } catch {}
          }

          const byId = new Map();
          if (ownerUser) byId.set(ownerUser.id, ownerUser);
          participants.forEach(p => { if (p && p.id) byId.set(p.id, p); });
          const me = await apiClient.getUserMe();
          if (me && me.id) byId.set(me.id, me);

          setUsers(Array.from(byId.values()));
        } catch (refreshErr) {
          console.warn('Failed to refresh participants after add:', refreshErr);
        }
      }

      if (onAddUser) onAddUser(addedUser);
      setEmail('');
    } catch (err) {
      console.error('Failed to add user to board:', err);
      alert(err.message || 'Не удалось добавить пользователя');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (userName) => {
    if (onSelectAssignee) onSelectAssignee(userName);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        
        <div className="modal-header">
            <h3 className="modal-title">Add new user</h3>
            <button className="icon-btn" onClick={onClose}>×</button>
        </div>
        
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

        <label>Email</label>
        <input 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          placeholder="Enter user email"
          type="email"
        />

        <button className="btn btn-primary-full" onClick={handleAddUser} disabled={loading}>
          <User size={18} /> {loading ? 'Adding...' : 'Add User'}
        </button>
      </div>
    </div>
  );
}

export default AssigneeManagerModal;