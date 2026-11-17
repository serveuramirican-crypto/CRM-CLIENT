import { createClient } from '@supabase/supabase-js';

const rawUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://xltqebpbcgdwlnvbnwxz.supabase.co';

// Clean URL in case /rest/v1/ was appended
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsdHFlYnBiY2dkd2xudmJud3h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ5MTkyMTIsImV4cCI6MjExMDQ5NTIxMn0.lqxnM1yKNXyVZTwkGM7alBrx3ttb_BNkDSilCXYexqQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
