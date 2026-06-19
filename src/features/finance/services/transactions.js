import { supabase } from '../../../shared/services/supabase';

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
  return data;
};

export const createTransaction = async (userId, transaction) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([{ ...transaction, user_id: userId }])
    .select()
    .single();
  if (error) handleError(error);
  return data;
};

export const updateTransaction = async (id, userId, updates) => {
  const { error } = await supabase
    .from('transactions')
    .update(updates)
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
