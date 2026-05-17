import api from './api';

const STORAGE_KEY = 'pp_source_users';
const CURRENT_USER_KEY = 'pp_source_current_user';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

export async function login(email, password) {
  const stored = localStorage.getItem(STORAGE_KEY);
  const users = stored ? JSON.parse(stored) : [];
  
  const passwordHash = hashPassword(password);
  const user = users.find(u => u.email === email && u.passwordHash === passwordHash);
  
  if (user) {
    const userData = { id: user.id, email: user.email, name: user.name };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
    
    api.post('/login', { email, password }).catch(() => {});
    
    return { success: true, user_id: user.id };
  }
  
  throw new Error('Invalid credentials');
}

export async function register(email, password, name) {
  const stored = localStorage.getItem(STORAGE_KEY);
  const users = stored ? JSON.parse(stored) : [];
  
  if (users.find(u => u.email === email)) {
    throw new Error('Email already exists');
  }
  
  const now = new Date();
  const newUser = {
    id: generateId(),
    email,
    passwordHash: hashPassword(password),
    name,
    created_at: formatDate(now),
    last_login: formatDate(now)
  };
  
  users.push(newUser);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  
  const userData = { id: newUser.id, email: newUser.email, name: newUser.name };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
  
  api.post('/register', { email, password, name }).catch(() => {});
  
  return { success: true, user_id: newUser.id };
}

export async function googleLogin(google_id, email, name) {
  const stored = localStorage.getItem(STORAGE_KEY);
  const users = stored ? JSON.parse(stored) : [];
  
  let user = users.find(u => u.google_id === google_id);
  
  if (!user) {
    user = users.find(u => u.email === email);
  }
  
  if (!user) {
    const now = new Date();
    user = {
      id: generateId(),
      google_id,
      email,
      passwordHash: '',
      name,
      created_at: formatDate(now),
      last_login: formatDate(now)
    };
    users.push(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }
  
  const userData = { id: user.id, email: user.email, name: user.name };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
  
  api.post('/google-auth', { google_id, email, name }).catch(() => {});
  
  return { success: true, user_id: user.id };
}

export function logout() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function getCurrentUserId() {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user).id : null;
}

export function getCurrentUser() {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
}

export function isAuthenticated() {
  return !!localStorage.getItem(CURRENT_USER_KEY);
}

export { api };