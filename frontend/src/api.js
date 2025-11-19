const API_BASE_URL = 'http://localhost:8000/api/v1';

class ApiClient {

  setToken(token) {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('access_token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token && !options.skipAuth) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (response.status === 204) {
        return null;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Request failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

constructor(baseURL = API_BASE_URL) {
  this.baseURL = baseURL;
  this.token = localStorage.getItem('authToken'); 
}

  // Auth
  async login(username, password) {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const data = await this.request('/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
      skipAuth: true,
    });

    this.setToken(data.access_token);
    return data;
  }

  async register(email, name, password) {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify({ email, name, password }),
      skipAuth: true,
    });
  }

  async verifyEmail(token) {
    return this.request(`/verify/${token}`, {
      method: 'GET',
      skipAuth: true,
    });
  }

  clearToken() {
    localStorage.removeItem('authToken');
    this.token = null;
  }

  async resendVerification(username, password) {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    return this.request('/resend-verification', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
      skipAuth: true,
    });
  }

  // Users
  async getUserMe() {
    return this.request('/users/me', { method: 'GET' });
  }

  async updateUserMe(data) {
    return this.request('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getUser(userId) {
    return this.request(`/users/${userId}`, { method: 'GET' });
  }

  // Boards
  async getOwnedBoards() {
    return this.request('/boards', { method: 'GET' });
  }

  async getSharedBoards() {
    return this.request('/boards/shared', { method: 'GET' });
  }

  async getBoard(boardId) {
    return this.request(`/boards/${boardId}`, { method: 'GET' });
  }

  async createBoard(name) {
    return this.request('/boards', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async updateBoard(boardId, data) {
    return this.request(`/boards/${boardId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteBoard(boardId) {
    return this.request(`/boards/${boardId}`, { method: 'DELETE' });
  }

  async addUserToBoard(boardId, userId) {
    return this.request(`/boards/${boardId}/users?user_id=${userId}`, {
      method: 'POST',
    });
  }

  async removeUserFromBoard(boardId, userId) {
    return this.request(`/boards/${boardId}/users?user_id=${userId}`, {
      method: 'DELETE',
    });
  }

  // Board Tags
  async getBoardTags(boardId) {
    return this.request(`/boards/${boardId}/tags`, { method: 'GET' });
  }

  async createBoardTag(boardId, name, color) {
    return this.request(`/boards/${boardId}/tags`, {
      method: 'POST',
      body: JSON.stringify({ name, color }),
    });
  }

  async getBoardTag(tagId) {
    return this.request(`/board-tags/${tagId}`, { method: 'GET' });
  }

  async updateBoardTag(tagId, boardId, data) {
    return this.request(`/board-tags/${tagId}?board_id=${boardId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteBoardTag(tagId, boardId) {
    return this.request(`/board-tags/${tagId}?board_id=${boardId}`, {
      method: 'DELETE',
    });
  }

  // Columns
  async getColumns(boardId) {
    return this.request(`/boards/${boardId}/columns`, { method: 'GET' });
  }

  async getColumn(columnId) {
    return this.request(`/columns/${columnId}`, { method: 'GET' });
  }

  async createColumn(boardId, name) {
    return this.request(`/boards/${boardId}/columns`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async updateColumn(columnId, data) {
    return this.request(`/columns/${columnId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteColumn(columnId) {
    return this.request(`/columns/${columnId}`, { method: 'DELETE' });
  }

  // Tasks
  async getTasks(columnId) {
    return this.request(`/columns/${columnId}/tasks`, { method: 'GET' });
  }

  async getTask(taskId) {
    return this.request(`/tasks/${taskId}`, { method: 'GET' });
  }

  async createTask(columnId, data) {
    return this.request(`/columns/${columnId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(taskId, data) {
    return this.request(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(taskId) {
    return this.request(`/tasks/${taskId}`, { method: 'DELETE' });
  }

  async addTaskTag(taskId, tagId) {
    return this.request(`/tasks/${taskId}/tags`, {
      method: 'POST',
      body: JSON.stringify({ tag_id: tagId }),
    });
  }

  async deleteTaskTag(taskTagId) {
    return this.request(`/task-tags/${taskTagId}`, { method: 'DELETE' });
  }

  // Task Comments
  async getTaskComments(taskId) {
    return this.request(`/tasks/${taskId}/comments`, { method: 'GET' });
  }

  async createTaskComment(taskId, content) {
    return this.request(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async updateTaskComment(commentId, content) {
    return this.request(`/comments/${commentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    });
  }

  async deleteTaskComment(commentId) {
    return this.request(`/comments/${commentId}`, { method: 'DELETE' });
  }

  // Subtasks
  async getSubtasks(taskId) {
    return this.request(`/tasks/${taskId}/subtasks`, { method: 'GET' });
  }

  async createSubtask(taskId, title) {
    return this.request(`/tasks/${taskId}/subtasks`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  }

  async updateSubtask(subtaskId, data) {
    return this.request(`/subtasks/${subtaskId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteSubtask(subtaskId) {
    return this.request(`/subtasks/${subtaskId}`, { method: 'DELETE' });
  }
}

// Создаем единственный экземпляр клиента
const apiClient = new ApiClient();

export default apiClient;

// Также экспортируем класс для создания дополнительных экземпляров
export { ApiClient };
