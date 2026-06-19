import { supabase } from '../../../shared/services/supabase';

const handleError = (error) => {
  console.error('Database error:', error);
  throw error;
};

export const getAccounts = async (userId) => {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at');
  if (error) handleError(error);
  return data;
};

export const createAccount = async (userId, account) => {
  const { data, error } = await supabase
    .from('accounts')
    .insert([{ ...account, user_id: userId }])
    .select()
    .single();
  if (error) handleError(error);
  return data;
};

export const updateAccount = async (id, userId, updates) => {
  const { error } = await supabase
    .from('accounts')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId);
  if (error) handleError(error);
  return { success: true };
};

export const deleteAccount = async (id, userId) => {
  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) handleError(error);
  return { success: true };
};
