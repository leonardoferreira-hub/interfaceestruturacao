export type StatusInvestidor = 'pendente' | 'em_analise' | 'aprovado' | 'reprovado';

export type TipoInvestidor = 'PF' | 'PJ';

export interface Investidor {
  id: string;
  cnpj_cpf: string;
  tipo: TipoInvestidor;
  razao_social: string;
  nome_fantasia?: string;
  email: string;
  telefone?: string;
  status: StatusInvestidor;
  data_criacao: string;
  data_atualizacao: string;
  token_onboarding?: string;
  data_geracao_token?: string;
}

export interface EmissaoComInvestidores {
  id: string;
  codigo: string;
  nome: string;
  status: string;
  valor_total: number;
  data_emissao: string;
  data_vencimento?: string;
  investidores: Investidor[];
}

export interface LinkOnboarding {
  token: string;
  url: string;
  data_geracao: string;
}
