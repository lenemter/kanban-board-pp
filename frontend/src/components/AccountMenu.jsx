// frontend/src/components/AccountMenu.jsx
import React, { useState, useEffect } from 'react';
import { LogOut, X, Save, KeyRound, User, Mail, Palette } from 'lucide-react';
import apiClient from '../api';

// Обновленные темы (9 штук)
const THEMES = [
    {
        id: 1,
        name: 'Light',
        colors: ['#F8FAFC', '#FFFFFF', '#3B82F6'],
        className: 'theme-light'
    },
    {
        id: 2,
        name: 'Dark',
        colors: ['#0F172A', '#1E293B', '#60A5FA'],
        className: 'theme-dark'
    },
    {
        id: 3,
        name: 'Purple Dream',
        colors: ['#1A0B2E', '#2D1B4E', '#A855F7'],
        className: 'theme-dark-purple'
    },
    {
        id: 4,
        name: 'Amoled',
        colors: ['#000000', '#0A0A0A', '#00D9FF'],
        className: 'theme-amoled'
    },
    {
        id: 5,
        name: 'Mint Fresh',
        colors: ['#ECFDF5', '#FFFFFF', '#10B981'],
        className: 'theme-mint'
    },
    {
        id: 6,
        name: 'Ocean Blue',
        colors: ['#0C1E2F', '#142939', '#0EA5E9'],
        className: 'theme-ocean'
    },
    {
        id: 7,
        name: 'Sunset',
        colors: ['#FFF7ED', '#FFFFFF', '#F97316'],
        className: 'theme-sunset'
    },
    {
        id: 8,
        name: 'Nord',
        colors: ['#2E3440', '#3B4252', '#88C0D0'],
        className: 'theme-nord'
    },
    {
        id: 9,
        name: 'Rose Pine',
        colors: ['#191724', '#1F1D2E', '#EB6F92'],
        className: 'theme-rosepine'
    }
];

function AccountMenu({ onClose, onLogout, currentUser, onThemeUpdate }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [selectedTheme, setSelectedTheme] = useState(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [passwordStrength, setPasswordStrength] = useState('');
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        if (currentUser) {
            setUsername(currentUser.name || '');
            setEmail(currentUser.email || '');

            const userTheme = currentUser.theme;
            console.log('User theme from API:', userTheme, 'Type:', typeof userTheme);
            
            const themeId = typeof userTheme === 'string' ? parseInt(userTheme, 10) : userTheme;

            if (themeId && themeId >= 1 && themeId <= 9) {
                setSelectedTheme(themeId);
                // Apply theme on mount
                applyTheme(themeId);
            } else {
                setSelectedTheme(3);
                applyTheme(3);
            }
        }
    }, [currentUser]);

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

            if (Object.keys(updateData).length > 0) {
                await apiClient.updateUserMe(updateData);
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                
                // Update current user if callback provided
                if (onThemeUpdate) {
                    await onThemeUpdate();
                }
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

    const handleThemeChange = async (themeId) => {
        setSelectedTheme(themeId);
        setLoading(true);

        try {
            // Save theme to backend
            await apiClient.updateUserMe({ theme: themeId });
            
            // Apply theme locally
            applyTheme(themeId);

            // Update current user
            if (onThemeUpdate) {
                await onThemeUpdate();
            }
            
            setMessage({ type: 'success', text: 'Theme updated successfully!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 2000);
        } catch (error) {
            console.error('Failed to update theme:', error);
            setMessage({
                type: 'error',
                text: error.message || 'Failed to update theme'
            });
            // Revert to previous theme on error
            setSelectedTheme(currentUser?.theme || 1);
            applyTheme(currentUser?.theme || 1);
        } finally {
            setLoading(false);
        }
    };

    const applyTheme = (themeId) => {
        // Remove all theme classes
        THEMES.forEach(theme => {
            document.documentElement.classList.remove(theme.className);
        });

        // Find the selected theme and add its class
        const selectedThemeObj = THEMES.find(t => t.id === themeId);
        if (selectedThemeObj) {
            document.documentElement.classList.add(selectedThemeObj.className);
            console.log('Applied theme:', selectedThemeObj.name);
        }
    };

    const getPasswordStrengthColor = () => {
        switch (passwordStrength) {
            case 'weak': return '#EF4444';
            case 'medium': return '#F59E0B';
            case 'strong': return '#10B981';
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

    const handleLogout = () => {
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
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal account-modal large-modal" onClick={e => e.stopPropagation()}>

                <div className="modal-header">
                    <h3 className="modal-title">Account Settings</h3>
                    <button className="icon-btn" onClick={onClose} disabled={loading}>
                        <X size={24} />
                    </button>
                </div>

                <div className="settings-tabs">
                    <button
                        className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
                        onClick={() => setActiveTab('general')}
                    >
                        <User size={18} />
                        General
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'appearance' ? 'active' : ''}`}
                        onClick={() => setActiveTab('appearance')}
                    >
                        <Palette size={18} />
                        Appearance
                    </button>
                </div>

                {message.text && (
                    <div style={{
                        padding: '12px 16px',
                        margin: '16px 28px 16px 28px',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: '500',
                        backgroundColor: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' :
                            message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: message.type === 'error' ? '#EF4444' :
                            message.type === 'success' ? '#10B981' : '#F59E0B',
                        border: `1px solid ${message.type === 'error' ? '#EF4444' :
                            message.type === 'success' ? '#10B981' : '#F59E0B'}`,
                    }}>
                        {message.text}
                    </div>
                )}

                <div className="account-content-scroll">
                    {activeTab === 'general' && (
                        <>
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
                                        disabled={loading || !username.trim()}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                                    >
                                        <Save size={16} />
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>

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

                                {passwordStrength && (
                                    <div style={{
                                        marginTop: '8px',
                                        fontSize: '12px',
                                        color: getPasswordStrengthColor(),
                                        fontWeight: '600'
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
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                                    >
                                        <Save size={16} />
                                        {loading ? 'Changing...' : 'Change Password'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'appearance' && (
                        <div className="account-section">
                            <h4 className="section-title">Choose Your Theme</h4>
                            <p style={{
                                color: 'var(--color-text-muted)',
                                fontSize: '14px',
                                marginBottom: '24px',
                                lineHeight: '1.5'
                            }}>
                                Select a theme to personalize your workspace. Choose from light, dark, and colorful options.
                            </p>

                            <div className="theme-grid">
                                {THEMES.map(theme => (
                                    <button
                                        key={theme.id}
                                        className={`theme-card ${selectedTheme === theme.id ? 'selected' : ''}`}
                                        onClick={() => handleThemeChange(theme.id)}
                                        disabled={loading}
                                    >
                                        <div className="theme-preview">
                                            <div
                                                className="theme-color-bar"
                                                style={{
                                                    background: `linear-gradient(135deg, ${theme.colors[0]} 0%, ${theme.colors[1]} 50%, ${theme.colors[2]} 100%)`
                                                }}
                                            />
                                            <div className="theme-colors">
                                                {theme.colors.map((color, index) => (
                                                    <div
                                                        key={index}
                                                        className="theme-color-dot"
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="theme-name">{theme.name}</div>
                                        {selectedTheme === theme.id && (
                                            <div className="theme-selected-badge">✓</div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="menu-footer">
                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                        disabled={loading || isLoggingOut}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
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