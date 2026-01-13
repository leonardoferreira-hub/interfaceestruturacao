import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrendingUp, Pencil, Plus, Trash2, Save, X } from 'lucide-react';
import { useSeries } from '@/hooks/useEmissoes';
import { useCreateSerie, useUpdateSerie, useDeleteSerie } from '@/hooks/useSeries';
import { formatCurrency } from '@/utils/formatters';
import type { SerieDB } from '@/types/database';

interface SeriesTabProps {
  idEmissao: string;
}

interface SerieEditState {
  numero: number;
  valor_emissao: number;
  taxa_juros: number | null;
  prazo: number | null;
  data_vencimento: string | null;
}

export function SeriesTab({ idEmissao }: SeriesTabProps) {
  const { data: series = [], isLoading } = useSeries(idEmissao);
  const createSerie = useCreateSerie();
  const updateSerie = useUpdateSerie();
  const deleteSerie = useDeleteSerie();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedSeries, setEditedSeries] = useState<Record<string, SerieEditState>>({});
  const [newSerie, setNewSerie] = useState<SerieEditState | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // Calcular totais
  const totalVolume = series.reduce((acc, s) => acc + (s.valor_emissao || 0), 0);

  const handleStartEditing = () => {
    const initialState: Record<string, SerieEditState> = {};
    series.forEach((s) => {
      initialState[s.id] = {
        numero: s.numero,
        valor_emissao: s.valor_emissao || 0,
        taxa_juros: s.taxa_juros,
        prazo: s.prazo,
        data_vencimento: s.data_vencimento,
      };
    });
    setEditedSeries(initialState);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setEditedSeries({});
    setNewSerie(null);
    setIsEditing(false);
  };

  const handleSaveAll = async () => {
    try {
      // Salvar séries editadas
      for (const [id, dados] of Object.entries(editedSeries)) {
        const original = series.find((s) => s.id === id);
        if (original) {
          const hasChanges = 
            dados.valor_emissao !== (original.valor_emissao || 0) ||
            dados.taxa_juros !== original.taxa_juros ||
            dados.prazo !== original.prazo ||
            dados.data_vencimento !== original.data_vencimento;
          
          if (hasChanges) {
            await updateSerie.mutateAsync({
              id,
              idEmissao,
              dados: {
                valor_emissao: dados.valor_emissao,
                taxa_juros: dados.taxa_juros,
                prazo: dados.prazo,
                data_vencimento: dados.data_vencimento,
              },
            });
          }
        }
      }

      // Criar nova série se houver
      if (newSerie && newSerie.valor_emissao > 0) {
        await createSerie.mutateAsync({
          id_emissao: idEmissao,
          numero: newSerie.numero,
          valor_emissao: newSerie.valor_emissao,
          taxa_juros: newSerie.taxa_juros,
          prazo: newSerie.prazo,
          data_vencimento: newSerie.data_vencimento,
          percentual_volume: null,
        });
      }

      setEditedSeries({});
      setNewSerie(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar séries:', error);
    }
  };

  const handleDeleteSerie = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta série?')) {
      await deleteSerie.mutateAsync({ id, idEmissao });
    }
  };

  const handleAddSerie = () => {
    const nextNumero = series.length > 0 ? Math.max(...series.map((s) => s.numero)) + 1 : 1;
    setNewSerie({
      numero: nextNumero,
      valor_emissao: 0,
      taxa_juros: null,
      prazo: null,
      data_vencimento: null,
    });
  };

  const updateEditedSerie = (id: string, field: keyof SerieEditState, value: number | string | null) => {
    setEditedSeries((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const updateNewSerie = (field: keyof SerieEditState, value: number | string | null) => {
    if (newSerie) {
      setNewSerie({
        ...newSerie,
        [field]: value,
      });
    }
  };

  const renderSerieRow = (serie: SerieDB, isNew = false) => {
    const editState = isNew ? newSerie : editedSeries[serie.id];
    const currentTotalVolume = isNew 
      ? totalVolume + (newSerie?.valor_emissao || 0)
      : totalVolume;

    if (isEditing && editState) {
      return (
        <TableRow key={isNew ? 'new' : serie.id}>
          <TableCell>
            <Badge variant="outline">Série {editState.numero}</Badge>
          </TableCell>
          <TableCell>
            <Input
              type="number"
              value={editState.valor_emissao || ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                if (isNew) {
                  updateNewSerie('valor_emissao', val);
                } else {
                  updateEditedSerie(serie.id, 'valor_emissao', val);
                }
              }}
              className="w-32"
              placeholder="0,00"
            />
          </TableCell>
          <TableCell className="text-muted-foreground">
            {currentTotalVolume > 0
              ? `${((editState.valor_emissao / currentTotalVolume) * 100).toFixed(2)}%`
              : '-'}
          </TableCell>
          <TableCell>
            <Input
              type="number"
              step="0.01"
              value={editState.taxa_juros ?? ''}
              onChange={(e) => {
                const val = e.target.value ? parseFloat(e.target.value) : null;
                if (isNew) {
                  updateNewSerie('taxa_juros', val);
                } else {
                  updateEditedSerie(serie.id, 'taxa_juros', val);
                }
              }}
              className="w-24"
              placeholder="0,00"
            />
          </TableCell>
          <TableCell>
            <Input
              type="number"
              value={editState.prazo ?? ''}
              onChange={(e) => {
                const val = e.target.value ? parseInt(e.target.value) : null;
                if (isNew) {
                  updateNewSerie('prazo', val);
                } else {
                  updateEditedSerie(serie.id, 'prazo', val);
                }
              }}
              className="w-20"
              placeholder="0"
            />
          </TableCell>
          <TableCell>
            <Input
              type="date"
              value={editState.data_vencimento ?? ''}
              onChange={(e) => {
                const val = e.target.value || null;
                if (isNew) {
                  updateNewSerie('data_vencimento', val);
                } else {
                  updateEditedSerie(serie.id, 'data_vencimento', val);
                }
              }}
              className="w-36"
            />
          </TableCell>
          <TableCell>
            {!isNew && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDeleteSerie(serie.id)}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            {isNew && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setNewSerie(null)}
                className="h-8 w-8 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </TableCell>
        </TableRow>
      );
    }

    // Modo visualização
    return (
      <TableRow key={serie.id}>
        <TableCell>
          <Badge variant="outline">Série {serie.numero}</Badge>
        </TableCell>
        <TableCell className="font-medium">
          {formatCurrency(serie.valor_emissao || 0)}
        </TableCell>
        <TableCell>
          {serie.percentual_volume
            ? `${serie.percentual_volume.toFixed(2)}%`
            : totalVolume > 0
              ? `${(((serie.valor_emissao || 0) / totalVolume) * 100).toFixed(2)}%`
              : '-'}
        </TableCell>
        <TableCell>
          {serie.taxa_juros ? `${serie.taxa_juros.toFixed(2)}% a.a.` : '-'}
        </TableCell>
        <TableCell>{serie.prazo || '-'}</TableCell>
        <TableCell>
          {serie.data_vencimento
            ? new Date(serie.data_vencimento).toLocaleDateString('pt-BR')
            : '-'}
        </TableCell>
        {isEditing && <TableCell />}
      </TableRow>
    );
  };

  if (series.length === 0 && !isEditing) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground mb-4">Nenhuma série cadastrada para esta emissão.</p>
          <Button onClick={handleAddSerie} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Série
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">Total de Séries</div>
            <div className="text-lg font-semibold">{series.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">Volume Total</div>
            <div className="text-lg font-semibold">{formatCurrency(totalVolume)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Séries */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Detalhamento das Séries
            </CardTitle>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddSerie}
                    disabled={!!newSerie}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEditing}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveAll}
                    disabled={updateSerie.isPending || createSerie.isPending}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Salvar
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={handleStartEditing}>
                  <Pencil className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Série</TableHead>
                <TableHead>Valor de Emissão</TableHead>
                <TableHead>% do Volume</TableHead>
                <TableHead>Taxa de Juros</TableHead>
                <TableHead>Prazo (meses)</TableHead>
                <TableHead>Vencimento</TableHead>
                {isEditing && <TableHead className="w-12" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {series.map((serie) => renderSerieRow(serie))}
              {newSerie && renderSerieRow({ id: 'new', id_emissao: idEmissao, ...newSerie } as SerieDB, true)}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
