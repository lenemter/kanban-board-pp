import React, { useState, useEffect, useCallback } from 'react';
// Компоненты
import Board from './components/Board';
import CreateTaskModal from './components/CreateTaskModal';
import EditTaskModal from './components/EditTaskModal';
import AccountMenu from './components/AccountMenu';
import AddUserModal from './components/AddUserModal';
import AuthPage from './components/AuthPage'; 
import CreateBoardModal from './components/CreateBoardModal';
import CreateColumnModal from './components/CreateColumnModal';
import apiClient from './api';
import ConfirmModal from './components/ConfirmModal';
// Прочее
import { UserPlus, ChevronUp, ChevronDown } from 'lucide-react'; 

// Утилита для преобразования данных API в формат фронтенда
const transformApiToBoardFormat = (boardDetails, apiColumnsWithTasks, boardUsers = []) => {
  const board = {
    id: boardDetails.id,
    title: boardDetails.name,
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
          .sort((a, b) => a.position_in_column - b.position_in_column) 
          .map(task => task.id),
      });

      col.tasks.forEach(task => {
        let assigneeId = null;
        let assigneeName = '';
        if (task.assignee_id) {
          assigneeId = task.assignee_id;
        } else if (task.assignee && typeof task.assignee === 'number') {
          assigneeId = task.assignee;
        } else if (task.assignee && typeof task.assignee === 'string') {
          // sometimes backend returns a name string
          assigneeName = task.assignee;
        }

        if (task.assignee_name) assigneeName = task.assignee_name;
        else if (!assigneeName && assigneeId) {
          const u = (boardUsers || []).find(x => x.id === assigneeId || x.id === String(assigneeId));
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
        });
      });
    });

  return board;
};


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!apiClient.token); 
  const [loading, setLoading] = useState(false);
  
  // СОСТОЯНИЕ ДОСКИ
  const [availableBoards, setAvailableBoards] = useState([]); 
  const [currentBoardId, setCurrentBoardId] = useState(null); 
  const [board, setBoard] = useState(null); 
  const [boardUsers, setBoardUsers] = useState([]);
  
  // СОСТОЯНИЕ МОДАЛЬНЫХ ОКОН
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [showAccount, setShowAccount] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [showCreateColumn, setShowCreateColumn] = useState(false);
  const [showConfirmDeleteColumn, setShowConfirmDeleteColumn] = useState(false);
  const [columnToDeleteId, setColumnToDeleteId] = useState(null);
  const [columnToDeleteTitle, setColumnToDeleteTitle] = useState('');
  const [assigneeCallback, setAssigneeCallback] = useState(null);
  const [showBoardsMenu, setShowBoardsMenu] = useState(true);
  
  // СОСТОЯНИЕ КОЛОНКИ ДЛЯ СОЗДАНИЯ ЗАДАЧ
  const [taskCreationColumnId, setTaskCreationColumnId] = useState(null); 

  // ----------------------------------------------------
  // ЛОГИКА АУТЕНТИФИКАЦИИ И ВЫХОДА
  // ----------------------------------------------------

  const handleLogout = useCallback(() => {
    apiClient.clearToken(); 
    setIsLoggedIn(false);   
    setBoard(null);
    setAvailableBoards([]);
    setCurrentBoardId(null);
    setShowAccount(false);
  }, []);

  const handleLoginSuccess = useCallback(() => {
    setIsLoggedIn(true);
    loadInitialData();
  }, []);
  
  // ----------------------------------------------------
  // ЛОГИКА ЗАГРУЗКИ ДОСОК
  // ----------------------------------------------------
  
  const loadBoardData = useCallback(async (boardId) => {
    setLoading(true);
    try {
        const apiColumns = await apiClient.getColumns(boardId);
        
        const columnsWithTasksPromises = apiColumns.map(async (column) => {
            const tasks = await apiClient.getTasks(column.id);
            return { ...column, tasks: tasks || [] };
        });

        const columnsWithTasks = await Promise.all(columnsWithTasksPromises);
        
        const boardDetails = availableBoards.find(b => b.id === boardId)
                   || await apiClient.getBoard(boardId);

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
            handleLogout();
        }
    } finally {
        setLoading(false);
    }
  }, [availableBoards, handleLogout]); 

  const loadInitialData = useCallback(async () => {
    if (!apiClient.token) return;

    setLoading(true);
    try {
        const boardsList = await apiClient.getSharedBoards();
        
        if (boardsList && boardsList.length > 0) {
            setAvailableBoards(boardsList);

            const firstBoardId = boardsList[0].id;
            setCurrentBoardId(firstBoardId);
            await loadBoardData(firstBoardId);

        } else {
            setAvailableBoards([]);
            setBoard({ id: 'empty', title: 'Нет доступных досок', cards: [], columns: [] }); 
        }
    } catch (error) {
        console.error("Failed to load initial boards:", error);
        handleLogout();
    } finally {
        setLoading(false);
    }
  }, [handleLogout, loadBoardData]); 

  useEffect(() => {
    if (isLoggedIn && !board) {
      loadInitialData();
    }
  }, [isLoggedIn, loadInitialData, board]);
  
  // ----------------------------------------------------
  // ЛОГИКА СОЗДАНИЯ ДОСОК
  // ----------------------------------------------------
  const handleCreateNewBoard = async (name) => {
    try {
        const newBoard = await apiClient.createBoard(name); 
        
        setAvailableBoards(prev => [...prev, newBoard]);
        setCurrentBoardId(newBoard.id);
        
        await loadBoardData(newBoard.id); 
        
        setShowCreateBoard(false);
        
    } catch (error) {
        console.error("Error creating board:", error);
        throw new Error(error.message || "Не удалось создать доску.");
    }
  };

  
  // ----------------------------------------------------
  // ЛОГИКА СОЗДАНИЯ КОЛОНКИ
  // ----------------------------------------------------

  const handleCreateNewColumn = async (columnName) => {
    if (!currentBoardId) {
        throw new Error("Не выбран ID доски для создания колонки.");
    }

    setLoading(true);
    try {
        const newColumnApi = await apiClient.createColumn(currentBoardId, columnName);

        setBoard(prevBoard => {
            if (!prevBoard) return prevBoard;
            
            const newBoard = { ...prevBoard };
            
            newBoard.columns = [
                ...newBoard.columns,
                {
                    id: newColumnApi.id,
                    title: newColumnApi.name, 
                    card_ids: [],
                }
            ];
            
            return newBoard;
        });

        setShowCreateColumn(false);

    } catch (error) {
        console.error("Error creating column:", error);
        throw new Error(error.message || "Не удалось создать колонку.");
    } finally {
        setLoading(false);
    }
  };

  // ----------------------------------------------------
  // Удаление колонки
  // ----------------------------------------------------
  const handleRequestDeleteColumn = (columnId, columnTitle = '') => {
    if (!columnId) return;
    setColumnToDeleteId(columnId);
    setColumnToDeleteTitle(columnTitle);
    setShowConfirmDeleteColumn(true);
  };

  const handleConfirmDeleteColumn = async () => {
    if (!columnToDeleteId) return;
    setLoading(true);
    try {
      await apiClient.deleteColumn(columnToDeleteId);
      setBoard(prev => {
        if (!prev) return prev;
        const nb = { ...prev };
        nb.columns = nb.columns.filter(c => c.id !== columnToDeleteId);
        nb.cards = nb.cards.filter(card => card.columnId !== columnToDeleteId);
        return nb;
      });
    } catch (error) {
      console.error('Failed to delete column, falling back to local remove:', error);
      setBoard(prev => {
        if (!prev) return prev;
        const nb = { ...prev };
        nb.columns = nb.columns.filter(c => c.id !== columnToDeleteId);
        nb.cards = nb.cards.filter(card => card.columnId !== columnToDeleteId);
        return nb;
      });
    } finally {
      setLoading(false);
      setShowConfirmDeleteColumn(false);
      setColumnToDeleteId(null);
      setColumnToDeleteTitle('');
    }
  };

  // ----------------------------------------------------
  // МЕТОДЫ ЗАДАЧ
  // ----------------------------------------------------
  
  const handleOpenCreate = (columnId) => {
    setTaskCreationColumnId(columnId);
    setShowCreate(true);
  };

  const handleCreate = async (columnId, card) => {
    setLoading(true);
    try {
      const payload = {
        title: card.title,
        description: card.description,
        priority: card.priority,
        due_date: card.due_date,
      };
      if (card.assignee_id !== undefined) payload.assignee_id = card.assignee_id;

      const created = await apiClient.createTask(columnId, payload);

      const createdId = created.id ?? created.task_id ?? created._id ?? created.id;
      let assigneeId = created.assignee_id ?? created.assignee ?? card.assignee_id ?? null;
      let assigneeName = created.assignee_name ?? created.assignee_name ?? '';
      if (!assigneeName && assigneeId) {
        const u = boardUsers.find(u => String(u.id) === String(assigneeId) || String(u.user_id) === String(assigneeId) || u.email === assigneeId);
        assigneeName = u ? (u.name || u.email || u.id) : '';
      }

      const newCard = {
        id: createdId ?? `card-${Date.now()}`,
        columnId,
        title: created.title ?? payload.title,
        description: created.description ?? payload.description,
        priority: created.priority ?? payload.priority,
        due_date: created.due_date ?? payload.due_date,
        assignee_id: assigneeId,
        assignee_name: assigneeName,
      };

      const nb = { ...board };
      nb.cards = [...nb.cards, newCard];
      const col = nb.columns.find(c => String(c.id) === String(columnId));
      if (col) {
        col.card_ids = [newCard.id, ...(col.card_ids || [])];
      }
      setBoard(nb);
      setShowCreate(false);
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task: ' + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (cardId) => {
    const c = board.cards.find(x => x.id === cardId);
    setEditingCard(c);
    setShowEdit(true);
  };

  const handleSaveEdit = async (cardId, payload) => {
    setLoading(true);
    try {
      const updatePayload = {
        title: payload.title,
        description: payload.description,
        priority: payload.priority,
        due_date: payload.due_date,
      };
      if (payload.assignee_id !== undefined) updatePayload.assignee_id = payload.assignee_id;

      const updated = await apiClient.updateTask(cardId, updatePayload);

      const nb = { ...board };
      nb.cards = nb.cards.map(c => {
        if (c.id !== cardId) return c;
        const assigneeId = updated.assignee_id ?? payload.assignee_id ?? c.assignee_id;
        let assigneeName = updated.assignee_name ?? '';
        if (!assigneeName && assigneeId) {
          const u = boardUsers.find(u => String(u.id) === String(assigneeId) || u.email === assigneeId);
          assigneeName = u ? (u.name || u.email || u.id) : '';
        }

        return {
          ...c,
          title: updated.title ?? payload.title ?? c.title,
          description: updated.description ?? payload.description ?? c.description,
          priority: updated.priority ?? payload.priority ?? c.priority,
          due_date: updated.due_date ?? payload.due_date ?? c.due_date,
          assignee_id: assigneeId,
          assignee_name: assigneeName,
        };
      });
      setBoard(nb);
      setShowEdit(false);
      setEditingCard(null);
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('Failed to update task: ' + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  const handleMoveLocal = (newBoard) => {
    setBoard(newBoard);

    (async () => {
      if (!currentBoardId) return;
      try {
        const ids = newBoard.columns.map(c => c.id);
        const n = ids.length;
        const offset = n * 10;

        for (let i = 0; i < n; i++) {
          try {
            await apiClient.updateColumn(ids[i], { position: i + offset });
          } catch (err) {
            console.error('Temporary position update failed for column', ids[i], err);
          }
        }

        for (let i = 0; i < n; i++) {
          try {
            await apiClient.updateColumn(ids[i], { position: i });
          } catch (err) {
            console.error('Final position update failed for column', ids[i], err);
          }
        }
      } catch (error) {
        console.error('Failed to persist column order:', error);
        try {
          await loadBoardData(currentBoardId);
        } catch (e) {
          console.error('Failed to reload board after failing to persist column order:', e);
        }
      }
    })();
  };

  const handleOpenAddUserModal = (callback) => {
    setAssigneeCallback(() => callback);
    setShowAddUser(true);
  };

  const handleCloseAddUserModal = () => {
    setShowAddUser(false);
    setAssigneeCallback(null);
  };
  
  // ----------------------------------------------------
  // RENDER
  // ----------------------------------------------------

  if (!isLoggedIn) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }
  
  if (loading || !board) {
    return (
      <div className="loading-screen" style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        height: '100vh', fontSize: '24px', color: '#61bd4f', background: '#0d1117'
      }}>
        Loading Board Data...
      </div>
    );
  }
  
  return (
    <div className="app-root">
      <aside className="sidebar">
        <div className="sidebar-top">
          <h2 className="app-title">{board.title || 'Kanban'}</h2> 
          <div className="boards-section">
            <button
              className="boards-toggle btn-link"
              onClick={() => setShowBoardsMenu(!showBoardsMenu)}
            >
              Boards {showBoardsMenu ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showBoardsMenu && (
              <div className="boards-list">
                {availableBoards.map(b => (
                  <button
                    key={b.id}
                    className={`board-item btn-link ${b.id === currentBoardId ? 'active' : ''}`}
                    onClick={() => {
                        if (b.id !== currentBoardId) {
                            setCurrentBoardId(b.id);
                            loadBoardData(b.id); 
                        }
                    }}
                  >
                    {b.name}
                  </button>
                ))}
                
                <button 
                    className="btn-link new-board-btn"
                    onClick={() => setShowCreateBoard(true)} 
                >
                    + New Board
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="sidebar-bottom">
          <button className="account-btn" onClick={() => setShowAccount(true)}>Account</button>
        </div>
      </aside>
 
      <main className="main-area">
        <header className="topbar">
          <div className="top-left">{board.title}</div>
          <div className="top-right">
            <button className="btn" onClick={() => setShowAddUser(true)}>
              <UserPlus size={18} className="btn-icon" />
              Add Users
            </button>
          </div>
        </header>

        <Board
          board={board}
          onMoveLocal={handleMoveLocal}
          onTaskMove={async (taskId, destColumnId, destIndex) => {
            try {
              const columnIdNum = isNaN(Number(destColumnId)) ? destColumnId : Number(destColumnId);
              await apiClient.updateTask(taskId, { column_id: columnIdNum, position: destIndex });
            } catch (err) {
              console.error('Failed to persist task move:', err);
              try { if (currentBoardId) await loadBoardData(currentBoardId); } catch(e) { console.error(e); }
            }
          }}
          onOpenCreate={handleOpenCreate}
          onOpenEdit={handleOpenEdit}
            onOpenCreateColumn={() => setShowCreateColumn(true)}
            onRequestDeleteColumn={handleRequestDeleteColumn}
        />
      </main>

      {showCreate && (
        <CreateTaskModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
          currentColumnId={taskCreationColumnId}
          onOpenAssigneeManager={handleOpenAddUserModal}
          boardUsers={boardUsers}
        />
      )}

      {showEdit && editingCard && (
        <EditTaskModal
          card={editingCard}
          onClose={() => setShowEdit(false)}
          onSave={handleSaveEdit}
          boardUsers={boardUsers}
        />
      )}

      {showAccount && (
        <AccountMenu
          onClose={() => setShowAccount(false)}
          onOpenAddUser={() => setShowAddUser(true)}
          onLogout={handleLogout} 
        />
      )}
      {showAddUser && (
        <AddUserModal currentBoardId={currentBoardId} onClose={handleCloseAddUserModal} onSelectAssignee={assigneeCallback} />
      )}
      
      {showCreateBoard && (
        <CreateBoardModal
          onClose={() => setShowCreateBoard(false)}
          onCreate={handleCreateNewBoard}
        />
      )}
      
      {showCreateColumn && (
        <CreateColumnModal
          onClose={() => setShowCreateColumn(false)}
          onCreate={handleCreateNewColumn}
        />
      )}
      {showConfirmDeleteColumn && (
        <ConfirmModal
          title="Delete column"
          message={`Are you sure you want to delete column "${columnToDeleteTitle || columnToDeleteId}"? This will also remove its tasks.`}
          onCancel={() => { setShowConfirmDeleteColumn(false); setColumnToDeleteId(null); setColumnToDeleteTitle(''); }}
          onConfirm={handleConfirmDeleteColumn}
        />
      )}
    </div>
  );
}

export default App;