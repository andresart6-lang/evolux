import { supabase } from '../../../shared/services/supabase';
import { transformSensitiveFields } from '../../../shared/lib/crypto';

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

  if (!data) return [];
  return Promise.all(data.map((account) => transformSensitiveFields(account, 'accounts', 'decrypt')));
};

export const createAccount = async (userId, account) => {
  const encryptedAccount = await transformSensitiveFields({ ...account, user_id: userId }, 'accounts', 'encrypt');
  const { data, error } = await supabase
    .from('accounts')
    .insert([encryptedAccount])
    .select()
    .single();
  if (error) handleError(error);
  return data ? transformSensitiveFields(data, 'accounts', 'decrypt') : data;
};

export const updateAccount = async (id, userId, updates) => {
  const encryptedUpdates = await transformSensitiveFields(updates, 'accounts', 'encrypt');
  const { error } = await supabase
    .from('accounts')
    .update(encryptedUpdates)
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
