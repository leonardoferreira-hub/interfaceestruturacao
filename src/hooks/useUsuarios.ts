import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Usuario } from '@/types/dados-estruturacao';

// Buscar todos os usuários ativos
export function useUsuarios() {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('ativo', true)
        .order('nome_completo');
      
      if (error) throw error;
      return data as Usuario[];
    },
  });
}

// Buscar usuários que podem ser PMO
export function useUsuariosPMO() {
  return useQuery({
    queryKey: ['usuarios-pmo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('ativo', true)
        .order('nome_completo');
      
      if (error) throw error;
      // Por enquanto, todos os usuários podem ser PMO
      return data as Usuario[];
    },
  });
}

// Buscar um usuário específico
export function useUsuario(id: string | undefined) {
  return useQuery({
    queryKey: ['usuario', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Usuario;
    },
    enabled: !!id,
  });
}
