import React, { useState, useEffect, useCallback } from 'react';
// Компоненты
import Board from './components/Board';
import CreateTaskModal from './components/CreateTaskModal';
import EditTaskModal from './components/EditTaskModal';
import AccountMenu from './components/AccountMenu';
import AddUserModal from './components/AddUserModal';
import AuthPage from './components/AuthPage'; 
import CreateBoardModal from './components/CreateBoardModal';
import apiClient from './api';
// Прочее
import { UserPlus, ChevronUp, ChevronDown } from 'lucide-react'; 

// Утилита для преобразования данных API в формат фронтенда
const transformApiToBoardFormat = (boardDetails, apiColumnsWithTasks) => {
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
                board.cards.push({
                    id: task.id,
                    columnId: col.id,
                    title: task.title,
                    description: task.description,
                });
            });
        });
    
    return board;
};


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!apiClient.token); 
  const [loading, setLoading] = useState(false);
  
  // 📋 СОСТОЯНИЕ ДОСКИ
  const [availableBoards, setAvailableBoards] = useState([]); 
  const [currentBoardId, setCurrentBoardId] = useState(null); 
  const [board, setBoard] = useState(null); 
  
  // 🆕 СОСТОЯНИЕ МОДАЛЬНЫХ ОКОН
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [showAccount, setShowAccount] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showCreateBoard, setShowCreateBoard] = useState(false); // <-- НОВОЕ СОСТОЯНИЕ
  const [assigneeCallback, setAssigneeCallback] = useState(null);
  const [showBoardsMenu, setShowBoardsMenu] = useState(true);

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
  // ЛОГИКА ЗАГРУЗКИ ДАННЫХ
  // ----------------------------------------------------
  
  // Функция загрузки колонок и задач для одной доски
  const loadBoardData = useCallback(async (boardId) => {
    setLoading(true);
    try {
        const apiColumns = await apiClient.getColumns(boardId);
        
        const columnsWithTasksPromises = apiColumns.map(async (column) => {
            const tasks = await apiClient.getTasks(column.id);
            return { ...column, tasks: tasks || [] };
        });

        const columnsWithTasks = await Promise.all(columnsWithTasksPromises)
        const boardDetails = availableBoards.find(b => b.id === boardId) 
                             || await apiClient.getBoard(boardId);
        const transformedBoard = transformApiToBoardFormat(boardDetails, columnsWithTasks);
        setBoard(transformedBoard);

    } catch (error) {
        console.error("Failed to load board details:", error);
        if (error.message.includes('token is missing') || error.message.includes('401')) {
            handleLogout();
        }
    } finally {
        setLoading(false);
    }
  }, [availableBoards, handleLogout]); 

  // Функция для загрузки списка досок и первой доски
  const loadInitialData = useCallback(async () => {
    if (!apiClient.token) return;

    setLoading(true);
    try {
        const boardsList = await apiClient.getOwnedBoards();
        
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

  // Эффект: Загружаем данные при наличии токена и входе
  useEffect(() => {
    if (isLoggedIn && !board) {
      loadInitialData();
    }
  }, [isLoggedIn, loadInitialData, board]);
  

  const handleCreateNewBoard = async (name) => {
    try {
        // Вызов API для создания доски
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
  // МЕТОДЫ ДОСКИ 
  // ----------------------------------------------------
  const handleOpenCreate = (columnId) => {
    setShowCreate(true);
  };

  const handleCreate = (columnId, card) => {
    // TODO: Здесь должен быть вызов apiClient.createTask(columnId, card)
    const id = `card-${Date.now()}`;
    const newCard = { id, columnId, ...card };
    const nb = { ...board };
    nb.cards.push(newCard);
    const col = nb.columns.find(c => c.id === columnId);
    col.card_ids.unshift(id);
    setBoard(nb);
    setShowCreate(false);
  };

  const handleOpenEdit = (cardId) => {
    const c = board.cards.find(x => x.id === cardId);
    setEditingCard(c);
    setShowEdit(true);
  };

  const handleSaveEdit = (cardId, payload) => {
    // TODO: Здесь должен быть вызов apiClient.updateTask(cardId, payload)
    const nb = { ...board };
    nb.cards = nb.cards.map(c => c.id === cardId ? { ...c, ...payload } : c);
    setBoard(nb);
    setShowEdit(false);
    setEditingCard(null);
  };

  const handleMoveLocal = (newBoard) => setBoard(newBoard);

  const handleOpenAddUserModal = (callback) => {
    setAssigneeCallback(() => callback);
    setShowAddUser(true);
  };

  const handleCloseAddUserModal = () => {
    setShowAddUser(false);
    setAssigneeCallback(null);
  };

  if (!isLoggedIn) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }
  
  // Экран загрузки
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
  
  // Если вошел и доска загружена
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
                            // Переключаем доску
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
          onOpenCreate={handleOpenCreate}
          onOpenEdit={handleOpenEdit}
        />
      </main>

      {showCreate && (
        <CreateTaskModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
          onOpenAssigneeManager={handleOpenAddUserModal}
        />
      )}

      {showEdit && editingCard && (
        <EditTaskModal
          card={editingCard}
          onClose={() => setShowEdit(false)}
          onSave={handleSaveEdit}
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
        <AddUserModal onClose={handleCloseAddUserModal} onSelectAssignee={assigneeCallback} />
      )}
      
      {showCreateBoard && (
        <CreateBoardModal
          onClose={() => setShowCreateBoard(false)}
          onCreate={handleCreateNewBoard}
        />
      )}
    </div>
  );
}

export default App;