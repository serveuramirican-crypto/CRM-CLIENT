import { createClient } from '@supabase/supabase-js';

const rawUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://fwzquvgiftvrkxcwfvrf.supabase.co';

// Clean URL in case /rest/v1/ was appended
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3enF1dmdpZnR2cmt4Y3dmdnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1Mzc5NTQsImV4cCI6MjExMTExMzk1NH0.fFYBWKMZKoxRz8HJJs-sTCQ1VDCimi_zXZ3Yktptm5w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
