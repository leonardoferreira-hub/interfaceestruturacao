import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/layout/Navigation';
import { EmissaoFilters } from '@/components/emissoes/EmissaoFilters';
import { EmissaoTable } from '@/components/emissoes/EmissaoTable';
import { EmissaoStats } from '@/components/emissoes/EmissaoStats';
import { EmissaoDetailDrawer } from '@/components/emissoes/EmissaoDetailDrawer';
import { SpreadsheetMode } from '@/components/emissoes/SpreadsheetMode';
import { BatchEditPreviewDialog } from '@/components/emissoes/BatchEditPreviewDialog';
import { mockEmissoes } from '@/data/mockData';
import { Emissao, FilterState } from '@/types';
import { exportEmissoesToCSV } from '@/utils/exportUtils';
import { Table2, LayoutGrid, Download, Plus } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const [filters, setFilters] = useState<FilterState>({ search: '' });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedEmissao, setSelectedEmissao] = useState<Emissao | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [spreadsheetMode, setSpreadsheetMode] = useState(false);
  const [batchChanges, setBatchChanges] = useState<Partial<Emissao>[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  const originadores = useMemo(() => 
    [...new Set(mockEmissoes.map(e => e.originador))].sort(),
    []
  );

  const filteredEmissoes = useMemo(() => {
    return mockEmissoes.filter(emissao => {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        if (!emissao.codigo.toLowerCase().includes(search) &&
            !emissao.nome.toLowerCase().includes(search) &&
            !emissao.originador.toLowerCase().includes(search)) {
          return false;
        }
      }
      if (filters.tipo?.length && !filters.tipo.includes(emissao.tipo)) return false;
      if (filters.status?.length && !filters.status.includes(emissao.status)) return false;
      if (filters.originador?.length && !filters.originador.includes(emissao.originador)) return false;
      return true;
    });
  }, [filters]);

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
        emissoes={mockEmissoes}
        onConfirm={handleConfirmBatch}
      />
    </div>
  );
};

export default Index;
