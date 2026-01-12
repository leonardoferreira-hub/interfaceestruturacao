import { useState, useMemo } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { EmissaoEstruturacaoDrawer } from '@/components/estruturacao/EmissaoEstruturacaoDrawer';
import { useEmissoesComDetalhes, EmissaoComDetalhes } from '@/hooks/useEmissoesComDetalhes';
import { useEmissoesEstruturacao } from '@/hooks/useEmissoes';
import { formatCurrency } from '@/utils/formatters';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Loader2, Building2, TrendingUp, FileText } from 'lucide-react';
import type { EmissaoDB } from '@/types/database';

const Index = () => {
  const { data: emissoesDetalhes, isLoading: loadingDetalhes } = useEmissoesComDetalhes();
  const { data: emissoesDB, isLoading: loadingEmissoes } = useEmissoesEstruturacao();
  const [search, setSearch] = useState('');
  const [selectedEmissao, setSelectedEmissao] = useState<EmissaoDB | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isLoading = loadingDetalhes || loadingEmissoes;

  // Combinar dados para filtragem e exibição
  const filteredEmissoes = useMemo(() => {
    if (!emissoesDetalhes) return [];
    if (!search) return emissoesDetalhes;
    
    const searchLower = search.toLowerCase();
    return emissoesDetalhes.filter(e => 
      e.numero_emissao?.toLowerCase().includes(searchLower) ||
      e.nome_operacao?.toLowerCase().includes(searchLower) ||
      e.categoria_nome?.toLowerCase().includes(searchLower) ||
      e.pmo_nome?.toLowerCase().includes(searchLower)
    );
  }, [emissoesDetalhes, search]);

  const handleRowClick = (emissaoDetalhe: EmissaoComDetalhes) => {
    // Buscar a emissão completa para o drawer
    const emissaoCompleta = emissoesDB?.find(e => e.id === emissaoDetalhe.id);
    if (emissaoCompleta) {
      setSelectedEmissao(emissaoCompleta);
      setDrawerOpen(true);
    }
  };

  // Stats
  const totalEmissoes = filteredEmissoes.length;
  const totalVolume = filteredEmissoes.reduce((acc, e) => acc + (e.volume || 0), 0);
  const empresasUnicas = new Set(filteredEmissoes.map(e => e.categoria_nome).filter(Boolean)).size;

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
              <div className="text-2xl font-bold">{empresasUnicas}</div>
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

        {/* Tabela de Emissões */}
        <Card>
          <CardContent className="p-0">
            {filteredEmissoes.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                Nenhuma emissão em estruturação encontrada.
              </div>
            ) : (
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
                  {filteredEmissoes.map((emissao) => (
                    <TableRow 
                      key={emissao.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(emissao)}
                    >
                      <TableCell className="font-medium">
                        {emissao.pmo_nome || <span className="text-muted-foreground italic">Não atribuído</span>}
                      </TableCell>
                      <TableCell>{emissao.numero_emissao}</TableCell>
                      <TableCell>
                        {emissao.categoria_nome || <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell>
                        {emissao.nome_operacao || <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(emissao.volume || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
