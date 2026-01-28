import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ComplianceCheck {
  id: string;
  operacao_id: string;
  cnpj: string;
  tipo_entidade: 'emitente' | 'garantidor' | 'devedor' | 'avalista' | 'outro';
  nome_entidade: string | null;
  status: 'pendente' | 'em_analise' | 'aprovado' | 'reprovado';
  observacoes: string | null;
  responsavel_id: string | null;
  data_verificacao: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface ComplianceResumo {
  operacao_id: string;
  numero_emissao: string;
  nome_operacao: string | null;
  operacao_status: string;
  total_checks: number;
  pendentes: number;
  em_analise: number;
  aprovados: number;
  reprovados: number;
  compliance_status: 'incompleto' | 'completo' | 'bloqueado' | 'pendente';
}

// Buscar checks de compliance de uma operação
export function useComplianceChecks(operacaoId: string | undefined) {
  return useQuery({
    queryKey: ['compliance-checks', operacaoId],
    queryFn: async () => {
      if (!operacaoId) return [];
      
      const { data, error } = await supabase
        .schema('estruturacao')
        .from('compliance_checks')
        .select('*')
        .eq('operacao_id', operacaoId)
        .order('criado_em', { ascending: true });
      
      if (error) throw error;
      return (data || []) as ComplianceCheck[];
    },
    enabled: !!operacaoId,
  });
}

// Buscar resumo de todas as operações com compliance
export function useOperacoesCompliance() {
  return useQuery({
    queryKey: ['operacoes-compliance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('estruturacao')
        .from('v_operacoes_compliance')
        .select('*')
        .order('compliance_status', { ascending: false }); // bloqueados/pendentes primeiro
      
      if (error) throw error;
      return (data || []) as ComplianceResumo[];
    },
  });
}

// Criar novo check de compliance
export function useCreateComplianceCheck() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (dados: {
      operacao_id: string;
      cnpj: string;
      tipo_entidade?: string;
      nome_entidade?: string;
    }) => {
      const { data, error } = await supabase
        .schema('estruturacao')
        .from('compliance_checks')
        .insert({
          ...dados,
          tipo_entidade: dados.tipo_entidade || 'outro',
          status: 'pendente',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['compliance-checks', variables.operacao_id] });
      queryClient.invalidateQueries({ queryKey: ['operacoes-compliance'] });
    },
  });
}

// Atualizar status de compliance (apenas compliance pode usar)
export function useUpdateComplianceStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (dados: {
      id: string;
      operacao_id: string;
      status: 'pendente' | 'em_analise' | 'aprovado' | 'reprovado';
      observacoes?: string;
    }) => {
      const { data, error } = await supabase
        .schema('estruturacao')
        .from('compliance_checks')
        .update({
          status: dados.status,
          observacoes: dados.observacoes,
          data_verificacao: new Date().toISOString(),
        })
        .eq('id', dados.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['compliance-checks', variables.operacao_id] });
      queryClient.invalidateQueries({ queryKey: ['operacoes-compliance'] });
    },
  });
}

// Remover check de compliance
export function useDeleteComplianceCheck() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (dados: { id: string; operacao_id: string }) => {
      const { error } = await supabase
        .schema('estruturacao')
        .from('compliance_checks')
        .delete()
        .eq('id', dados.id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['compliance-checks', variables.operacao_id] });
      queryClient.invalidateQueries({ queryKey: ['operacoes-compliance'] });
    },
  });
}

// Verificar se operação está com compliance completo
export function useOperacaoComplianceCompleto(operacaoId: string | undefined) {
  return useQuery({
    queryKey: ['compliance-completo', operacaoId],
    queryFn: async () => {
      if (!operacaoId) return false;
      
      const { data, error } = await supabase
        .schema('estruturacao')
        .rpc('operacao_compliance_completo', {
          p_operacao_id: operacaoId,
        });
      
      if (error) throw error;
      return data as boolean;
    },
    enabled: !!operacaoId,
  });
}

// Verificar status de um CNPJ no compliance externo
export function useCNPJStatusCompliance(cnpj: string | undefined) {
  return useQuery({
    queryKey: ['cnpj-status-compliance', cnpj],
    queryFn: async () => {
      if (!cnpj) return null;
      
      // Buscar na base histórica
      const { data: historico, error: err1 } = await supabase
        .schema('compliance')
        .from('cnpjs_verificados')
        .select('*')
        .eq('cnpj', cnpj.replace(/\D/g, ''))
        .maybeSingle();
      
      if (err1) throw err1;
      if (historico) return { source: 'historico', ...historico };
      
      // Buscar em verificações pendentes
      const { data: pendente, error: err2 } = await supabase
        .schema('compliance')
        .from('verificacoes_pendentes')
        .select('*')
        .eq('cnpj', cnpj.replace(/\D/g, ''))
        .in('status', ['pendente', 'em_analise'])
        .order('data_solicitacao', { ascending: false })
        .maybeSingle();
      
      if (err2) throw err2;
      if (pendente) return { source: 'pendente', ...pendente };
      
      return null;
    },
    enabled: !!cnpj,
  });
}
