import { useState, useMemo } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { useEmissoes } from '@/hooks/useEmissoes';
import { StatusBadge } from '@/components/emissoes/StatusBadge';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Loader2 } from 'lucide-react';

const Historico = () => {
  const [search, setSearch] = useState('');
  const { data: emissoes, isLoading } = useEmissoes();

  // Filter for finalized/canceled emissions (historical)
  const historicoEmissoes = useMemo(() => 
    (emissoes || []).filter(e => 
      e.status === 'finalizada' || e.status === 'recusada'
    ),
    [emissoes]
  );

  const filtered = useMemo(() => {
    if (!search) return historicoEmissoes;
    const s = search.toLowerCase();
    return historicoEmissoes.filter(e =>
      e.numero_emissao?.toLowerCase().includes(s) ||
      e.nome_operacao?.toLowerCase().includes(s) ||
      e.empresa_razao_social?.toLowerCase().includes(s)
    );
  }, [search, historicoEmissoes]);

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
          <h1 className="text-3xl font-bold tracking-tight">Histórico</h1>
          <p className="text-muted-foreground">Emissões finalizadas e canceladas</p>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar no histórico..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhuma emissão no histórico
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.numero_emissao}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{e.nome_operacao || '-'}</TableCell>
                    <TableCell><StatusBadge status={e.status || 'rascunho'} /></TableCell>
                    <TableCell>{e.empresa_razao_social || '-'}</TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(e.volume || 0)}</TableCell>
                    <TableCell>{formatDate(e.criado_em)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default Historico;
