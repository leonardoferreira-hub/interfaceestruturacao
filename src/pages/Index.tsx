import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/layout/Navigation';
import { EmissaoFilters } from '@/components/emissoes/EmissaoFilters';
import { EmissaoTable } from '@/components/emissoes/EmissaoTable';
import { EmissaoStats } from '@/components/emissoes/EmissaoStats';
import { EmissaoDetailDrawer } from '@/components/emissoes/EmissaoDetailDrawer';
import { SpreadsheetMode } from '@/components/emissoes/SpreadsheetMode';
import { BatchEditPreviewDialog } from '@/components/emissoes/BatchEditPreviewDialog';
import { useEmissoes } from '@/hooks/useEmissoes';
import { Emissao, FilterState } from '@/types';
import { exportEmissoesToCSV } from '@/utils/exportUtils';
import { Table2, LayoutGrid, Download, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { EmissaoDB } from '@/types/database';

// Helper to convert DB record to Emissao type for compatibility
const mapDBToEmissao = (db: EmissaoDB): Emissao => ({
  id: db.id,
  codigo: db.numero_emissao || '',
  nome: db.nome_operacao || '',
  tipo: 'CRI', // Default - actual type comes from categoria lookup
  status: (db.status as Emissao['status']) || 'em_estruturacao',
  data_emissao: undefined,
  data_vencimento: undefined,
  created_at: db.criado_em,
  updated_at: db.atualizado_em,
  valor_total: db.volume || 0,
  originador: db.empresa_razao_social || db.empresa_nome_fantasia || '',
  cedente: db.empresa_razao_social || db.empresa_nome_fantasia || '',
  series: [],
  oferta_publica: false,
  esforcos_restritos: false,
  pendencias_count: 0,
});

const Index = () => {
  const { data: emissoes, isLoading, error } = useEmissoes();
  const [filters, setFilters] = useState<FilterState>({ search: '' });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedEmissao, setSelectedEmissao] = useState<Emissao | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [spreadsheetMode, setSpreadsheetMode] = useState(false);
  const [batchChanges, setBatchChanges] = useState<Partial<Emissao>[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  const mappedEmissoes = useMemo(() => 
    (emissoes || []).map(mapDBToEmissao),
    [emissoes]
  );

  const originadores = useMemo(() => 
    [...new Set(mappedEmissoes.map(e => e.originador).filter(Boolean))].sort(),
    [mappedEmissoes]
  );

  const filteredEmissoes = useMemo(() => {
    return mappedEmissoes.filter(emissao => {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        if (!emissao.codigo?.toLowerCase().includes(search) &&
            !emissao.nome?.toLowerCase().includes(search) &&
            !emissao.originador?.toLowerCase().includes(search)) {
          return false;
        }
      }
      if (filters.tipo?.length && !filters.tipo.includes(emissao.tipo)) return false;
      if (filters.status?.length && !filters.status.includes(emissao.status)) return false;
      if (filters.originador?.length && !filters.originador.includes(emissao.originador)) return false;
      return true;
    });
  }, [filters, mappedEmissoes]);

  const handleRowClick = (emissao: Emissao) => {
    setSelectedEmissao(emissao);
    setDrawerOpen(true);
  };

  const handleSpreadsheetSave = (changes: Partial<Emissao>[]) => {
    setBatchChanges(changes);
    setPreviewOpen(true);
  };

  const handleConfirmBatch = () => {
    toast.success(`${batchChanges.length} registro(s) atualizado(s)`);
    setPreviewOpen(false);
    setSpreadsheetMode(false);
    setBatchChanges([]);
  };

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Emissões</h1>
            <p className="text-muted-foreground">Gerencie suas emissões de títulos</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => exportEmissoesToCSV(filteredEmissoes)}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSpreadsheetMode(!spreadsheetMode)}>
              {spreadsheetMode ? <LayoutGrid className="h-4 w-4 mr-2" /> : <Table2 className="h-4 w-4 mr-2" />}
              {spreadsheetMode ? 'Modo Tabela' : 'Modo Planilha'}
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nova Emissão
            </Button>
          </div>
        </div>

        <EmissaoStats emissoes={filteredEmissoes} />

        {!spreadsheetMode && (
          <EmissaoFilters
            filters={filters}
            onFiltersChange={setFilters}
            originadores={originadores}
          />
        )}

        {spreadsheetMode ? (
          <SpreadsheetMode
            emissoes={filteredEmissoes}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onSave={handleSpreadsheetSave}
            onCancel={() => setSpreadsheetMode(false)}
          />
        ) : (
          <EmissaoTable
            emissoes={filteredEmissoes}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onRowClick={handleRowClick}
          />
        )}
      </main>

      <EmissaoDetailDrawer
        emissao={selectedEmissao}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />

      <BatchEditPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        changes={batchChanges}
        emissoes={mappedEmissoes}
        onConfirm={handleConfirmBatch}
      />
    </div>
  );
};

export default Index;
