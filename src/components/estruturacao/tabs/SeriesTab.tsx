import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import { useSeries } from '@/hooks/useEmissoes';
import { formatCurrency } from '@/utils/formatters';

interface SeriesTabProps {
  idEmissao: string;
}

export function SeriesTab({ idEmissao }: SeriesTabProps) {
  const { data: series = [], isLoading } = useSeries(idEmissao);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (series.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Nenhuma série cadastrada para esta emissão.
        </CardContent>
      </Card>
    );
  }

  // Calcular totais
  const totalVolume = series.reduce((acc, s) => acc + (s.valor_emissao || 0), 0);

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
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Detalhamento das Séries
          </CardTitle>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {series.map((serie) => (
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
                        ? `${((serie.valor_emissao / totalVolume) * 100).toFixed(2)}%`
                        : '-'
                    }
                  </TableCell>
                  <TableCell>
                    {serie.taxa_juros 
                      ? `${serie.taxa_juros.toFixed(2)}% a.a.`
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    {serie.prazo || '-'}
                  </TableCell>
                  <TableCell>
                    {serie.data_vencimento 
                      ? new Date(serie.data_vencimento).toLocaleDateString('pt-BR')
                      : '-'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
