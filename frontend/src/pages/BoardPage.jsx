import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Board from '../components/Board';
import CreateTaskModal from '../components/CreateTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import AddUserModal from '../components/AddUserModal';
import CreateColumnModal from '../components/CreateColumnModal';
import CreateBoardModal from '../components/CreateBoardModal';
import ConfirmModal from '../components/ConfirmModal';
import AccountMenu from '../components/AccountMenu';
import apiClient from '../api';
import { UserPlus, Trash2, User, ArrowLeft, Plus, MoreVertical } from 'lucide-react';

const transformApiToBoardFormat = (boardDetails, apiColumnsWithTasks, boardUsers = []) => {
    const board = {
        id: boardDetails.id,
        title: boardDetails.name,
        owner_id: boardDetails.owner_id,
        cards: [],
        columns: [],
    };

    apiColumnsWithTasks
        .sort((a, b) => a.position - b.position)
        .forEach(col => {
            board.columns.push({
                id: col.id,
                title: col.name,
                card_ids: col.tasks
                    .sort((a, b) => a.position - b.position)
                    .map(task => task.id),
            });

            col.tasks.forEach(task => {
                let assigneeId = null;
                let assigneeName = '';
                if (task.assignee_id) {
                    assigneeId = task.assignee_id;
                }

                if (task.assignee_name) assigneeName = task.assignee_name;
                else if (!assigneeName && assigneeId) {
                    const u = (boardUsers || []).find(x => x.id === assigneeId);
                    assigneeName = u ? (u.name || u.email || u.id) : '';
                }

                board.cards.push({
                    id: task.id,
                    columnId: col.id,
                    title: task.title,
                    description: task.description,
                    priority: task.priority,
                    due_date: task.due_date,
                    assignee_id: assigneeId,
                    assignee_name: assigneeName,
                    position: task.position || 0,
                });
            });
        });

    return board;
};

function BoardPage({ onLogout }) {
    const { boardId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [loadingBoards, setLoadingBoards] = useState(false);
    const [board, setBoard] = useState(null);
    const [boardUsers, setBoardUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [availableBoards, setAvailableBoards] = useState([]);
    const [showAccount, setShowAccount] = useState(false);
    const [boardMenuOpen, setBoardMenuOpen] = useState(null);

    // Modal states
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showAddUser, setShowAddUser] = useState(false);
    const [showCreateColumn, setShowCreateColumn] = useState(false);
    const [showCreateBoard, setShowCreateBoard] = useState(false);
    const [showConfirmDeleteColumn, setShowConfirmDeleteColumn] = useState(false);
    const [showConfirmDeleteBoard, setShowConfirmDeleteBoard] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [taskCreationColumnId, setTaskCreationColumnId] = useState(null);
    const [columnToDeleteId, setColumnToDeleteId] = useState(null);
    const [columnToDeleteTitle, setColumnToDeleteTitle] = useState('');
    const [boardToDelete, setBoardToDelete] = useState(null);

    const handleLogout = () => {
            setCurrentUser(null); 
            setBoard(null);

            if (onLogout) {
                onLogout();
            } else {
                apiClient.clearToken();
                navigate('/login');
            }
        };

    // Load current user and available boards on mount
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const user = await apiClient.getUserMe();
                setCurrentUser(user);

                // Load available boards
                setLoadingBoards(true);
                const boardsList = await apiClient.getSharedBoards();
                setAvailableBoards(boardsList || []);
            } catch (error) {
                console.error("Failed to load initial data:", error);
                if (error.message.includes('token is missing') || error.message.includes('401')) {
                    if (onLogout) {
                        onLogout();
                    } else {
                        apiClient.clearToken();
                    }
                }
            } finally {
                setLoadingBoards(false); //
            }
        };

        loadInitialData();
    }, [navigate]);

    const loadBoardData = useCallback(async (boardId) => {
        setLoading(true);
        try {
            // Load board details
            const boardDetails = await apiClient.getBoard(boardId);

            // Load columns
            const apiColumns = await apiClient.getColumns(boardId);

            // Load tasks for each column
            const columnsWithTasksPromises = apiColumns.map(async (column) => {
                const tasks = await apiClient.getTasks(column.id);
                return { ...column, tasks: tasks || [] };
            });

            const columnsWithTasks = await Promise.all(columnsWithTasksPromises);

            // Load board users
            let users = [];
            try {
                users = await apiClient.getBoardUsers(boardId) || [];
            } catch (err) {
                console.warn('Failed to load board users', err);
                users = [];
            }

            const transformedBoard = transformApiToBoardFormat(boardDetails, columnsWithTasks, users);

            setBoard(transformedBoard);
            setBoardUsers(users);

        } catch (error) {
            console.error("Failed to load board details:", error);
            if (error.message.includes('token is missing') || error.message.includes('401')) {
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
        if (boardId && currentUser) {
            loadBoardData(boardId);
        }
    }, [boardId, currentUser, loadBoardData]);

    const handleCreateTask = async (columnId, taskData) => {
        try {
            const newTask = await apiClient.createTask(columnId, taskData);

            // Reload board data
            loadBoardData(boardId);
        } catch (error) {
            console.error("Error creating task:", error);
            throw new Error(error.message || "Failed to create task");
        }
    };

    const handleUpdateTask = async (taskId, taskData) => {
        try {
            await apiClient.updateTask(taskId, taskData);
            loadBoardData(boardId);
        } catch (error) {
            console.error("Error updating task:", error);
            throw new Error(error.message || "Failed to update task");
        }
    };

    const handleCreateColumn = async (columnName) => {
        try {
            await apiClient.createColumn(boardId, columnName);
            loadBoardData(boardId);
            setShowCreateColumn(false);
        } catch (error) {
            console.error("Error creating column:", error);
            throw new Error(error.message || "Failed to create column");
        }
    };

    const handleDeleteColumn = async () => {
        try {
            await apiClient.deleteColumn(columnToDeleteId);
            loadBoardData(boardId);
            setShowConfirmDeleteColumn(false);
        } catch (error) {
            console.error("Error deleting column:", error);
        }
    };

    const handleCreateNewBoard = async (name) => {
        try {
            const newBoard = await apiClient.createBoard(name);
            setAvailableBoards(prev => [...prev, newBoard]);
            setShowCreateBoard(false);
            // Navigate to the new board
            navigate(`/board/${newBoard.id}`);
        } catch (error) {
            console.error("Error creating board:", error);
            throw new Error(error.message || "Не удалось создать доску.");
        }
    };

    const handleDeleteBoard = async () => {
        try {
            await apiClient.deleteBoard(boardToDelete.id);

            // Remove the board from the list
            setAvailableBoards(prev => prev.filter(b => b.id !== boardToDelete.id));

            // If we're currently on the deleted board, redirect to dashboard
            if (Number(boardId) === boardToDelete.id) {
                navigate('/dashboard');
            }

            setShowConfirmDeleteBoard(false);
            setBoardToDelete(null);
            setBoardMenuOpen(null);
        } catch (error) {
            console.error("Error deleting board:", error);
            alert(error.message || "Failed to delete board");
        }
    };

    const handleMoveLocal = (newBoard) => {
        setBoard(newBoard);
    };

    const handleReloadBoard = () => {
        loadBoardData(boardId);
    };

    // Close board menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.board-item-container')) {
                setBoardMenuOpen(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    if (loading) {
        return (
            <div className="app-root">
                <div className="main-area" style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <div>Loading board...</div>
                </div>
            </div>
        );
    }

    if (!board) {
        return (
            <div className="app-root">
                <div className="main-area" style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <div>Board not found</div>
                    <button onClick={() => navigate('/dashboard')} className="btn" style={{ marginTop: '20px' }}>
                        Go to Dashboard
                    </button>
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
                        <Link to="/dashboard" className="board-item">
                            <ArrowLeft size={16} style={{ marginRight: '8px' }} />
                            Back to Dashboard
                        </Link>

                        {loadingBoards ? (
                            <div className="board-item">Loading boards...</div>
                        ) : (
                            availableBoards.map(boardItem => {
                                const isCurrentBoard = boardItem.id === Number(boardId);
                                const isOwner = currentUser && boardItem.owner_id === currentUser.id;

                                return (
                                    <div
                                        key={boardItem.id}
                                        className={`board-item-container ${isCurrentBoard ? 'active' : ''}`}
                                        style={{
                                            position: 'relative',
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '4px'
                                        }}
                                    >
                                        <Link
                                            to={`/board/${boardItem.id}`}
                                            className="board-item"
                                            style={{
                                                flex: 1,
                                                display: 'block',
                                                padding: '8px 10px',
                                                textDecoration: 'none',
                                                color: isCurrentBoard ? 'var(--color-accent)' : 'var(--color-text-muted)',
                                                fontWeight: isCurrentBoard ? '700' : '500',
                                                backgroundColor: isCurrentBoard ? 'var(--color-card)' : 'transparent',
                                                borderRadius: '4px'
                                            }}
                                        >
                                            {boardItem.name}
                                            {isOwner && (
                                                <span style={{
                                                    fontSize: '10px',
                                                    marginLeft: '6px',
                                                    opacity: 0.7,
                                                    color: 'var(--color-text-muted)'
                                                }}>
                                                    (owner)
                                                </span>
                                            )}
                                        </Link>

                                        {isOwner && (
                                            <button
                                                className="icon-btn"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setBoardMenuOpen(boardMenuOpen === boardItem.id ? null : boardItem.id);
                                                }}
                                                style={{
                                                    marginLeft: '4px',
                                                    padding: '4px',
                                                    opacity: 0.6
                                                }}
                                            >
                                                <MoreVertical size={14} />
                                            </button>
                                        )}

                                        {boardMenuOpen === boardItem.id && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: '0',
                                                    right: '0',
                                                    zIndex: 100,
                                                    background: 'var(--color-panel)',
                                                    border: '1px solid var(--color-border-default)',
                                                    borderRadius: '8px',
                                                    marginTop: '2px',
                                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <button
                                                    className="board-item"
                                                    style={{
                                                        width: '100%',
                                                        textAlign: 'left',
                                                        padding: '8px 12px',
                                                        color: 'var(--color-danger)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px'
                                                    }}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setBoardToDelete(boardItem);
                                                        setShowConfirmDeleteBoard(true);
                                                        setBoardMenuOpen(null);
                                                    }}
                                                >
                                                    <Trash2 size={14} />
                                                    Delete Board
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}

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
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <User size={20} />
                        {currentUser?.name || 'Account'}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-area">
                <div className="topbar">
                    <div className="top-left">{board.title}</div>
                    <div className="top-right">
                        <button
                            className="btn"
                            onClick={() => setShowAddUser(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <UserPlus size={16} />
                            Add User
                        </button>
                    </div>
                </div>

                <div className="board-wrap">
                    <Board
                        board={board}
                        onMoveLocal={handleMoveLocal}
                        onOpenCreate={(columnId) => {
                            setTaskCreationColumnId(columnId);
                            setShowCreate(true);
                        }}
                        onOpenEdit={(cardId) => {
                            const card = board.cards.find(c => String(c.id) === String(cardId));
                            if (card) {
                                setEditingCard(card);
                                setShowEdit(true);
                            }
                        }}
                        onOpenCreateColumn={() => setShowCreateColumn(true)}
                        onRequestDeleteColumn={(columnId, columnTitle) => {
                            setColumnToDeleteId(columnId);
                            setColumnToDeleteTitle(columnTitle);
                            setShowConfirmDeleteColumn(true);
                        }}
                        currentBoardId={boardId}
                        onReloadBoard={handleReloadBoard}
                    />
                </div>
            </div>

            {/* Modals */}
            {showCreate && (
                <CreateTaskModal
                    onClose={() => setShowCreate(false)}
                    onCreate={handleCreateTask}
                    boardUsers={boardUsers}
                    currentColumnId={taskCreationColumnId}
                />
            )}

            {showEdit && editingCard && (
                <EditTaskModal
                    card={editingCard}
                    onClose={() => {
                        setShowEdit(false);
                        setEditingCard(null);
                    }}
                    onSave={handleUpdateTask}
                    boardUsers={boardUsers}
                    currentUserId={currentUser?.id}
                />
            )}

            {showAddUser && (
                <AddUserModal
                    onClose={() => setShowAddUser(false)}
                    onSelectAssignee={(userName) => {
                        // Handle assignee selection if needed
                    }}
                    onAddUser={() => {
                        loadBoardData(boardId);
                    }}
                    currentBoardId={boardId}
                />
            )}

            {showCreateColumn && (
                <CreateColumnModal
                    onClose={() => setShowCreateColumn(false)}
                    onCreate={handleCreateColumn}
                />
            )}

            {showCreateBoard && (
                <CreateBoardModal
                    onClose={() => setShowCreateBoard(false)}
                    onCreate={handleCreateNewBoard}
                />
            )}

            {showConfirmDeleteColumn && (
                <ConfirmModal
                    title="Delete Column"
                    message={`Are you sure you want to delete column "${columnToDeleteTitle}"? All tasks in this column will also be deleted.`}
                    onCancel={() => {
                        setShowConfirmDeleteColumn(false);
                        setColumnToDeleteId(null);
                        setColumnToDeleteTitle('');
                    }}
                    onConfirm={() => {
                        handleDeleteColumn();
                        setColumnToDeleteId(null);
                        setColumnToDeleteTitle('');
                    }}
                />
            )}

            {showConfirmDeleteBoard && boardToDelete && (
                <ConfirmModal
                    title="Delete Board"
                    message={`Are you sure you want to delete board "${boardToDelete.name}"? All columns, tasks, and data in this board will be permanently deleted. This action cannot be undone.`}
                    onCancel={() => {
                        setShowConfirmDeleteBoard(false);
                        setBoardToDelete(null);
                    }}
                    onConfirm={handleDeleteBoard}
                />
            )}

            {/* Account Menu Modal */}
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

export default BoardPage;