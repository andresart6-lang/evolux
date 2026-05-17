import api from './api';

export async function getTransactions(account_id = null, user_id) {
  return api.post('/get-transactions', { account_id, user_id });
}

export async function createTransaction(user_id, data) {
  return api.post('/create-transaction', { user_id, data });
}

export async function updateTransaction(id, user_id, data) {
  return api.post('/update-transaction', { id, user_id, data });
}

export async function deleteTransaction(id, user_id) {
  return api.post('/delete-transaction', { id, user_id });
}