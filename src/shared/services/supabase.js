import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.vite_supabase_url;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.vite_supabase_publishable_key;

export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;