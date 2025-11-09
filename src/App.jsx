import React, { useState } from 'react';
// Компоненты
import Board from './components/Board';
import CreateTaskModal from './components/CreateTaskModal';
import EditTaskModal from './components/EditTaskModal';
import AccountMenu from './components/AccountMenu';
import AddUserModal from './components/AddUserModal';
// Прочее
import { initialBoard } from './utils/sampleData'; // Данные
import { UserPlus, ChevronUp, ChevronDown } from 'lucide-react'; // Иконки

// Временные данные для сайдбара
const mockBoards = [
  { id: 'p1', title: 'Project 1', isActive: true },
  { id: 'p2', title: 'Project 2', isActive: false },
  { id: 'p3', title: 'Project 3', isActive: false },
];

function App() {
  const [board, setBoard] = useState(initialBoard);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [showAccount, setShowAccount] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  // Состояние для модального окна выбора исполнителя (для CreateTaskModal)
  const [assigneeCallback, setAssigneeCallback] = useState(null);
  const [showBoardsMenu, setShowBoardsMenu] = useState(true); // Для управления выпадающим списком

  // Для бекенда
  const handleOpenCreate = (columnId) => {
    setShowCreate(true);
  };

  const handleCreate = (columnId, card) => {
    // локальное создание
    const id = `card-${Date.now()}`;
    const newCard = { id, ...card };
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
    const nb = { ...board };
    nb.cards = nb.cards.map(c => c.id === cardId ? { ...c, ...payload } : c);
    setBoard(nb);
    setShowEdit(false);
    setEditingCard(null);
  };

  const handleMoveLocal = (newBoard) => setBoard(newBoard);

  // Логика для открытия модалки AddUserModal и установки callback
  const handleOpenAddUserModal = (callback) => {
    setAssigneeCallback(() => callback);
    setShowAddUser(true);
  };

  const handleCloseAddUserModal = () => {
    setShowAddUser(false);
    setAssigneeCallback(null);
  };


  return (
    <div className="app-root">
      <aside className="sidebar">
        <div className="sidebar-top">
          <h2 className="app-title">Project 1</h2>
          <div className="boards-section">
            <button
              className="boards-toggle btn-link"
              onClick={() => setShowBoardsMenu(!showBoardsMenu)}
            >
              Boards {showBoardsMenu ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showBoardsMenu && (
              <div className="boards-list">
                {mockBoards.map(b => (
                  <button
                    key={b.id}
                    className={`board-item btn-link ${b.isActive ? 'active' : ''}`}
                  >
                    {b.title}
                  </button>
                ))}
                <button className="btn-link new-board-btn">+ New Board</button>
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
        <EditTaskModal card={editingCard} onClose={() => setShowEdit(false)} onSave={handleSaveEdit} />
      )}

      {showAccount && (
        <AccountMenu onClose={() => setShowAccount(false)} onOpenAddUser={() => setShowAddUser(true)} />
      )}

      {showAddUser && (
        <AddUserModal
          onClose={handleCloseAddUserModal}
          onSelectAssignee={assigneeCallback}
        />
      )}
    </div>
  );
}

export default App;