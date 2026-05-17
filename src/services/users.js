import api from './api';

export async function getUser(user_id) {
  return api.post('/get-user', { user_id });
}

export async function updateUser(user_id, data) {
  return api.post('/update-user', { user_id, data });
}