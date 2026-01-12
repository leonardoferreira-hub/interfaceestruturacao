import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Interfaces para lookup tables do base_custos
export interface Categoria {
  id: string;
  nome: string;
  codigo: string;
  ativo: boolean;
  created_at: string;
}

export interface Veiculo {
  id: string;
  nome: string;
  codigo: string;
  ativo: boolean;
  created_at: string;
}

export interface Lastro {
  id: string;
  nome: string;
  codigo: string;
  ativo: boolean;
  created_at: string;
}

export interface TipoOferta {
  id: string;
  nome: string;
  codigo: string;
  ativo: boolean;
  created_at: string;
}

// Buscar todas as categorias do base_custos (CRI, CRA, CR, DEB)
export function useCategorias() {
  return useQuery({
    queryKey: ['categorias-base-custos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_base_custos_categorias');
      
      if (error) {
        // Fallback: query direta via SQL
        const { data: sqlData, error: sqlError } = await supabase
          .from('categorias')
          .select('*')
          .order('nome');
        
        if (sqlError) throw sqlError;
        return sqlData as Categoria[];
      }
      return data as Categoria[];
    },
  });
}

// Buscar todos os veículos do base_custos (Patrimônio Separado, Veículo Exclusivo)
export function useVeiculos() {
  return useQuery({
    queryKey: ['veiculos-base-custos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_base_custos_veiculos');
      
      if (error) {
        // Fallback: query direta
        const { data: sqlData, error: sqlError } = await supabase
          .from('veiculos')
          .select('*')
          .order('nome');
        
        if (sqlError) throw sqlError;
        return sqlData as Veiculo[];
      }
      return data as Veiculo[];
    },
  });
}

// Buscar todos os lastros do base_custos (Origem, Destinação)
export function useLastros() {
  return useQuery({
    queryKey: ['lastros-base-custos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_base_custos_lastros');
      
      if (error) {
        // Fallback: query direta
        const { data: sqlData, error: sqlError } = await supabase
          .from('lastros')
          .select('*')
          .order('nome');
        
        if (sqlError) throw sqlError;
        return sqlData as Lastro[];
      }
      return data as Lastro[];
    },
  });
}

// Buscar todos os tipos de oferta do base_custos (Privada Pura, Privada Cetipada, CVM 160)
export function useTiposOferta() {
  return useQuery({
    queryKey: ['tipos-oferta-base-custos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_base_custos_tipos_oferta');
      
      if (error) {
        // Fallback: query direta
        const { data: sqlData, error: sqlError } = await supabase
          .from('tipos_operacao')
          .select('*')
          .order('nome');
        
        if (sqlError) throw sqlError;
        return sqlData as TipoOferta[];
      }
      return data as TipoOferta[];
    },
  });
}

// Alias para compatibilidade
export function useTiposOperacao() {
  return useTiposOferta();
}
