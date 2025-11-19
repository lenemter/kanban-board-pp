import React, { useState } from 'react';
import { LogOut, X } from 'lucide-react'; 

function AccountMenu({ onClose, onLogout }) {
    const [username, setUsername] = useState('SanyGame');
    const [email, setEmail] = useState('priupolin5443@yandex.ru');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    
    const handleSaveGeneralInfo = () => { /* ... */ alert('General Information saved!'); };
    const handleSavePassword = () => { /* ... */ alert('Password changed successfully!'); };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal account-modal large-modal" onClick={e => e.stopPropagation()}> 
                
                <div className="modal-header">
                    <h3 className="modal-title">Account</h3> 
                    <button className="icon-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                <div className="account-content-scroll"> 

                    <div className="account-section">
                        <h4 className="section-title">General Information</h4>
                        <label>Username</label>
                        <input 
                            value={username} 
                            onChange={e => setUsername(e.target.value)} 
                        />
                        <label>Email</label>
                        <input 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            readOnly
                        />
                        <div className="modal-actions-col">
                            <button className="btn" onClick={handleSaveGeneralInfo}>Save Changes</button>
                        </div>
                    </div>

                    <div className="account-section">
                        <h4 className="section-title">Change Password</h4>
                        <label>Current Password</label>
                        <input 
                            type="password"
                            value={currentPassword} 
                            onChange={e => setCurrentPassword(e.target.value)} 
                            placeholder="Enter current password"
                        />
                        <label>New Password</label>
                        <input 
                            type="password"
                            value={newPassword} 
                            onChange={e => setNewPassword(e.target.value)} 
                            placeholder="Enter new password"
                        />
                        <label>Confirm New Password</label>
                        <input 
                            type="password"
                            value={confirmNewPassword} 
                            onChange={e => setConfirmNewPassword(e.target.value)} 
                            placeholder="Confirm new password"
                        />
                        <div className="modal-actions-col">
                            <button className="btn" onClick={handleSavePassword}>Save Changes</button>
                        </div>
                    </div>

                </div>
            
                <div className="menu-footer" style={{justifyContent: 'flex-end'}}>
                    <button className="menu-item btn-link logout-btn" onClick={onLogout}>
                        <LogOut size={18} /> Log Out
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AccountMenu;