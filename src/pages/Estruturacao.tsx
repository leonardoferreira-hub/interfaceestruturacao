import { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  FileText, 
  Users, 
  Calendar, 
  TrendingUp,
  ChevronRight,
  Building2,
  Loader2
} from 'lucide-react';
import { useEmissoesEstruturacao } from '@/hooks/useEmissoes';
import { EmissaoEstruturacaoDrawer } from '@/components/estruturacao/EmissaoEstruturacaoDrawer';
import { formatCurrency } from '@/utils/formatters';
import type { EmissaoDB } from '@/types/database';

const Estruturacao = () => {
  const [search, setSearch] = useState('');
  const [selectedEmissao, setSelectedEmissao] = useState<EmissaoDB | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const { data: emissoes, isLoading, error } = useEmissoesEstruturacao();

  const filteredEmissoes = emissoes?.filter(emissao => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      emissao.numero_emissao.toLowerCase().includes(searchLower) ||
      emissao.nome_operacao?.toLowerCase().includes(searchLower) ||
      emissao.empresa_razao_social?.toLowerCase().includes(searchLower)
    );
  }) || [];

  const handleOpenDrawer = (emissao: EmissaoDB) => {
    setSelectedEmissao(emissao);
    setDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Estruturação</h1>
            <p className="text-muted-foreground">
              Emissões em fase de estruturação
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Estruturação</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{emissoes?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Volume Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(emissoes?.reduce((sum, e) => sum + (e.volume || 0), 0) || 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Empresas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(emissoes?.map(e => e.empresa_razao_social)).size || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {emissoes?.filter(e => {
                  const date = new Date(e.criado_em || '');
                  const now = new Date();
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                }).length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar emissões..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Emissões List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Erro ao carregar emissões. Tente novamente.
            </CardContent>
          </Card>
        ) : filteredEmissoes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {search ? 'Nenhuma emissão encontrada.' : 'Nenhuma emissão em estruturação.'}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredEmissoes.map((emissao) => (
              <Card 
                key={emissao.id} 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleOpenDrawer(emissao)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {emissao.nome_operacao || emissao.numero_emissao}
                      </CardTitle>
                      <CardDescription>
                        {emissao.empresa_razao_social || 'Empresa não informada'}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {emissao.numero_emissao}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span>{formatCurrency(emissao.volume || 0)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {emissao.criado_em 
                            ? new Date(emissao.criado_em).toLocaleDateString('pt-BR')
                            : 'Sem data'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{emissao.contato_nome || 'Sem contato'}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <EmissaoEstruturacaoDrawer
        emissao={selectedEmissao}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
};

export default Estruturacao;
