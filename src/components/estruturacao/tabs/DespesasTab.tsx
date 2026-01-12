import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Banknote } from 'lucide-react';
import { useCustosEmissao } from '@/hooks/useCustos';
import { formatCurrency } from '@/utils/formatters';

interface DespesasTabProps {
  idEmissao: string;
}

// Mapeamento de campos para labels
const CUSTOS_LABELS: Record<string, { label: string; categoria: string }> = {
  fee_agente_fiduciario_upfront: { label: 'Agente Fiduciário', categoria: 'Upfront' },
  fee_agente_fiduciario_recorrente: { label: 'Agente Fiduciário', categoria: 'Recorrente' },
  fee_securitizadora_upfront: { label: 'Securitizadora', categoria: 'Upfront' },
  fee_securitizadora_recorrente: { label: 'Securitizadora', categoria: 'Recorrente' },
  fee_custodiante_lastro_upfront: { label: 'Custodiante Lastro', categoria: 'Upfront' },
  fee_custodiante_lastro_recorrente: { label: 'Custodiante Lastro', categoria: 'Recorrente' },
  fee_liquidante_upfront: { label: 'Liquidante', categoria: 'Upfront' },
  fee_liquidante_recorrente: { label: 'Liquidante', categoria: 'Recorrente' },
  fee_escriturador_upfront: { label: 'Escriturador', categoria: 'Upfront' },
  fee_escriturador_recorrente: { label: 'Escriturador', categoria: 'Recorrente' },
  fee_servicer_upfront: { label: 'Servicer', categoria: 'Upfront' },
  fee_servicer_recorrente: { label: 'Servicer', categoria: 'Recorrente' },
  fee_escriturador_nc_upfront: { label: 'Escriturador NC', categoria: 'Upfront' },
  fee_escriturador_nc_recorrente: { label: 'Escriturador NC', categoria: 'Recorrente' },
  fee_gerenciador_obra_upfront: { label: 'Gerenciador de Obra', categoria: 'Upfront' },
  fee_gerenciador_obra_recorrente: { label: 'Gerenciador de Obra', categoria: 'Recorrente' },
  fee_coordenador_lider_upfront: { label: 'Coordenador Líder', categoria: 'Upfront' },
  fee_assessor_legal_upfront: { label: 'Assessor Legal', categoria: 'Upfront' },
  fee_auditoria_recorrente: { label: 'Auditoria', categoria: 'Recorrente' },
  fee_contabilidade_recorrente: { label: 'Contabilidade', categoria: 'Recorrente' },
  taxa_fiscalizacao_oferta_upfront: { label: 'Taxa Fiscalização Oferta', categoria: 'Upfront' },
  taxa_anbima_upfront: { label: 'Taxa ANBIMA', categoria: 'Upfront' },
};

export function DespesasTab({ idEmissao }: DespesasTabProps) {
  const { data: custos, isLoading } = useCustosEmissao(idEmissao);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!custos) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Nenhuma despesa cadastrada para esta emissão.
        </CardContent>
      </Card>
    );
  }

  // Processar custos para exibição
  const custosUpfront: Array<{ label: string; valor: number }> = [];
  const custosRecorrentes: Array<{ label: string; valor: number }> = [];

  Object.entries(custos).forEach(([key, valor]) => {
    if (key in CUSTOS_LABELS && valor && typeof valor === 'number' && valor > 0) {
      const info = CUSTOS_LABELS[key];
      if (info.categoria === 'Upfront') {
        custosUpfront.push({ label: info.label, valor });
      } else {
        custosRecorrentes.push({ label: info.label, valor });
      }
    }
  });

  const totalUpfront = custosUpfront.reduce((acc, c) => acc + c.valor, 0);
  const totalRecorrente = custosRecorrentes.reduce((acc, c) => acc + c.valor, 0);

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
          <CardTitle className="text-sm flex items-center gap-2">
            <Banknote className="h-4 w-4" />
            Custos Upfront
            <Badge variant="secondary" className="ml-auto">{custosUpfront.length} itens</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {custosUpfront.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum custo upfront cadastrado.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prestador/Item</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {custosUpfront.map((custo, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{custo.label}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(custo.valor)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-semibold">
                  <TableCell>Total Upfront</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalUpfront)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Custos Recorrentes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Banknote className="h-4 w-4" />
            Custos Recorrentes
            <Badge variant="secondary" className="ml-auto">{custosRecorrentes.length} itens</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {custosRecorrentes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum custo recorrente cadastrado.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prestador/Item</TableHead>
                  <TableHead className="text-right">Valor Anual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {custosRecorrentes.map((custo, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{custo.label}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(custo.valor)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-semibold">
                  <TableCell>Total Recorrente</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalRecorrente)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
