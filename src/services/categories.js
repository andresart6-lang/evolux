import api from './api';

export async function getCategories(user_id, space_id = null) {
  return api.post('/get-categories', { user_id, space_id });
}

export async function createCategory(user_id, data) {
  return api.post('/create-category', { user_id, data });
}

export async function updateCategory(id, user_id, data) {
  return api.post('/update-category', { id, user_id, data });
}

export async function deleteCategory(id, user_id) {
  return api.post('/delete-category', { id, user_id });
}