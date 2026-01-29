import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Database = {
  public: {
    Tables: {
      emissoes: {
        Row: {
          id: string;
          numero_emissao: string;
          cnpj: string;
          razao_social: string;
          status: string;
          valor_total: number | null;
          data_emissao: string | null;
          criado_em: string;
          atualizado_em: string;
        };
      };
    };
  };
};
