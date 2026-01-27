import { useState, useMemo } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { EmissaoEstruturacaoDrawer } from '@/components/estruturacao/EmissaoEstruturacaoDrawer';
import { useOperacoesEstruturacao, OperacaoEstruturacao } from '@/hooks/useOperacoesEstruturacao';
import { formatCurrency } from '@/utils/formatters';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Building2, TrendingUp, FileText, ArrowUpRight } from 'lucide-react';

const categoriaStyles: Record<string, string> = {
  CRI: 'bg-emerald-600/10 text-emerald-700 border-emerald-600/25',
  CRA: 'bg-teal-600/10 text-teal-700 border-teal-600/25',
  DEB: 'bg-indigo-600/10 text-indigo-700 border-indigo-600/25',
  CR: 'bg-lime-600/10 text-lime-700 border-lime-600/25',
  NC: 'bg-amber-600/10 text-amber-700 border-amber-600/25',
};

function CategoriaPill({ code }: { code: string | null | undefined }) {
  if (!code) return <span className="text-muted-foreground">-</span>;
  const cls = categoriaStyles[code] ?? 'bg-muted text-foreground border-border';
  return (
    <Badge
      variant="outline"
      className={`rounded-full px-2.5 py-0.5 font-medium ${cls} shadow-[0_0_0_0_rgba(0,0,0,0)] transition-shadow group-hover:shadow-[0_0_0_6px_rgba(16,185,129,0.10)]`}
    >
      {code}
    </Badge>
  );
}

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

  // Stats
  const totalEmissoes = filteredOperacoes.length;
  const totalVolume = filteredOperacoes.reduce((acc, op) => acc + (op.volume || 0), 0);
  const categoriasUnicas = new Set(filteredOperacoes.map(op => op.categoria_nome).filter(Boolean)).size;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container py-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Emissões em Estruturação</h1>
          <p className="text-muted-foreground">Gerencie as operações em estruturação</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Emissões</span>
              </div>
              <div className="text-2xl font-bold">{totalEmissoes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Volume Total</span>
              </div>
              <div className="text-2xl font-bold">{formatCurrency(totalVolume)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Categorias</span>
              </div>
              <div className="text-2xl font-bold">{categoriasUnicas}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código, operação, categoria ou PMO..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Operações */}
        <Card>
          <CardContent className="p-0">
            {filteredOperacoes.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                Nenhuma operação em estruturação encontrada.
              </div>
            ) : (
              <>
                {/* Mobile: cards (sem arrastar tabela) */}
                <div className="sm:hidden p-3 space-y-3">
                  {filteredOperacoes.map((operacao) => (
                    <button
                      key={operacao.id}
                      type="button"
                      onClick={() => handleRowClick(operacao)}
                      className="w-full text-left rounded-lg border border-border/70 bg-background p-4 space-y-3 active:bg-muted/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate">
                            {operacao.nome_operacao || 'Operação'}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {operacao.numero_emissao}
                            {operacao.categoria_nome ? ` • ${operacao.categoria_nome}` : ''}
                            {operacao.veiculo_nome ? ` • ${operacao.veiculo_nome}` : ''}
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <CategoriaPill code={operacao.categoria_nome} />
                            {operacao.veiculo_nome ? (
                              <Badge variant="secondary" className="rounded-full">
                                {operacao.veiculo_nome}
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                        <div className="shrink-0 text-sm font-semibold tabular-nums">
                          {formatCurrency(operacao.volume || 0)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs text-muted-foreground truncate">
                          PMO: {operacao.pmo_nome || 'Não atribuído'}
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleRowClick(operacao); }}>
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Desktop: tabela */}
                <div className="hidden sm:block overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>PMO</TableHead>
                        <TableHead>Nº Emissão</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Operação</TableHead>
                        <TableHead className="text-right">Volume</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOperacoes.map((operacao) => (
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>

      <EmissaoEstruturacaoDrawer
        emissao={selectedEmissao}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
};

export default Index;
