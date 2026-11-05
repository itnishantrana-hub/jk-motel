/**
 * JK MOTEL – Frontend API Client
 * Seamless connection to Express.js REST APIs with JWT & MongoDB Atlas
 */

const API_BASE_URL = window.location.port === '5000'
  ? ''
  : 'https://jk-motel.onrender.com';

const Storage = {
  TOKEN_KEY: 'jk_motel_jwt_token',
  USER_KEY: 'jk_motel_user_data',

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },
  setToken(token) {
    if (token) localStorage.setItem(this.TOKEN_KEY, token);
  },
  removeToken() {
    localStorage.removeItem(this.TOKEN_KEY);
  },
  getUser() {
    const raw = localStorage.getItem(this.USER_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },
  setUser(user) {
    if (user) localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },
  removeUser() {
    localStorage.removeItem(this.USER_KEY);
  },
  clearAuth() {
    this.removeToken();
    this.removeUser();
  }
};

async function apiRequest(endpoint, { method = 'GET', data = null, auth = false } = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json'
  };

  const token = Storage.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (auth) {
    throw new Error('Please log in to perform this action.');
  }

  const config = {
    method,
    headers
  };

  if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401 && auth) {
        Storage.clearAuth();
        if (typeof onAuthChange === 'function') onAuthChange(null);
      }
      const message = result.message || `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return result;
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error.message);
    throw error;
  }
}

// Toast Notification System
function showToast(message, type = 'success') {
  let toastContainer = document.getElementById('jkToastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'jkToastContainer';
    toastContainer.className = 'jk-toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `jk-toast jk-toast-${type}`;

  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  toast.innerHTML = `
    <span class="jk-toast-icon">${icon}</span>
    <span class="jk-toast-msg">${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// API Modules
const API = {
  // Authentication
  auth: {
    async register(data) {
      const res = await apiRequest('/api/auth/register', { method: 'POST', data });
      if (res.token && res.user) {
        Storage.setToken(res.token);
        Storage.setUser(res.user);
      }
      return res;
    },
    async login(data) {
      const res = await apiRequest('/api/auth/login', { method: 'POST', data });
      if (res.token && res.user) {
        Storage.setToken(res.token);
        Storage.setUser(res.user);
      }
      return res;
    },
    async me() {
      return await apiRequest('/api/auth/me', { auth: true });
    },
    async updateProfile(data) {
      const res = await apiRequest('/api/auth/profile', { method: 'PUT', data, auth: true });
      if (res.user) Storage.setUser(res.user);
      return res;
    },
    logout() {
      Storage.clearAuth();
    }
  },

  // Categories
  categories: {
    async getAll() {
      return await apiRequest('/api/categories');
    },
    async create(data) {
      return await apiRequest('/api/categories', { method: 'POST', data, auth: true });
    },
    async update(id, data) {
      return await apiRequest(`/api/categories/${id}`, { method: 'PUT', data, auth: true });
    },
    async delete(id) {
      return await apiRequest(`/api/categories/${id}`, { method: 'DELETE', auth: true });
    }
  },

  // Food Menu
  food: {
    async getAll({ category = 'all', search = '', available = null } = {}) {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (search) params.append('search', search);
      if (available !== null) params.append('available', available);
      const query = params.toString() ? `?${params.toString()}` : '';
      return await apiRequest(`/api/food${query}`);
    },
    async getById(id) {
      return await apiRequest(`/api/food/${id}`);
    },
    async create(data) {
      return await apiRequest('/api/food', { method: 'POST', data, auth: true });
    },
    async update(id, data) {
      return await apiRequest(`/api/food/${id}`, { method: 'PUT', data, auth: true });
    },
    async delete(id) {
      return await apiRequest(`/api/food/${id}`, { method: 'DELETE', auth: true });
    }
  },

  // Shopping Cart
  cart: {
    async get() {
      return await apiRequest('/api/cart', { auth: true });
    },
    async add(food_id, quantity = 1) {
      return await apiRequest('/api/cart', { method: 'POST', data: { food_id, quantity }, auth: true });
    },
    async update(id, quantity) {
      return await apiRequest(`/api/cart/${id}`, { method: 'PUT', data: { quantity }, auth: true });
    },
    async remove(id) {
      return await apiRequest(`/api/cart/${id}`, { method: 'DELETE', auth: true });
    },
    async clear() {
      return await apiRequest('/api/cart', { method: 'DELETE', auth: true });
    },
    async sync(items) {
      return await apiRequest('/api/cart/sync', { method: 'POST', data: { items }, auth: true });
    }
  },

  // Orders
  orders: {
    async place(orderData) {
      return await apiRequest('/api/orders', { method: 'POST', data: orderData });
    },
    async getMyOrders() {
      return await apiRequest('/api/orders/my-orders', { auth: true });
    },
    async getById(id) {
      return await apiRequest(`/api/orders/${id}`, { auth: true });
    },
    async cancel(id) {
      return await apiRequest(`/api/orders/${id}/cancel`, { method: 'PUT', auth: true });
    }
  },

  // Reservations
  reservations: {
    async book(data) {
      return await apiRequest('/api/reservations', { method: 'POST', data });
    },
    async getMyReservations() {
      return await apiRequest('/api/reservations/my-reservations', { auth: true });
    },
    async getById(id) {
      return await apiRequest(`/api/reservations/${id}`, { auth: true });
    }
  },

  // Admin Dashboard
  admin: {
    async getStats() {
      return await apiRequest('/api/admin/stats', { auth: true });
    },
    async getOrders({ status = 'all', search = '' } = {}) {
      const params = new URLSearchParams();
      if (status && status !== 'all') params.append('status', status);
      if (search) params.append('search', search);
      const query = params.toString() ? `?${params.toString()}` : '';
      return await apiRequest(`/api/admin/orders${query}`, { auth: true });
    },
    async updateOrderStatus(id, status) {
      return await apiRequest(`/api/admin/orders/${id}/status`, { method: 'PUT', data: { status }, auth: true });
    },
    async getReservations({ status = 'all', date = '', search = '' } = {}) {
      const params = new URLSearchParams();
      if (status && status !== 'all') params.append('status', status);
      if (date) params.append('date', date);
      if (search) params.append('search', search);
      const query = params.toString() ? `?${params.toString()}` : '';
      return await apiRequest(`/api/admin/reservations${query}`, { auth: true });
    },
    async updateReservationStatus(id, status) {
      return await apiRequest(`/api/admin/reservations/${id}/status`, { method: 'PUT', data: { status }, auth: true });
    },
    async getUsers() {
      return await apiRequest('/api/admin/users', { auth: true });
    }
  }
};

