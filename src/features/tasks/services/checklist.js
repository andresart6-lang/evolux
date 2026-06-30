import { supabase } from '../../../shared/services/supabase';

const handleError = (error) => {
  console.error('Database error:', error);
  throw error;
};

export const getChecklist = async (userId, taskId) => {
  const { data, error } = await supabase
    .from('checklist')
    .select('*')
    .eq('user_id', userId)
    .eq('task_id', taskId)
    .order('created_at');
  if (error) handleError(error);
  return data;
};

export const addChecklistItem = async (userId, item) => {
  const { data, error } = await supabase
    .from('checklist')
    .insert([{ ...item, user_id: userId }])
    .select()
    .single();
  if (error) handleError(error);
  return data;
};

export const updateChecklistItem = async (id, userId, updates) => {
  const { error } = await supabase
    .from('checklist')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId);
  if (error) handleError(error);
  return { success: true };
};

export const deleteChecklistItem = async (id, userId) => {
  const { error } = await supabase
    .from('checklist')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) handleError(error);
  return { success: true };
};
