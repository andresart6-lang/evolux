import api from './api';

export async function getFitness(user_id) {
  return api.post('/get-fitness', { user_id });
}

export async function createFitness(user_id, data) {
  return api.post('/create-fitness', { user_id, data });
}

export async function updateFitness(id, user_id, data) {
  return api.post('/update-fitness', { id, user_id, data });
}

export async function deleteFitness(id, user_id) {
  return api.post('/delete-fitness', { id, user_id });
}