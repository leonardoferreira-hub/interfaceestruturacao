import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OperacaoEstruturacao {
  id: string;
  numero_emissao: string;
  nome_operacao: string | null;
  volume: number;
  status: string | null;
  categoria_id: string | null;
  categoria_nome: string | null;
  pmo_id: string | null;
  pmo_nome: string | null;
  veiculo_id: string | null;
  veiculo_nome: string | null;
  data_entrada_pipe: string | null;
  data_previsao_liquidacao: string | null;
  data_liquidacao: string | null;
  analista_gestao_id: string | null;
  analista_gestao_nome: string | null;
  criado_em: string | null;
  atualizado_em: string | null;
}

export function useOperacoesEstruturacao() {
  return useQuery({
    queryKey: ['operacoes-estruturacao'],
    queryFn: async () => {
      // Buscar operações em estruturação do schema estruturacao
      const { data: operacoes, error: operacoesError } = await supabase
        .schema('estruturacao')
        .from('operacoes')
        .select('*')
        .eq('status', 'Em Estruturação')
        .order('criado_em', { ascending: false });

      if (operacoesError) throw operacoesError;

      // Buscar categorias
      const { data: categorias, error: categoriasError } = await supabase
        .from('categorias')
        .select('id, nome');

      if (categoriasError) throw categoriasError;

      // Buscar veículos
      const { data: veiculos, error: veiculosError } = await supabase
        .from('veiculos')
        .select('id, nome');

      if (veiculosError) throw veiculosError;

      // Buscar analistas de gestão
      const { data: analistas, error: analistasError } = await supabase
        .schema('estruturacao')
        .from('analistas_gestao')
        .select('id, nome');

      if (analistasError) {
        console.warn('Erro ao buscar analistas:', analistasError);
      }

      // Buscar usuários (PMOs) - pode não existir ainda
      const { data: usuarios, error: usuariosError } = await supabase
        .from('user_profiles')
        .select('id, nome');

      if (usuariosError) {
        console.warn('Erro ao buscar usuários:', usuariosError);
      }

      // Mapear dados
      const categoriasMap = new Map(categorias?.map(c => [c.id, c.nome]) || []);
      const veiculosMap = new Map(veiculos?.map(v => [v.id, v.nome]) || []);
      const analistasMap = new Map(analistas?.map(a => [a.id, a.nome]) || []);
      const usuariosMap = new Map(usuarios?.map(u => [u.id, u.nome]) || []);

      const result: OperacaoEstruturacao[] = (operacoes || []).map(op => ({
        id: op.id,
        numero_emissao: op.numero_emissao,
        nome_operacao: op.nome_operacao,
        volume: op.volume || 0,
        status: op.status,
        categoria_id: op.categoria_id,
        categoria_nome: op.categoria_id ? categoriasMap.get(op.categoria_id) || null : null,
        pmo_id: op.pmo_id,
        pmo_nome: op.pmo_id ? usuariosMap.get(op.pmo_id) || null : null,
        veiculo_id: op.veiculo_id,
        veiculo_nome: op.veiculo_id ? veiculosMap.get(op.veiculo_id) || null : null,
        data_entrada_pipe: op.data_entrada_pipe,
        data_previsao_liquidacao: op.data_previsao_liquidacao,
        data_liquidacao: op.data_liquidacao,
        analista_gestao_id: op.analista_gestao_id,
        analista_gestao_nome: op.analista_gestao_id ? analistasMap.get(op.analista_gestao_id) || null : null,
        criado_em: op.criado_em,
        atualizado_em: op.atualizado_em,
      }));

      return result;
    },
  });
}

export function useOperacoesLiquidadas() {
  return useQuery({
    queryKey: ['operacoes-liquidadas'],
    queryFn: async () => {
      // Buscar operações liquidadas
      const { data: operacoes, error: operacoesError } = await supabase
        .schema('estruturacao')
        .from('operacoes')
        .select('*')
        .eq('status', 'Liquidada')
        .order('data_liquidacao', { ascending: false, nullsFirst: false });

      if (operacoesError) throw operacoesError;

      // Buscar categorias
      const { data: categorias, error: categoriasError } = await supabase
        .from('categorias')
        .select('id, nome');

      if (categoriasError) throw categoriasError;

      // Buscar veículos
      const { data: veiculos, error: veiculosError } = await supabase
        .from('veiculos')
        .select('id, nome');

      if (veiculosError) throw veiculosError;

      // Buscar analistas de gestão
      const { data: analistas, error: analistasError } = await supabase
        .schema('estruturacao')
        .from('analistas_gestao')
        .select('id, nome');

      if (analistasError) {
        console.warn('Erro ao buscar analistas:', analistasError);
      }

      // Buscar usuários (PMOs)
      const { data: usuarios, error: usuariosError } = await supabase
        .from('user_profiles')
        .select('id, nome');

      if (usuariosError) {
        console.warn('Erro ao buscar usuários:', usuariosError);
      }

      // Mapear dados
      const categoriasMap = new Map(categorias?.map(c => [c.id, c.nome]) || []);
      const veiculosMap = new Map(veiculos?.map(v => [v.id, v.nome]) || []);
      const analistasMap = new Map(analistas?.map(a => [a.id, a.nome]) || []);
      const usuariosMap = new Map(usuarios?.map(u => [u.id, u.nome]) || []);

      const result: OperacaoEstruturacao[] = (operacoes || []).map(op => ({
        id: op.id,
        numero_emissao: op.numero_emissao,
        nome_operacao: op.nome_operacao,
        volume: op.volume || 0,
        status: op.status,
        categoria_id: op.categoria_id,
        categoria_nome: op.categoria_id ? categoriasMap.get(op.categoria_id) || null : null,
        pmo_id: op.pmo_id,
        pmo_nome: op.pmo_id ? usuariosMap.get(op.pmo_id) || null : null,
        veiculo_id: op.veiculo_id,
        veiculo_nome: op.veiculo_id ? veiculosMap.get(op.veiculo_id) || null : null,
        data_entrada_pipe: op.data_entrada_pipe,
        data_previsao_liquidacao: op.data_previsao_liquidacao,
        data_liquidacao: op.data_liquidacao,
        analista_gestao_id: op.analista_gestao_id,
        analista_gestao_nome: op.analista_gestao_id ? analistasMap.get(op.analista_gestao_id) || null : null,
        criado_em: op.criado_em,
        atualizado_em: op.atualizado_em,
      }));

      return result;
    },
  });
}

export function useOperacao(id: string | undefined) {
  return useQuery({
    queryKey: ['operacao', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .schema('estruturacao')
        .from('operacoes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
