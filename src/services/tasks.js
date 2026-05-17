import api from './api';

export async function getTasks(user_id) {
  return api.post('/get-tasks', { user_id });
}

export async function createTask(user_id, data) {
  return api.post('/create-task', { user_id, data });
}

export async function updateTask(id, user_id, data) {
  return api.post('/update-task', { id, user_id, data });
}

export async function deleteTask(id, user_id) {
  return api.post('/delete-task', { id, user_id });
}