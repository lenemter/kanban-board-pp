import React, { useState } from 'react';
import { initialUsers, addNewUser } from '../utils/usersData'; 
import { User } from 'lucide-react'; 

/**
 *
 * * @param {function} onClose
 * @param {function} onSelectAssignee
 * @param {function} onAddUser
 */

function AssigneeManagerModal({ onClose, onSelectAssignee, onAddUser }) { 
  const [email, setEmail] = useState('');
  const [users, setUsers] = useState(initialUsers); 

  const handleAddUser = () => {
    if (!email) return;

    // Создаем объект нового пользователя
    const newUser = addNewUser(email);
    
    // Обновляем локальный список
    setUsers(prevUsers => [...prevUsers, newUser]);
    
    if (onAddUser) {
        onAddUser(newUser); 
    }
    
    setEmail('');
  };
  
  const handleSelect = (userName) => {
      if (onSelectAssignee) {
          onSelectAssignee(userName);
      }
      onClose();
  }

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

        <button className="btn btn-primary-full" onClick={handleAddUser}>
          <User size={18} /> Add User
        </button>
      </div>
    </div>
  );
}

export default AssigneeManagerModal;