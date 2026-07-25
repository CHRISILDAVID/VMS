import { getSupabaseClient } from '@vms/shared';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = getSupabaseClient(supabaseUrl, supabaseKey);
