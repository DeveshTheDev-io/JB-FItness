import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_PUBLISHABLE_KEY || import.meta.env.SUPABASE_ANON_KEY || '';

let client: any = null;

try {
  if (supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey) {
    client = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (error) {
  console.error("Failed to initialize Supabase client.", error);
}

export const supabase = client;
