import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api';
import CreateBoardModal from '../components/CreateBoardModal';
import AccountMenu from '../components/AccountMenu';
import { User, Plus } from 'lucide-react';

function DashboardPage({ onLogout }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [availableBoards, setAvailableBoards] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [showCreateBoard, setShowCreateBoard] = useState(false);
    const [showAccount, setShowAccount] = useState(false);

    const loadInitialData = useCallback(async () => {
        if (!apiClient.token) {
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            const user = await apiClient.getUserMe();
            setCurrentUser(user);

            const boardsList = await apiClient.getSharedBoards();
            setAvailableBoards(boardsList || []);
        } catch (error) {
            console.error("Failed to load initial data:", error);
            if (error.message.includes('token') || error.message.includes('401')) {
                if (onLogout) {
                    onLogout();
                } else {
                    apiClient.clearToken();
                }
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    const handleCreateNewBoard = async (name) => {
        try {
            const newBoard = await apiClient.createBoard(name);
            setAvailableBoards(prev => [...prev, newBoard]);
            setShowCreateBoard(false);
            // Navigate to the new board
            navigate(`/board/${newBoard.id}`);
        } catch (error) {
            console.error("Error creating board:", error);
            throw new Error(error.message || "Unable to create new board.");
        }
    };

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        } else {
            apiClient.clearToken();
            navigate('/login');
        }
    };

    if (loading) {
        return (
            <div className="app-root">
                <div className="main-area" style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <div>Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="app-root">
            {/* Sidebar */}
            <div className="sidebar">
                <h3 className="app-title">Kanban Board</h3>

                <div className="boards-section">
                    <div className="boards-header">Your Boards</div>
                    <div className="boards-list">
                        {availableBoards.map(board => (
                            <Link
                                key={board.id}
                                to={`/board/${board.id}`}
                                className="board-item"
                            >
                                {board.name}
                            </Link>
                        ))}
                        <button
                            className="board-item new-board-btn"
                            onClick={() => setShowCreateBoard(true)}
                        >
                            <Plus size={16} style={{ marginRight: '8px' }} />
                            New Board
                        </button>
                    </div>
                </div>

                <div className="sidebar-bottom">
                    <button
                        className="account-btn"
                        onClick={() => setShowAccount(true)}
                    >
                        <User size={20} />
                        {currentUser?.name || 'Account'}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-area">
                <div className="topbar">
                    <div className="top-left">Dashboard</div>
                </div>

                <div className="dashboard-content" style={{ padding: '20px' }}>
                    <h2>Welcome to Kanban Board</h2>
                    <p>Select a board from the sidebar or create a new one.</p>

                    <div className="boards-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                        gap: '20px',
                        marginTop: '30px'
                    }}>
                        {availableBoards.map(board => (
                            <Link
                                key={board.id}
                                to={`/board/${board.id}`}
                                style={{
                                    background: 'var(--color-card)',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    textDecoration: 'none',
                                    color: 'var(--color-text-primary)',
                                    border: '1px solid var(--color-border-default)',
                                    transition: 'transform 0.2s, border-color 0.2s',
                                    cursor: 'pointer',
                                    display: 'block'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.borderColor = 'var(--color-accent)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = 'var(--color-border-default)';
                                }}
                            >
                                <h3 style={{ margin: '0 0 10px 0' }}>{board.name}</h3>
                                <div style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
                                    Board ID: {board.id}
                                </div>
                            </Link>
                        ))}

                        <button
                            onClick={() => setShowCreateBoard(true)}
                            style={{
                                background: 'var(--color-panel)',
                                padding: '20px',
                                borderRadius: '12px',
                                border: '2px dashed var(--color-border-default)',
                                color: 'var(--color-text-muted)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'border-color 0.2s, color 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-accent)';
                                e.currentTarget.style.color = 'var(--color-accent)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-border-default)';
                                e.currentTarget.style.color = 'var(--color-text-muted)';
                            }}
                        >
                            <Plus size={40} style={{ marginBottom: '10px' }} />
                            <div>Create New Board</div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showCreateBoard && (
                <CreateBoardModal
                    onClose={() => setShowCreateBoard(false)}
                    onCreate={handleCreateNewBoard}
                />
            )}

            {showAccount && currentUser && (
                <AccountMenu
                    onClose={() => setShowAccount(false)}
                    onLogout={handleLogout}
                    currentUser={currentUser}
                />
            )}
        </div>
    );
}

export default DashboardPage;