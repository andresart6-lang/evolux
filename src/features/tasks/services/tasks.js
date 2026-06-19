import { supabase } from '../../../shared/services/supabase';

const handleError = (error) => {
  console.error('Database error:', error);
  throw error;
};

export const getTasks = async (userId) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, checklist:checklist(*)')
    .eq('user_id', userId)
    .order('created_at');
  if (error) handleError(error);
  return data;
};

export const createTask = async (userId, task) => {
  const { data, error } = await supabase
    .from('tasks')
    .insert([{ ...task, user_id: userId }])
    .select()
    .single();
  if (error) handleError(error);
  return data;
};

export const updateTask = async (id, userId, updates) => {
  const { error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId);
  if (error) handleError(error);
  return { success: true };
};

export const deleteTask = async (id, userId) => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) handleError(error);
  return { success: true };
};
