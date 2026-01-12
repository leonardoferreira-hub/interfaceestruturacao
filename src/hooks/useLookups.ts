import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Categoria, Veiculo, Lastro, TipoOperacao } from '@/types/dados-estruturacao';

// Buscar todas as categorias
export function useCategorias() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      return data as Categoria[];
    },
  });
}

// Buscar todos os veículos
export function useVeiculos() {
  return useQuery({
    queryKey: ['veiculos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('veiculos')
        .select('*')
        .order('sigla');
      
      if (error) throw error;
      return data as Veiculo[];
    },
  });
}

// Buscar todos os lastros
export function useLastros() {
  return useQuery({
    queryKey: ['lastros'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lastros')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      return data as Lastro[];
    },
  });
}

// Buscar todos os tipos de operação
export function useTiposOperacao() {
  return useQuery({
    queryKey: ['tipos-operacao'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tipos_operacao')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      return data as TipoOperacao[];
    },
  });
}
