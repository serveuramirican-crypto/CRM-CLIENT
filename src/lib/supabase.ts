import { createClient } from '@supabase/supabase-js';

const rawUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://cphfqlrpnfemkdddajjq.supabase.co';

// Clean URL in case /rest/v1/ was appended
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwaGZxbHJwbmZlbWtkZGRhampxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2MTAyNDcsImV4cCI6MjEwOTE4NjI0N30.Lf-hQkO8QrG4u6sHlSPzsVRCBcn8JX7wlhXwAjq7KkM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
