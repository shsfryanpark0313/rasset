import { createClient } from '@supabase/supabase-js';

// Environment variables must be provided in Netlify
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase credentials missing! Check .env or Netlify Environment Variables.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
