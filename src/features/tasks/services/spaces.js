import { supabase } from '../../../shared/services/supabase';

const handleError = (error) => {
  console.error('Database error:', error);
  throw error;
};

export const getSpaces = async (userId) => {
  const { data, error } = await supabase
    .from('spaces')
    .select('*')
    .eq('user_id', userId)
    .order('created_at');
  if (error) handleError(error);
  return data;
};

export const createSpace = async (userId, space) => {
  const { data, error } = await supabase
    .from('spaces')
    .insert([{ ...space, user_id: userId }])
    .select()
    .single();
  if (error) handleError(error);
  return data;
};

export const updateSpace = async (id, userId, updates) => {
  const { error } = await supabase
    .from('spaces')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId);
  if (error) handleError(error);
  return { success: true };
};

export const deleteSpace = async (id, userId) => {
  const { error } = await supabase
    .from('spaces')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) handleError(error);
  return { success: true };
};
