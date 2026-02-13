import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Console log apenas em desenvolvimento para não expor erros em prod
  if (import.meta.env.DEV) {
    console.warn('Variáveis de ambiente do Supabase não encontradas. O backend não funcionará.');
  }
}

// Cria o cliente apenas se as variáveis existirem, caso contrário cria um cliente "dummy" ou lança erro controlado
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
