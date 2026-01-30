import { useState, useMemo, memo } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { EmissaoEstruturacaoDrawer } from '@/components/estruturacao/EmissaoEstruturacaoDrawer';
import { useOperacoesEstruturacao, OperacaoEstruturacao } from '@/hooks/useOperacoesEstruturacao';
import { formatCurrency } from '@/utils/formatters';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Building2, TrendingUp, FileText, ArrowUpRight, RefreshCcw, Download, Inbox } from 'lucide-react';
import { exportAllEmissoesToExcel, exportEmissaoToExcel } from '@/lib/excel-export';
import { toast } from 'sonner';
import { PageTransition, AnimatedCard, AnimatedListItem } from '@/components/ui/animations';
import { TableSkeleton, StatsCardSkeleton } from '@/components/ui/skeletons';
import { EmptyState, EmptySearchState } from '@/components/ui/empty-state';
import { motion } from 'framer-motion';

// Categoria badges com contraste acessível
const categoriaStyles: Record<string, string> = {
  CRI: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  CRA: 'bg-teal-100 text-teal-800 border-teal-300',
  DEB: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  CR: 'bg-lime-100 text-lime-800 border-lime-300',
  NC: 'bg-amber-100 text-amber-800 border-amber-300',
};

const CategoriaPill = memo(function CategoriaPill({ code }: { code: string | null | undefined }) {
  if (!code) return <span className="text-muted-foreground">-</span>;
  const cls = categoriaStyles[code] ?? 'bg-muted text-muted-foreground border-border';
  return (
    <Badge
      variant="outline"
      className={`rounded-full px-2.5 py-0.5 font-medium ${cls}`}
    >
      {code}
    </Badge>
  );
});

const Index = () => {
  const { data: operacoes, isLoading } = useOperacoesEstruturacao();
  const [search, setSearch] = useState('');
  const [selectedEmissao, setSelectedEmissao] = useState<any | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filtrar operações
  const filteredOperacoes = useMemo(() => {
    if (!operacoes) return [];
    if (!search) return operacoes;

    const searchLower = search.toLowerCase();
    return operacoes.filter(op =>
      op.numero_emissao?.toLowerCase().includes(searchLower) ||
      op.nome_operacao?.toLowerCase().includes(searchLower) ||
      op.categoria_nome?.toLowerCase().includes(searchLower) ||
      op.pmo_nome?.toLowerCase().includes(searchLower) ||
      op.veiculo_nome?.toLowerCase().includes(searchLower)
    );
  }, [operacoes, search]);

  const handleRowClick = (operacao: OperacaoEstruturacao) => {
    setSelectedEmissao(operacao);
    setDrawerOpen(true);
  };

  const handleExportEmissao = async (operacao: OperacaoEstruturacao) => {
    const id = (operacao as any).id_emissao_comercial || operacao.id;
    if (!id) return;
    try {
      await exportEmissaoToExcel(id);
      toast.success('Excel gerado');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Falha ao exportar Excel');
    }
  };

  const handleExportAll = async () => {
    try {
      await exportAllEmissoesToExcel(filteredOperacoes as any);
      toast.success('Excel gerado');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Falha ao exportar Excel');
    }
  };

  const clearSearch = () => {
    setSearch('');
  };

  // Stats
  const totalEmissoes = filteredOperacoes.length;
  const totalVolume = filteredOperacoes.reduce((acc, op) => acc + (op.volume || 0), 0);
  const categoriasUnicas = new Set(filteredOperacoes.map(op => op.categoria_nome).filter(Boolean)).size;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container py-6 space-y-6">
          <div>
            <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
          <StatsCardSkeleton count={3} />
          <Card>
            <CardHeader>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <TableSkeleton rows={5} columns={6} />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="container py-6 space-y-6">
          {/* Header (estilo shadcn dashboard) - Responsivo */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Emissões em Estruturação</h1>
              <p className="text-muted-foreground text-sm sm:text-base">KPIs, busca e acompanhamento do pipeline</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button
                variant="outline"
                onClick={handleExportAll}
                className="gap-2"
                disabled={filteredOperacoes.length === 0}
                title="Exportar todas as emissões (resumo + abas detalhadas)"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Exportar Excel</span>
                <span className="sm:hidden">Exportar</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="gap-2"
              >
                <RefreshCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Atualizar</span>
              </Button>
            </div>
          </motion.div>

          {/* Stats (cards mais "fintech") */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatedCard index={0}>
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Emissões</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums">{totalEmissoes}</div>
                  <p className="text-xs text-muted-foreground">no recorte atual (filtro/busca)</p>
                </CardContent>
              </Card>
            </AnimatedCard>

            <AnimatedCard index={1}>
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Volume Total</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums">{formatCurrency(totalVolume)}</div>
                  <p className="text-xs text-muted-foreground">soma das operações listadas</p>
                </CardContent>
              </Card>
            </AnimatedCard>

            <AnimatedCard index={2}>
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Categorias</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums">{categoriasUnicas}</div>
                  <p className="text-xs text-muted-foreground">diversidade do pipeline</p>
                </CardContent>
              </Card>
            </AnimatedCard>
          </div>

          {/* Table Card (toolbar + search) */}
          <AnimatedCard>
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-base">Operações</CardTitle>
                    <CardDescription className="hidden sm:block">
                      Clique numa linha para abrir o painel com Visão Geral, Séries, Despesas, Documentos e Histórico.
                    </CardDescription>
                  </div>

                  <div className="relative w-full sm:w-[360px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por código, operação, categoria ou PMO..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {filteredOperacoes.length === 0 ? (
                  search ? (
                    <div className="p-6">
                      <EmptySearchState searchTerm={search} onClear={clearSearch} />
                    </div>
                  ) : (
                    <EmptyState
                      icon={Inbox}
                      title="Nenhuma operação em estruturação"
                      description="Não há emissões em estruturação no momento."
                      variant="compact"
                    />
                  )
                ) : (
                  <>
                    {/* Mobile: cards (sem arrastar tabela) */}
                    <div className="sm:hidden p-3 space-y-3">
                      {filteredOperacoes.map((operacao, index) => (
                        <motion.div
                          key={operacao.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <button
                            type="button"
                            onClick={() => handleRowClick(operacao)}
                            className="group w-full text-left rounded-xl border border-border/50 bg-card p-4 shadow-sm active:bg-muted/30 hover:shadow-md hover:border-border transition-all"
                          >
                            {/* Header: Nome + Valor */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-foreground truncate">
                                  {operacao.nome_operacao || 'Sem nome'}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {operacao.numero_emissao}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-foreground tabular-nums">
                                  {formatCurrency(operacao.volume || 0)}
                                </div>
                              </div>
                            </div>

                            {/* Tags: Categoria + Veículo */}
                            <div className="mt-3 flex flex-wrap items-center gap-1.5">
                              <CategoriaPill code={operacao.categoria_nome} />
                              {operacao.veiculo_nome && (
                                <Badge variant="outline" className="rounded-full text-xs font-normal bg-muted/50">
                                  {operacao.veiculo_nome}
                                </Badge>
                              )}
                            </div>

                            {/* Footer: PMO + Ações */}
                            <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {operacao.pmo_nome || 'Sem PMO'}
                              </span>
                              <div className="flex items-center gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                  title="Exportar Excel"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleExportEmissao(operacao);
                                  }}
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); handleRowClick(operacao); }}>
                                  <ArrowUpRight className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </button>
                        </motion.div>
                      ))}
                    </div>

                    {/* Desktop: tabela */}
                    <div className="hidden sm:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>PMO</TableHead>
                            <TableHead>Nº Emissão</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead>Operação</TableHead>
                            <TableHead className="text-right">Volume</TableHead>
                            <TableHead className="text-right">Export</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredOperacoes.map((operacao, index) => (
                            <TableRow
                              key={operacao.id}
                              className="group cursor-pointer transition-colors hover:bg-muted/50"
                              onClick={() => handleRowClick(operacao)}
                            >
                              <TableCell className="font-medium group-hover:bg-primary/5 transition-colors">
                                {operacao.pmo_nome || <span className="text-muted-foreground italic">Não atribuído</span>}
                              </TableCell>
                              <TableCell className="group-hover:bg-primary/5 transition-colors">{operacao.numero_emissao}</TableCell>
                              <TableCell className="group-hover:bg-primary/5 transition-colors">
                                <CategoriaPill code={operacao.categoria_nome} />
                              </TableCell>
                              <TableCell className="group-hover:bg-primary/5 transition-colors">
                                {operacao.nome_operacao || <span className="text-muted-foreground">-</span>}
                              </TableCell>
                              <TableCell className="text-right font-medium group-hover:bg-primary/5 transition-colors">
                                {formatCurrency(operacao.volume || 0)}
                              </TableCell>
                              <TableCell className="text-right group-hover:bg-primary/5 transition-colors">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  title="Exportar emissão em Excel"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleExportEmissao(operacao);
                                  }}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </AnimatedCard>
        </main>

        <EmissaoEstruturacaoDrawer
          emissao={selectedEmissao}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
        />
      </div>
    </PageTransition>
  );
};

export default Index;
