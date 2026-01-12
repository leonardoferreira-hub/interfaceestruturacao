import { useState, useMemo } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { mockHistoricoEmissoes } from '@/data/mockData';
import { StatusBadge } from '@/components/emissoes/StatusBadge';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';

const Historico = () => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return mockHistoricoEmissoes;
    const s = search.toLowerCase();
    return mockHistoricoEmissoes.filter(e =>
      e.codigo.toLowerCase().includes(s) ||
      e.nome.toLowerCase().includes(s) ||
      e.originador.toLowerCase().includes(s)
    );
  }, [search]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Histórico</h1>
          <p className="text-muted-foreground">Emissões liquidadas e canceladas</p>
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
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Originador</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead>Liquidação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(e => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.codigo}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{e.nome}</TableCell>
                  <TableCell><Badge variant="outline">{e.tipo}</Badge></TableCell>
                  <TableCell><StatusBadge status={e.status} /></TableCell>
                  <TableCell>{e.originador}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(e.valor_total)}</TableCell>
                  <TableCell>{formatDate(e.data_liquidacao)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default Historico;
