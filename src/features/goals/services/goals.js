import { supabase } from '../../../shared/services/supabase';

const handleError = (error) => {
  console.error('Database error:', error);
  throw error;
};

export const getGoals = async (userId) => {
  const { data, error } = await supabase
    .from('goals')
    .select('*, goal_history(*)')
    .eq('user_id', userId)
    .order('created_at');
  if (error) handleError(error);
  return data;
};

export const createGoal = async (userId, goal) => {
  const { data, error } = await supabase
    .from('goals')
    .insert([{ ...goal, user_id: userId }])
    .select()
    .single();
  if (error) handleError(error);
  return data;
};

export const updateGoal = async (id, userId, updates) => {
  const { error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId);
  if (error) handleError(error);
  return { success: true };
};

export const deleteGoal = async (id, userId) => {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) handleError(error);
  return { success: true };
};

export const addGoalHistory = async (userId, history) => {
  const { data, error } = await supabase
    .from('goal_history')
    .insert([{ ...history, user_id: userId }])
    .select()
    .single();
  if (error) handleError(error);
  return data;
};
