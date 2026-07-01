import { supabase } from '../../../shared/services/supabase';
import { transformSensitiveFields } from '../../../shared/lib/crypto';

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

  return Promise.all((data || []).map(async (goal) => {
    const decryptedGoal = await transformSensitiveFields(goal, 'goals', 'decrypt');
    if (decryptedGoal.goal_history?.length) {
      decryptedGoal.goal_history = await Promise.all(
        decryptedGoal.goal_history.map((historyRow) => transformSensitiveFields(historyRow, 'goal_history', 'decrypt'))
      );
    }
    return decryptedGoal;
  }));
};

export const createGoal = async (userId, goal) => {
  const encryptedGoal = await transformSensitiveFields({ ...goal, user_id: userId }, 'goals', 'encrypt');
  const { data, error } = await supabase
    .from('goals')
    .insert([encryptedGoal])
    .select()
    .single();
  if (error) handleError(error);
  return data ? transformSensitiveFields(data, 'goals', 'decrypt') : data;
};

export const updateGoal = async (id, userId, updates) => {
  const encryptedUpdates = await transformSensitiveFields(updates, 'goals', 'encrypt');
  const { error } = await supabase
    .from('goals')
    .update(encryptedUpdates)
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
  const encryptedHistory = await transformSensitiveFields({ ...history, user_id: userId }, 'goal_history', 'encrypt');
  const { data, error } = await supabase
    .from('goal_history')
    .insert([encryptedHistory])
    .select()
    .single();
  if (error) handleError(error);
  return data ? transformSensitiveFields(data, 'goal_history', 'decrypt') : data;
};

export const deleteGoalHistory = async (id, userId) => {
  const { error } = await supabase
    .from('goal_history')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) handleError(error);
  return { success: true };
};
