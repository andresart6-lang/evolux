import { supabase } from '../../../shared/services/supabase';

const handleError = (error) => {
  console.error('Database error:', error);
  throw error;
};

export const getHabits = async (userId) => {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at');
  if (error) handleError(error);
  return data;
};

export const saveHabits = async (userId, habits) => {
  await supabase.from('habits').delete().eq('user_id', userId);

  if (habits.length === 0) return { success: true, count: 0 };

  const habitsWithUser = habits.map(h => ({ ...h, user_id: userId }));
  const { error } = await supabase.from('habits').insert(habitsWithUser);
  if (error) handleError(error);
  return { success: true, count: habits.length };
};

export const createHabit = async (userId, habit) => {
  const { data, error } = await supabase
    .from('habits')
    .insert([{ ...habit, user_id: userId }])
    .select()
    .single();
  if (error) handleError(error);
  return data;
};

export const updateHabit = async (id, userId, updates) => {
  const { error } = await supabase
    .from('habits')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId);
  if (error) handleError(error);
  return { success: true };
};

export const deleteHabit = async (id, userId) => {
  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) handleError(error);
  return { success: true };
};
