import { Emissao, Pendencia, TipoEmissao, StatusEmissao, StatusPendencia, PrioridadePendencia, CategoriaPendencia } from '@/types';

// Originadores comuns
const originadores = [
  'Banco ABC',
  'Financeira XYZ',
  'Securitizadora Alpha',
  'Banco Beta',
  'Creditas',
  'Banco Pan',
  'Itaú BBA',
  'BTG Pactual',
  'XP Investimentos',
];

// Gerar série mock
const gerarSerie = (index: number, valorTotal: number) => ({
  id: `serie-${index}`,
  numero: `${index + 1}ª Série`,
  valor_nominal: valorTotal / (index + 1),
  quantidade_titulos: Math.floor(Math.random() * 1000) + 100,
  taxa_juros: Math.random() * 5 + 8,
  tipo_taxa: ['prefixado', 'pos_fixado', 'hibrido'][Math.floor(Math.random() * 3)] as 'prefixado' | 'pos_fixado' | 'hibrido',
  indexador: ['CDI', 'IPCA', 'IGP-M', 'SELIC'][Math.floor(Math.random() * 4)] as 'CDI' | 'IPCA' | 'IGP-M' | 'SELIC',
  spread: Math.random() * 3 + 1,
  data_vencimento: new Date(Date.now() + Math.random() * 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  periodicidade_juros: ['mensal', 'trimestral', 'semestral', 'anual'][Math.floor(Math.random() * 4)] as 'mensal' | 'trimestral' | 'semestral' | 'anual',
  amortizacao: ['mensal', 'trimestral', 'semestral', 'bullet'][Math.floor(Math.random() * 4)] as 'mensal' | 'trimestral' | 'semestral' | 'bullet',
  garantias: 'Alienação fiduciária',
  rating: ['AAA', 'AA+', 'AA', 'A+', 'A'][Math.floor(Math.random() * 5)],
  agencia_rating: ['Fitch', 'Moody\'s', 'S&P'][Math.floor(Math.random() * 3)],
});

// Gerar emissões mock
const tipos: TipoEmissao[] = ['CRI', 'CRA', 'CR', 'FIDC', 'FII', 'FIAGRO', 'DEBENTURE'];
const statusList: StatusEmissao[] = ['em_estruturacao', 'em_analise', 'aguardando_documentos', 'em_registro', 'registrado'];

export const mockEmissoes: Emissao[] = Array.from({ length: 25 }, (_, i) => {
  const tipo = tipos[Math.floor(Math.random() * tipos.length)];
  const status = statusList[Math.floor(Math.random() * statusList.length)];
  const valorTotal = Math.floor(Math.random() * 500000000) + 10000000;
  const numSeries = Math.floor(Math.random() * 3) + 1;
  
  return {
    id: `emissao-${i + 1}`,
    codigo: `${tipo}-${String(i + 1).padStart(4, '0')}`,
    nome: `${tipo} ${originadores[i % originadores.length]} ${i + 1}`,
    tipo,
    status,
    data_emissao: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    data_registro: status === 'registrado' ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
    data_vencimento: new Date(Date.now() + Math.random() * 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    valor_total: valorTotal,
    valor_captado: status === 'registrado' ? valorTotal : undefined,
    originador: originadores[i % originadores.length],
    cedente: `Cedente ${i + 1}`,
    servicer: `Servicer ${(i % 5) + 1}`,
    custodiante: ['Banco Bradesco', 'Itaú', 'Santander'][i % 3],
    escriturador: ['Vórtx', 'Oliveira Trust', 'Pentágono'][i % 3],
    coordenador_lider: originadores[(i + 1) % originadores.length],
    agente_fiduciario: ['Pentágono', 'Oliveira Trust', 'Vórtx'][i % 3],
    series: Array.from({ length: numSeries }, (_, j) => gerarSerie(j, valorTotal)),
    numero_registro_cvm: status === 'registrado' ? `CVM-${String(Math.random() * 100000).substring(0, 5)}` : undefined,
    oferta_publica: Math.random() > 0.5,
    esforcos_restritos: Math.random() > 0.3,
    tipo_lastro: ['Imobiliário', 'Agronegócio', 'Crédito Consignado', 'Veículos'][i % 4],
    descricao_lastro: 'Recebíveis performados',
    pendencias_count: Math.floor(Math.random() * 5),
  };
});

// Gerar pendências mock
const categorias: CategoriaPendencia[] = ['documentacao', 'analise_credito', 'estruturacao', 'registro', 'outros'];
const prioridades: PrioridadePendencia[] = ['baixa', 'media', 'alta', 'urgente'];
const statusPendencia: StatusPendencia[] = ['pendente', 'em_andamento', 'concluido'];
const responsaveis = ['João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Carlos Ferreira'];

const titulosPendencia = [
  'Enviar documentação do cedente',
  'Validar lastro da operação',
  'Revisar minuta do contrato',
  'Obter rating da agência',
  'Atualizar demonstrações financeiras',
  'Coletar assinaturas',
  'Registrar na CVM',
  'Emitir parecer jurídico',
  'Analisar garantias',
  'Verificar compliance',
];

export const mockPendencias: Pendencia[] = Array.from({ length: 40 }, (_, i) => {
  const emissao = mockEmissoes[i % mockEmissoes.length];
  const status = statusPendencia[Math.floor(Math.random() * statusPendencia.length)];
  
  return {
    id: `pendencia-${i + 1}`,
    emissao_id: emissao.id,
    emissao_codigo: emissao.codigo,
    emissao_nome: emissao.nome,
    titulo: titulosPendencia[i % titulosPendencia.length],
    descricao: `Descrição detalhada da pendência ${i + 1}`,
    status,
    prioridade: prioridades[Math.floor(Math.random() * prioridades.length)],
    categoria: categorias[Math.floor(Math.random() * categorias.length)],
    responsavel: responsaveis[Math.floor(Math.random() * responsaveis.length)],
    data_limite: new Date(Date.now() + (Math.random() * 30 - 10) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    data_conclusao: status === 'concluido' ? new Date().toISOString().split('T')[0] : undefined,
    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    observacoes: i % 3 === 0 ? 'Observação adicional sobre a pendência' : undefined,
  };
});

// Emissões para histórico (liquidadas/canceladas)
export const mockHistoricoEmissoes: Emissao[] = Array.from({ length: 15 }, (_, i) => {
  const tipo = tipos[Math.floor(Math.random() * tipos.length)];
  const status: StatusEmissao = Math.random() > 0.2 ? 'liquidado' : 'cancelado';
  const valorTotal = Math.floor(Math.random() * 500000000) + 10000000;
  
  return {
    id: `historico-${i + 1}`,
    codigo: `${tipo}-${String(i + 100).padStart(4, '0')}`,
    nome: `${tipo} ${originadores[i % originadores.length]} Histórico ${i + 1}`,
    tipo,
    status,
    data_emissao: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    data_registro: new Date(Date.now() - Math.random() * 300 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    data_liquidacao: status === 'liquidado' ? new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
    data_vencimento: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - Math.random() * 400 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    valor_total: valorTotal,
    valor_captado: valorTotal,
    originador: originadores[i % originadores.length],
    cedente: `Cedente Histórico ${i + 1}`,
    series: [gerarSerie(0, valorTotal)],
    oferta_publica: Math.random() > 0.5,
    esforcos_restritos: Math.random() > 0.3,
    pendencias_count: 0,
  };
});

// Métricas do dashboard
export const mockDashboardMetrics = {
  total_emissoes: mockEmissoes.length + mockHistoricoEmissoes.length,
  valor_total_emitido: mockEmissoes.reduce((acc, e) => acc + e.valor_total, 0) + mockHistoricoEmissoes.reduce((acc, e) => acc + e.valor_total, 0),
  emissoes_ativas: mockEmissoes.filter(e => e.status !== 'liquidado' && e.status !== 'cancelado').length,
  valor_ativo: mockEmissoes.filter(e => e.status !== 'liquidado' && e.status !== 'cancelado').reduce((acc, e) => acc + e.valor_total, 0),
  emissoes_mes: 8,
  valor_mes: 450000000,
  pendencias_abertas: mockPendencias.filter(p => p.status !== 'concluido').length,
  pendencias_atrasadas: mockPendencias.filter(p => p.status !== 'concluido' && new Date(p.data_limite || '') < new Date()).length,
  taxa_conclusao_sla: 78.5,
};
