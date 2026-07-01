import { supabase } from '../../../shared/services/supabase';
import { transformSensitiveFields } from '../../../shared/lib/crypto';

const handleError = (error) => {
  console.error('Database error:', error);
  throw error;
};

export const getTransactions = async (userId, accountId) => {
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId);

  if (accountId) {
    query = query.eq('account_id', accountId);
  }

  const { data, error } = await query.order('date', { ascending: false });
  if (error) handleError(error);

  if (!data) return [];
  return Promise.all(data.map((transaction) => transformSensitiveFields(transaction, 'transactions', 'decrypt')));
};

export const createTransaction = async (userId, transaction) => {
  const encryptedTransaction = await transformSensitiveFields({ ...transaction, user_id: userId }, 'transactions', 'encrypt');
  const { data, error } = await supabase
    .from('transactions')
    .insert([encryptedTransaction])
    .select()
    .single();
  if (error) handleError(error);
  return data ? transformSensitiveFields(data, 'transactions', 'decrypt') : data;
};

export const updateTransaction = async (id, userId, updates) => {
  const encryptedUpdates = await transformSensitiveFields(updates, 'transactions', 'encrypt');
  const { error } = await supabase
    .from('transactions')
    .update(encryptedUpdates)
    .eq('id', id)
    .eq('user_id', userId);
  if (error) handleError(error);
  return { success: true };
};

export const deleteTransaction = async (id, userId) => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) handleError(error);
  return { success: true };
};
