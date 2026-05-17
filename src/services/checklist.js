import api from './api';

export async function getChecklist(task_id, user_id) {
  return api.post('/get-checklist', { task_id, user_id });
}

export async function addChecklist(user_id, data) {
  return api.post('/add-checklist', { user_id, data });
}

export async function updateChecklist(id, user_id, data) {
  return api.post('/update-checklist', { id, user_id, data });
}

export async function deleteChecklist(id, user_id) {
  return api.post('/delete-checklist', { id, user_id });
}