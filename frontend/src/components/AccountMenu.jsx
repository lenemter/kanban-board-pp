// frontend/src/components/AccountMenu.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { LogOut, X, Save, KeyRound, User, Mail } from 'lucide-react';
import apiClient from '../api';

function AccountMenu({ onClose, onLogout, currentUser }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [passwordStrength, setPasswordStrength] = useState('');
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Load current user data when component mounts
    useEffect(() => {
        if (currentUser) {
            setUsername(currentUser.name || '');
            setEmail(currentUser.email || '');
        }
    }, [currentUser]);

    // Check password strength
    useEffect(() => {
        if (newPassword.length === 0) {
            setPasswordStrength('');
            return;
        }

        if (newPassword.length < 8) {
            setPasswordStrength('weak');
        } else if (newPassword.length < 12) {
            setPasswordStrength('medium');
        } else {
            setPasswordStrength('strong');
        }
    }, [newPassword]);

    const clearMessages = () => {
        setMessage({ type: '', text: '' });
    };

    const handleSaveGeneralInfo = async () => {
        if (!username.trim()) {
            setMessage({ type: 'error', text: 'Username cannot be empty' });
            return;
        }

        setLoading(true);
        clearMessages();

        try {
            const updateData = {};
            if (username !== currentUser.name) {
                updateData.name = username;
            }
            if (email !== currentUser.email) {
                updateData.email = email;
            }

            // Only send request if there are changes
            if (Object.keys(updateData).length > 0) {
                await apiClient.updateUserMe(updateData);
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
            } else {
                setMessage({ type: 'info', text: 'No changes to save' });
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            setMessage({ 
                type: 'error', 
                text: error.message || 'Failed to update profile' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSavePassword = async () => {
        if (!newPassword) {
            setMessage({ type: 'error', text: 'Please enter a new password' });
            return;
        }

        if (newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        setLoading(true);
        clearMessages();

        try {
            await apiClient.updateUserMe({
                password: newPassword
            });
            
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            
            // Clear password fields
            setNewPassword('');
            setConfirmNewPassword('');
            setPasswordStrength('');
            
        } catch (error) {
            console.error('Failed to change password:', error);
            setMessage({ 
                type: 'error', 
                text: error.message || 'Failed to change password' 
            });
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrengthColor = () => {
        switch (passwordStrength) {
            case 'weak': return '#ff6b6b';
            case 'medium': return '#ffd93d';
            case 'strong': return '#6bcf7f';
            default: return 'transparent';
        }
    };

    const getPasswordStrengthText = () => {
        switch (passwordStrength) {
            case 'weak': return 'Weak';
            case 'medium': return 'Medium';
            case 'strong': return 'Strong';
            default: return '';
        }
    };

    const handleLogout = useCallback(() => {
      if (isLoggingOut) return;
      
      setIsLoggingOut(true);
      try {
        if (onClose) onClose();
        if (onLogout) {
          const shouldContinue = onLogout();
          if (shouldContinue === false) return;
        }
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        setIsLoggingOut(false);
      }
    }, [onClose, onLogout, isLoggingOut]);

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal account-modal large-modal" onClick={e => e.stopPropagation()}>
                
                <div className="modal-header">
                    <h3 className="modal-title">Account Settings</h3>
                    <button 
                        className="icon-btn" 
                        onClick={onClose}
                        disabled={loading}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Message Display - Fixed position so it's always visible */}
                {message.text && (
                    <div 
                        className="message-banner"
                        style={{
                            padding: '12px 16px',
                            margin: '0 20px',
                            borderRadius: '8px',
                            backgroundColor: 
                                message.type === 'error' ? 'rgba(255, 107, 107, 0.1)' :
                                message.type === 'success' ? 'rgba(107, 207, 127, 0.1)' :
                                'rgba(255, 217, 61, 0.1)',
                            color: 
                                message.type === 'error' ? '#ff6b6b' :
                                message.type === 'success' ? '#6bcf7f' :
                                '#ffd93d',
                            border: `1px solid ${
                                message.type === 'error' ? '#ff6b6b' :
                                message.type === 'success' ? '#6bcf7f' :
                                '#ffd93d'
                            }`,
                            fontSize: '14px',
                            fontWeight: '500',
                            flexShrink: 0 // Prevent shrinking
                        }}
                    >
                        {message.text}
                    </div>
                )}

                <div className="account-content-scroll" style={{
                    // Adjust padding top based on whether there's a message
                    paddingTop: message.text ? '15px' : '0'
                }}>
                    {/* General Information Section */}
                    <div className="account-section">
                        <h4 className="section-title">General Information</h4>
                        
                        <label>
                            <User size={16} style={{ marginRight: '8px' }} />
                            Username
                        </label>
                        <input 
                            value={username} 
                            onChange={e => setUsername(e.target.value)}
                            disabled={loading}
                            placeholder="Enter your username"
                        />
                        
                        <label>
                            <Mail size={16} style={{ marginRight: '8px' }} />
                            Email
                        </label>
                        <input 
                            type="email"
                            value={email} 
                            onChange={e => setEmail(e.target.value)}
                            disabled={loading}
                            placeholder="Enter your email"
                        />
                        
                        <div className="modal-actions-col">
                            <button 
                                className="btn" 
                                onClick={handleSaveGeneralInfo}
                                disabled={loading || (!username.trim())}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <Save size={16} />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>

                    {/* Change Password Section */}
                    <div className="account-section">
                        <h4 className="section-title">Change Password</h4>
                        
                        <label>
                            <KeyRound size={16} style={{ marginRight: '8px' }} />
                            New Password
                        </label>
                        <input 
                            type="password"
                            value={newPassword} 
                            onChange={e => setNewPassword(e.target.value)}
                            disabled={loading}
                            placeholder="Enter new password (min 8 characters)"
                        />
                        
                        {/* Password Strength Indicator */}
                        {passwordStrength && (
                            <div style={{ 
                                marginTop: '4px', 
                                fontSize: '12px',
                                color: getPasswordStrengthColor(),
                                fontWeight: '500'
                            }}>
                                Password Strength: {getPasswordStrengthText()}
                            </div>
                        )}
                        
                        <label>
                            <KeyRound size={16} style={{ marginRight: '8px' }} />
                            Confirm New Password
                        </label>
                        <input 
                            type="password"
                            value={confirmNewPassword} 
                            onChange={e => setConfirmNewPassword(e.target.value)}
                            disabled={loading}
                            placeholder="Confirm new password"
                        />
                        
                        <div className="modal-actions-col">
                            <button 
                                className="btn" 
                                onClick={handleSavePassword}
                                disabled={loading || !newPassword || !confirmNewPassword}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <Save size={16} />
                                {loading ? 'Changing...' : 'Change Password'}
                            </button>
                        </div>
                    </div>
                </div>
            
                {/* Footer with Logout */}
                <div className="menu-footer">
                    <button
                        className="menu-item btn-link logout-btn" 
                        onClick={handleLogout}
                        disabled={loading || isLoggingOut}
                        style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        color: '#ff6b6b'
                        }}
                    >
                        <LogOut size={18} /> 
                        {isLoggingOut ? 'Logging out...' : 'Log Out'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AccountMenu;