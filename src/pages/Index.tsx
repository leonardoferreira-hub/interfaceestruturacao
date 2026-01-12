import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/layout/Navigation';
import { EmissaoEstruturacaoDrawer } from '@/components/estruturacao/EmissaoEstruturacaoDrawer';
import { useEmissoesEstruturacao } from '@/hooks/useEmissoes';
import { formatCurrency } from '@/utils/formatters';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Building2, TrendingUp, Calendar, FileText } from 'lucide-react';
import type { EmissaoDB } from '@/types/database';

const Index = () => {
  const { data: emissoes, isLoading, error } = useEmissoesEstruturacao();
  const [search, setSearch] = useState('');
  const [selectedEmissao, setSelectedEmissao] = useState<EmissaoDB | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredEmissoes = useMemo(() => {
    if (!emissoes) return [];
    if (!search) return emissoes;
    
    const searchLower = search.toLowerCase();
    return emissoes.filter(e => 
      e.numero_emissao?.toLowerCase().includes(searchLower) ||
      e.nome_operacao?.toLowerCase().includes(searchLower) ||
      e.empresa_razao_social?.toLowerCase().includes(searchLower)
    );
  }, [emissoes, search]);

  const handleRowClick = (emissao: EmissaoDB) => {
    setSelectedEmissao(emissao);
    setDrawerOpen(true);
  };

  // Stats
  const totalEmissoes = filteredEmissoes.length;
  const totalVolume = filteredEmissoes.reduce((acc, e) => acc + (e.volume || 0), 0);
  const empresasUnicas = new Set(filteredEmissoes.map(e => e.empresa_razao_social).filter(Boolean)).size;

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

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container py-6">
          <div className="text-center text-destructive">
            Erro ao carregar emissões: {error.message}
          </div>
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
                <span className="text-sm text-muted-foreground">Empresas</span>
              </div>
              <div className="text-2xl font-bold">{empresasUnicas}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código, nome ou empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Lista de Emissões */}
        <div className="space-y-2">
          {filteredEmissoes.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma emissão em estruturação encontrada.
              </CardContent>
            </Card>
          ) : (
            filteredEmissoes.map((emissao) => (
              <Card 
                key={emissao.id} 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleRowClick(emissao)}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {emissao.nome_operacao || emissao.numero_emissao}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {emissao.numero_emissao}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {emissao.empresa_razao_social || 'Empresa não informada'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {emissao.criado_em 
                            ? new Date(emissao.criado_em).toLocaleDateString('pt-BR')
                            : '-'
                          }
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(emissao.volume || 0)}</div>
                      <Badge variant="secondary" className="text-xs">Em Estruturação</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
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
