import React, { useState } from 'react';

function AccountMenu({ onClose }) {
    const [username, setUsername] = useState('SanyGame');
    const [email, setEmail] = useState('priupolin5443@yandex.ru');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const handleSaveGeneralInfo = () => {
        // Здесь будет логика для сохранения общей информации (username, email)
        console.log('Saving General Information:', { username, email });
        // Здесь сделать вызов API
        alert('General Information saved!');
    };

    const handleSavePassword = () => {
        // Здесь будет логика для смены пароля
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            alert('Пожалуйста, заполните все поля для смены пароля.');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            alert('Новый пароль и его подтверждение не совпадают.');
            return;
        }
        if (newPassword.length < 6) { // Пример валидации
            alert('Новый пароль должен быть не менее 6 символов.');
            return;
        }
        console.log('Changing Password:', { currentPassword, newPassword });
        // Здесь сделать вызов API
        alert('Password changed successfully!');
        // Очистка полей
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal account-modal" onClick={e => e.stopPropagation()}> 
                
                <div className="modal-header">
                    <h3 className="modal-title">Account</h3> 
                    <button className="icon-btn" onClick={onClose}>×</button>
                </div>

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
        </div>
    );
}

export default AccountMenu;