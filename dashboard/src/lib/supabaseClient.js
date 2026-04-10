import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = supabaseUrl && supabaseAnonKey && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY_HERE';

if (!isConfigured) {
  console.warn('Supabase credentials missing or using placeholders. Auth logic will be disabled.');
}

// Create client with auth options optimized for cloud proxy environments (HF Spaces, etc.)
export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,  // Crucial: detects OAuth tokens in URL hash/query
        flowType: 'pkce'           // PKCE flow works better behind reverse proxies
      }
    })
  : null;
