// Almacenamiento de la BILLETERA en Supabase (tabla wallet_items).
// Cada item: { id, user_id, month_key, column_type: 'actual'|'pending'|'debt', name, value, sort_order }
// RLS: cada usuario solo ve/edita lo suyo (auth.uid() = user_id).
import { supabase } from '../../../shared/services/supabase';

const handleError = (error) => {
    console.error('Wallet DB error:', error);
    throw error;
};

export const emptyMonth = () => ({ actual: [], pending: [], debt: [] });

// Devuelve los items de un mes, agrupados por columna.
export async function getWalletMonth(userId, monthKey) {
    const { data, error } = await supabase
        .from('wallet_items')
        .select('*')
        .eq('user_id', userId)
        .eq('month_key', monthKey)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });
    if (error) handleError(error);

    const grouped = emptyMonth();
    (data || []).forEach((r) => {
        if (grouped[r.column_type]) {
            grouped[r.column_type].push({ id: r.id, name: r.name || '', value: Number(r.value) || 0 });
        }
    });
    return grouped;
}

// Crea un item vacío en una columna y devuelve la fila creada.
export async function addWalletItem(userId, monthKey, columnType, sortOrder = 0) {
    const { data, error } = await supabase
        .from('wallet_items')
        .insert([{ user_id: userId, month_key: monthKey, column_type: columnType, name: '', value: 0, sort_order: sortOrder }])
        .select()
        .single();
    if (error) handleError(error);
    return { id: data.id, name: data.name || '', value: Number(data.value) || 0 };
}

// Actualiza nombre/valor de un item.
export async function updateWalletItem(id, userId, fields) {
    const { error } = await supabase
        .from('wallet_items')
        .update(fields)
        .eq('id', id)
        .eq('user_id', userId);
    if (error) handleError(error);
}

// Elimina un item.
export async function deleteWalletItem(id, userId) {
    const { error } = await supabase
        .from('wallet_items')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
    if (error) handleError(error);
}
