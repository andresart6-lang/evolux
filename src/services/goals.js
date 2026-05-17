import api from './api';

export async function getGoals(user_id) {
  return api.post('/get-goals', { user_id });
}

export async function createGoal(user_id, data) {
  return api.post('/create-goal', { user_id, data });
}

export async function updateGoal(id, user_id, data) {
  return api.post('/update-goal', { id, user_id, data });
}

export async function deleteGoal(id, user_id) {
  return api.post('/delete-goal', { id, user_id });
}