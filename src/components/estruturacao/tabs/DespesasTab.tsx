import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Banknote, Pencil, Save, X } from 'lucide-react';
import { useCustosEmissao, useUpdateCustos } from '@/hooks/useCustos';
import { formatCurrency } from '@/utils/formatters';

interface DespesasTabProps {
  idEmissao: string;
}

// Mapeamento de campos para labels
const CUSTOS_UPFRONT: Array<{ key: string; label: string }> = [
  { key: 'fee_agente_fiduciario_upfront', label: 'Agente Fiduciário' },
  { key: 'fee_securitizadora_upfront', label: 'Securitizadora' },
  { key: 'fee_custodiante_lastro_upfront', label: 'Custodiante Lastro' },
  { key: 'fee_liquidante_upfront', label: 'Liquidante' },
  { key: 'fee_escriturador_upfront', label: 'Escriturador' },
  { key: 'fee_servicer_upfront', label: 'Servicer' },
  { key: 'fee_escriturador_nc_upfront', label: 'Escriturador NC' },
  { key: 'fee_gerenciador_obra_upfront', label: 'Gerenciador de Obra' },
  { key: 'fee_coordenador_lider_upfront', label: 'Coordenador Líder' },
  { key: 'fee_assessor_legal_upfront', label: 'Assessor Legal' },
  { key: 'taxa_fiscalizacao_oferta_upfront', label: 'Taxa Fiscalização Oferta' },
  { key: 'taxa_anbima_upfront', label: 'Taxa ANBIMA' },
];

const CUSTOS_RECORRENTES: Array<{ key: string; label: string }> = [
  { key: 'fee_agente_fiduciario_recorrente', label: 'Agente Fiduciário' },
  { key: 'fee_securitizadora_recorrente', label: 'Securitizadora' },
  { key: 'fee_custodiante_lastro_recorrente', label: 'Custodiante Lastro' },
  { key: 'fee_liquidante_recorrente', label: 'Liquidante' },
  { key: 'fee_escriturador_recorrente', label: 'Escriturador' },
  { key: 'fee_servicer_recorrente', label: 'Servicer' },
  { key: 'fee_escriturador_nc_recorrente', label: 'Escriturador NC' },
  { key: 'fee_gerenciador_obra_recorrente', label: 'Gerenciador de Obra' },
  { key: 'fee_auditoria_recorrente', label: 'Auditoria' },
  { key: 'fee_contabilidade_recorrente', label: 'Contabilidade' },
];

export function DespesasTab({ idEmissao }: DespesasTabProps) {
  const { data: custos, isLoading } = useCustosEmissao(idEmissao);
  const updateCustos = useUpdateCustos();
  
  const [isEditingUpfront, setIsEditingUpfront] = useState(false);
  const [isEditingRecorrente, setIsEditingRecorrente] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, number | null>>({});

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Obter valor atual de um campo (editado ou original)
  const getValue = (key: string): number | null => {
    if (key in editedValues) {
      return editedValues[key];
    }
    if (custos && key in custos) {
      return (custos as Record<string, unknown>)[key] as number | null;
    }
    return null;
  };

  // Calcular totais
  const calcularTotal = (campos: Array<{ key: string }>) => {
    return campos.reduce((acc, { key }) => {
      const valor = getValue(key);
      return acc + (valor || 0);
    }, 0);
  };

  const totalUpfront = calcularTotal(CUSTOS_UPFRONT);
  const totalRecorrente = calcularTotal(CUSTOS_RECORRENTES);

  const handleStartEditingUpfront = () => {
    const initialValues: Record<string, number | null> = {};
    CUSTOS_UPFRONT.forEach(({ key }) => {
      initialValues[key] = custos ? ((custos as Record<string, unknown>)[key] as number | null) : null;
    });
    setEditedValues((prev) => ({ ...prev, ...initialValues }));
    setIsEditingUpfront(true);
  };

  const handleStartEditingRecorrente = () => {
    const initialValues: Record<string, number | null> = {};
    CUSTOS_RECORRENTES.forEach(({ key }) => {
      initialValues[key] = custos ? ((custos as Record<string, unknown>)[key] as number | null) : null;
    });
    setEditedValues((prev) => ({ ...prev, ...initialValues }));
    setIsEditingRecorrente(true);
  };

  const handleCancelUpfront = () => {
    CUSTOS_UPFRONT.forEach(({ key }) => {
      setEditedValues((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    });
    setIsEditingUpfront(false);
  };

  const handleCancelRecorrente = () => {
    CUSTOS_RECORRENTES.forEach(({ key }) => {
      setEditedValues((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    });
    setIsEditingRecorrente(false);
  };

  const handleSaveUpfront = async () => {
    const dados: Record<string, number | null> = {};
    CUSTOS_UPFRONT.forEach(({ key }) => {
      if (key in editedValues) {
        dados[key] = editedValues[key];
      }
    });

    try {
      await updateCustos.mutateAsync({ idEmissao, dados });
      handleCancelUpfront();
    } catch (error) {
      console.error('Erro ao salvar custos upfront:', error);
    }
  };

  const handleSaveRecorrente = async () => {
    const dados: Record<string, number | null> = {};
    CUSTOS_RECORRENTES.forEach(({ key }) => {
      if (key in editedValues) {
        dados[key] = editedValues[key];
      }
    });

    try {
      await updateCustos.mutateAsync({ idEmissao, dados });
      handleCancelRecorrente();
    } catch (error) {
      console.error('Erro ao salvar custos recorrentes:', error);
    }
  };

  const handleValueChange = (key: string, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setEditedValues((prev) => ({ ...prev, [key]: numValue }));
  };

  const renderCustoRow = (key: string, label: string, isEditing: boolean) => {
    const valor = getValue(key);

    if (isEditing) {
      return (
        <TableRow key={key}>
          <TableCell>{label}</TableCell>
          <TableCell className="text-right">
            <Input
              type="number"
              value={editedValues[key] ?? ''}
              onChange={(e) => handleValueChange(key, e.target.value)}
              className="w-32 ml-auto text-right"
              placeholder="0,00"
            />
          </TableCell>
        </TableRow>
      );
    }

    return (
      <TableRow key={key}>
        <TableCell>{label}</TableCell>
        <TableCell className="text-right font-medium">
          {valor ? formatCurrency(valor) : '-'}
        </TableCell>
      </TableRow>
    );
  };

  if (!custos) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Nenhuma despesa cadastrada para esta emissão.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">Total Upfront</div>
            <div className="text-lg font-semibold text-primary">{formatCurrency(totalUpfront)}</div>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground">Total Recorrente (anual)</div>
            <div className="text-lg font-semibold text-primary">{formatCurrency(totalRecorrente)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Custos Upfront */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Banknote className="h-4 w-4" />
              Custos Upfront
              <Badge variant="secondary" className="ml-2">
                {CUSTOS_UPFRONT.filter(({ key }) => getValue(key)).length} itens
              </Badge>
            </CardTitle>
            <div className="flex gap-2">
              {isEditingUpfront ? (
                <>
                  <Button size="sm" variant="ghost" onClick={handleCancelUpfront}>
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveUpfront}
                    disabled={updateCustos.isPending}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Salvar
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={handleStartEditingUpfront}>
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
                <TableHead>Prestador/Item</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CUSTOS_UPFRONT.map(({ key, label }) => 
                renderCustoRow(key, label, isEditingUpfront)
              )}
              <TableRow className="bg-muted/50 font-semibold">
                <TableCell>Total Upfront</TableCell>
                <TableCell className="text-right">{formatCurrency(totalUpfront)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Custos Recorrentes */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Banknote className="h-4 w-4" />
              Custos Recorrentes
              <Badge variant="secondary" className="ml-2">
                {CUSTOS_RECORRENTES.filter(({ key }) => getValue(key)).length} itens
              </Badge>
            </CardTitle>
            <div className="flex gap-2">
              {isEditingRecorrente ? (
                <>
                  <Button size="sm" variant="ghost" onClick={handleCancelRecorrente}>
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveRecorrente}
                    disabled={updateCustos.isPending}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Salvar
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={handleStartEditingRecorrente}>
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
                <TableHead>Prestador/Item</TableHead>
                <TableHead className="text-right">Valor Anual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CUSTOS_RECORRENTES.map(({ key, label }) => 
                renderCustoRow(key, label, isEditingRecorrente)
              )}
              <TableRow className="bg-muted/50 font-semibold">
                <TableCell>Total Recorrente</TableCell>
                <TableCell className="text-right">{formatCurrency(totalRecorrente)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
