import { supabase } from '../../../shared/services/supabase';

const handleError = (error) => {
  console.error('Database error:', error);
  throw error;
};

export const getCategories = async (userId, spaceId) => {
  let query = supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId);

  if (spaceId) {
    query = query.eq('space_id', spaceId);
  }

  const { data, error } = await query.order('created_at');
  if (error) handleError(error);
  return data;
};

export const createCategory = async (userId, category) => {
  const { data, error } = await supabase
    .from('categories')
    .insert([{ ...category, user_id: userId }])
    .select()
    .single();
  if (error) handleError(error);
  return data;
};

export const updateCategory = async (id, userId, updates) => {
  const { error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId);
  if (error) handleError(error);
  return { success: true };
};

export const deleteCategory = async (id, userId) => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) handleError(error);
  return { success: true };
};
