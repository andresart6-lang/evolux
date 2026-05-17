import api from './api';

export async function getSpaces(user_id) {
  return api.post('/get-spaces', { user_id });
}

export async function createSpace(user_id, data) {
  return api.post('/create-space', { user_id, data });
}

export async function updateSpace(id, user_id, data) {
  return api.post('/update-space', { id, user_id, data });
}

export async function deleteSpace(id, user_id) {
  return api.post('/delete-space', { id, user_id });
}