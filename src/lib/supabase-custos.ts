import { supabase } from '@/integrations/supabase/client';
import type { CostItem } from '@/components/estruturacao/tabs/despesas/CostRow';
import type { CostType } from '@/components/estruturacao/tabs/despesas/CostSection';

interface CustoLinha {
  papel: string;
  id_prestador: string | null;
  tipo_preco: string;
  preco_upfront: number;
  preco_recorrente: number;
  periodicidade: string | null;
  gross_up: number;
  valor_upfront_bruto: number;
  valor_recorrente_bruto: number;
}

interface TotaisCustos {
  total_upfront: number;
  total_anual: number;
  total_mensal: number;
  total_primeiro_ano: number;
  total_anos_subsequentes: number;
}

interface SalvarCustosPayload {
  id_emissao: string;
  custos: CustoLinha[];
  totais: TotaisCustos;
}

/**
 * Converte CostItem para o formato esperado pela Edge Function
 */
export function convertToApiFormat(items: CostItem[], type: CostType): CustoLinha[] {
  return items.map((item) => ({
    papel: item.papel || item.prestador,
    id_prestador: item.id_prestador || null,
    tipo_preco: item.tipo === 'input' ? 'fixo' : 'auto',
    preco_upfront: type === 'upfront' ? item.valor : 0,
    preco_recorrente: type !== 'upfront' ? item.valor : 0,
    periodicidade: type === 'upfront' ? null : type,
    gross_up: item.grossUp,
    valor_upfront_bruto: type === 'upfront' ? item.valorBruto : 0,
    valor_recorrente_bruto: type !== 'upfront' ? item.valorBruto : 0,
  }));
}

/**
 * Salva custos usando a Edge Function do comercial
 * Isso garante histórico de versões (v1, v2, v3...)
 */
export async function salvarCustos(payload: SalvarCustosPayload): Promise<{ success: boolean; error?: string; versao?: number }> {
  try {
    const { data, error } = await supabase.functions.invoke('fluxo-1-salvar-custos', {
      body: payload,
    });

    if (error) {
      console.error('Erro ao salvar custos:', error);
      return { success: false, error: error.message };
    }

    return { success: true, versao: data?.versao };
  } catch (err) {
    console.error('Erro ao salvar custos:', err);
    return { success: false, error: 'Erro inesperado ao salvar custos' };
  }
}
