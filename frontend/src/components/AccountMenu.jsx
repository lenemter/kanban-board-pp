// frontend/src/components/AccountMenu.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { LogOut, X, Save, KeyRound, User, Mail, Palette } from 'lucide-react';
import apiClient from '../api';

// Theme definitions with colors for preview
const THEMES = [
    {
        id: 1,
        name: 'Light',
        colors: ['#FFFFFF', '#F5F5F5', '#6366F1'],
        className: 'theme-light'
    },
    {
        id: 2,
        name: 'Dark',
        colors: ['#1F2937', '#111827', '#8B5CF6'],
        className: 'theme-dark'
    },
    {
        id: 3,
        name: 'Dark Purple',
        colors: ['#1A1430', '#241A3D', '#C58AFF'],
        className: 'theme-dark-purple'
    },
    {
        id: 4,
        name: 'Amoled',
        colors: ['#000000', '#0A0A0A', '#FF6B6B'],
        className: 'theme-amoled'
    },
    {
        id: 5,
        name: 'Mint',
        colors: ['#E8F5F1', '#D1F0E8', '#10B981'],
        className: 'theme-mint'
    }
];

function AccountMenu({ onClose, onLogout, currentUser, onThemeUpdate }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [selectedTheme, setSelectedTheme] = useState(1); // Default to Light
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [passwordStrength, setPasswordStrength] = useState('');
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [activeTab, setActiveTab] = useState('general'); // 'general' or 'appearance'

    // Load current user data when component mounts
    useEffect(() => {
        if (currentUser) {
            setUsername(currentUser.name || '');
            setEmail(currentUser.email || '');

            // Get theme from API
            const userTheme = currentUser.theme;
            console.log('User theme from API:', userTheme, 'Type:', typeof userTheme);

            // Convert theme to number if needed
            const themeId = typeof userTheme === 'string' ? parseInt(userTheme, 10) : userTheme;

            // Check if theme is valid (1-5)
            if (themeId && themeId >= 1 && themeId <= 5) {
                setSelectedTheme(themeId);
                console.log('Setting theme to:', themeId);
            } else {
                // If theme is invalid, default to Light (1)
                setSelectedTheme(3);
                console.log('Invalid theme, defaulting to Dark Purple (3)');
            }
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
        console.log('Changing theme to:', themeId);
        setSelectedTheme(themeId);
        setLoading(true);

        try {
            // Update theme on the server
            await apiClient.updateUserMe({ theme: themeId });

            // Apply theme locally with animation
            applyTheme(themeId);

            // Update current user
            if (currentUser) {
                const updatedUser = { ...currentUser, theme: themeId };
                // If there is a callback onThemeUpdate, call it
                if (onThemeUpdate) {
                    onThemeUpdate(updatedUser);
                }
            }
        } catch (error) {
            console.error('Failed to update theme:', error);
            setMessage({
                type: 'error',
                text: error.message || 'Failed to update theme'
            });
            // Revert to previous theme on error
            setSelectedTheme(currentUser?.theme || 1);
        } finally {
            setLoading(false);
        }
    };

    const applyTheme = useCallback((themeId) => {
        // Create an element for transition animation
        const transitionOverlay = document.createElement('div');
        transitionOverlay.className = 'theme-transition';
        document.body.appendChild(transitionOverlay);

        // Add class for active theme change
        document.documentElement.classList.add('theme-change-active');

        // Remove all theme classes
        THEMES.forEach(theme => {
            document.documentElement.classList.remove(theme.className);
        });

        // Find the selected theme and add its class
        const selectedThemeObj = THEMES.find(t => t.id === themeId);
        if (selectedThemeObj) {
            document.documentElement.classList.add(selectedThemeObj.className);

            // Set CSS variables for preview
            document.documentElement.style.setProperty('--theme-color-1', selectedThemeObj.colors[0]);
            document.documentElement.style.setProperty('--theme-color-2', selectedThemeObj.colors[1]);
            document.documentElement.style.setProperty('--theme-color-3', selectedThemeObj.colors[2]);
        }

        // Remove the active theme change class after animation
        setTimeout(() => {
            document.documentElement.classList.remove('theme-change-active');
            if (transitionOverlay.parentNode) {
                transitionOverlay.parentNode.removeChild(transitionOverlay);
            }
        }, 800);

    }, []);

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

                {/* Tab Navigation */}
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

                {/* Message Display */}
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
                            border: `1px solid ${message.type === 'error' ? '#ff6b6b' :
                                message.type === 'success' ? '#6bcf7f' :
                                    '#ffd93d'
                                }`,
                            fontSize: '14px',
                            fontWeight: '500',
                            flexShrink: 0
                        }}
                    >
                        {message.text}
                    </div>
                )}

                <div className="account-content-scroll" style={{
                    paddingTop: message.text ? '15px' : '0'
                }}>
                    {/* General Tab Content */}
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
                                        disabled={loading || (!username.trim())}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
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
                        </>
                    )}

                    {/* Appearance Tab Content */}
                    {activeTab === 'appearance' && (
                        <div className="account-section">
                            <h4 className="section-title">Choose Your Theme</h4>
                            <p style={{
                                color: 'var(--color-text-muted)',
                                fontSize: '14px',
                                marginBottom: '20px'
                            }}>
                                Select a theme to personalize your workspace
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