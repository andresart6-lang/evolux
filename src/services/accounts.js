import api from './api';

export async function getAccounts(user_id) {
  return api.post('/get-accounts', { user_id });
}

export async function createAccount(user_id, data) {
  return api.post('/create-account', { user_id, data });
}

export async function updateAccount(id, user_id, data) {
  return api.post('/update-account', { id, user_id, data });
}

export async function deleteAccount(id, user_id) {
  return api.post('/delete-account', { id, user_id });
}