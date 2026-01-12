import { useState, useMemo } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { PendenciaCard } from '@/components/pendencias/PendenciaCard';
import { mockPendencias } from '@/data/mockData';
import { Pendencia, StatusPendencia, STATUS_PENDENCIA_LABELS } from '@/types';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

const COLUMNS: StatusPendencia[] = ['pendente', 'em_andamento', 'concluido'];

const Pendencias = () => {
  const [search, setSearch] = useState('');

  const filteredPendencias = useMemo(() => {
    if (!search) return mockPendencias;
    const s = search.toLowerCase();
    return mockPendencias.filter(p =>
      p.titulo.toLowerCase().includes(s) ||
      p.emissao_codigo?.toLowerCase().includes(s) ||
      p.responsavel?.toLowerCase().includes(s)
    );
  }, [search]);

  const grouped = useMemo(() => {
    const result: Record<StatusPendencia, Pendencia[]> = {
      pendente: [],
      em_andamento: [],
      concluido: [],
    };
    filteredPendencias.forEach(p => result[p.status].push(p));
    return result;
  }, [filteredPendencias]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pendências</h1>
          <p className="text-muted-foreground">Acompanhe as pendências das emissões</p>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar pendências..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map(status => (
            <div key={status} className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{STATUS_PENDENCIA_LABELS[status]}</h3>
                <Badge variant="secondary">{grouped[status].length}</Badge>
              </div>
              <div className="space-y-3 min-h-[200px] bg-muted/30 rounded-lg p-3">
                {grouped[status].map(p => (
                  <PendenciaCard key={p.id} pendencia={p} />
                ))}
                {grouped[status].length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    Nenhuma pendência
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Pendencias;
