// Cliente Supabase configurado para o schema 'estruturacao'
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://gthtvpujwukbfgokghne.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0aHR2cHVqd3VrYmZnb2tnaG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MDU4MjYsImV4cCI6MjA4MzI4MTgyNn0.viQaLgE8Kk32DCtEAUEglxCR8bwBwhrIqAh_JIfdxv4";

// Cliente configurado para acessar o schema 'estruturacao'
export const supabaseEstruturacao = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'estruturacao'
  }
});

// Re-export do cliente público para conveniência
export { supabase } from '@/integrations/supabase/client';
