import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { CostSection, type CostType } from './despesas/CostSection';
import type { CostItem } from './despesas/CostRow';
import { useCustosEmissao, useCustosLinhas, useUpdateCustos } from '@/hooks/useCustos';
import { useSeries } from '@/hooks/useEmissoes';
import { formatCurrency } from '@/utils/formatters';
import { Skeleton } from '@/components/ui/skeleton';

interface DespesasTabProps {
  idEmissao: string;
}

export interface CostsData {
  upfront: CostItem[];
  anual: CostItem[];
  mensal: CostItem[];
}

export function DespesasTab({ idEmissao }: DespesasTabProps) {
  const { data: custos, isLoading: isLoadingCustos } = useCustosEmissao(idEmissao);
  const { data: custosLinhas, isLoading: isLoadingLinhas } = useCustosLinhas(custos?.id);
  const { data: series = [] } = useSeries(idEmissao);
  const updateCustos = useUpdateCustos();

  const [costsData, setCostsData] = useState<CostsData>({
    upfront: [],
    anual: [],
    mensal: [],
  });

  // Volume total das séries
  const volume = series.reduce((acc, s) => acc + (s.valor_emissao || 0), 0);

  // Converter dados do banco para o formato do componente
  useEffect(() => {
    if (custosLinhas && custosLinhas.length > 0) {
      const upfront: CostItem[] = [];
      const anual: CostItem[] = [];
      const mensal: CostItem[] = [];

      custosLinhas.forEach((linha) => {
        const item: CostItem = {
          id: linha.id,
          prestador: (linha.prestador as { nome?: string })?.nome || linha.papel || '',
          papel: linha.papel,
          valor: linha.preco_upfront || linha.preco_recorrente || 0,
          grossUp: linha.gross_up || 0,
          valorBruto: linha.valor_upfront_bruto || linha.valor_recorrente_bruto || 0,
          tipo: 'auto',
          id_prestador: linha.id_prestador,
          periodicidade: linha.periodicidade,
        };

        // Classificar por periodicidade
        if (linha.periodicidade === 'mensal') {
          mensal.push(item);
        } else if (linha.periodicidade === 'anual') {
          anual.push(item);
        } else {
          // upfront ou sem periodicidade
          if (linha.preco_upfront && linha.preco_upfront > 0) {
            upfront.push({ ...item, valor: linha.preco_upfront, valorBruto: linha.valor_upfront_bruto || linha.preco_upfront });
          }
          if (linha.preco_recorrente && linha.preco_recorrente > 0) {
            anual.push({ ...item, valor: linha.preco_recorrente, valorBruto: linha.valor_recorrente_bruto || linha.preco_recorrente });
          }
        }
      });

      setCostsData({ upfront, anual, mensal });
    } else if (custos) {
      // Fallback: usar campos diretos da tabela custos se não houver linhas
      const upfront: CostItem[] = [];
      const anual: CostItem[] = [];

      const upfrontFields = [
        { key: 'fee_agente_fiduciario_upfront', papel: 'Agente Fiduciário' },
        { key: 'fee_securitizadora_upfront', papel: 'Securitizadora' },
        { key: 'fee_custodiante_lastro_upfront', papel: 'Custodiante Lastro' },
        { key: 'fee_liquidante_upfront', papel: 'Liquidante' },
        { key: 'fee_escriturador_upfront', papel: 'Escriturador' },
        { key: 'fee_servicer_upfront', papel: 'Servicer' },
        { key: 'fee_escriturador_nc_upfront', papel: 'Escriturador NC' },
        { key: 'fee_gerenciador_obra_upfront', papel: 'Gerenciador de Obra' },
        { key: 'fee_coordenador_lider_upfront', papel: 'Coordenador Líder' },
        { key: 'fee_assessor_legal_upfront', papel: 'Assessor Legal' },
        { key: 'taxa_fiscalizacao_oferta_upfront', papel: 'Taxa Fiscalização Oferta' },
        { key: 'taxa_anbima_upfront', papel: 'Taxa ANBIMA' },
      ];

      const recorrenteFields = [
        { key: 'fee_agente_fiduciario_recorrente', papel: 'Agente Fiduciário' },
        { key: 'fee_securitizadora_recorrente', papel: 'Securitizadora' },
        { key: 'fee_custodiante_lastro_recorrente', papel: 'Custodiante Lastro' },
        { key: 'fee_liquidante_recorrente', papel: 'Liquidante' },
        { key: 'fee_escriturador_recorrente', papel: 'Escriturador' },
        { key: 'fee_servicer_recorrente', papel: 'Servicer' },
        { key: 'fee_escriturador_nc_recorrente', papel: 'Escriturador NC' },
        { key: 'fee_gerenciador_obra_recorrente', papel: 'Gerenciador de Obra' },
        { key: 'fee_auditoria_recorrente', papel: 'Auditoria' },
        { key: 'fee_contabilidade_recorrente', papel: 'Contabilidade' },
      ];

      upfrontFields.forEach(({ key, papel }) => {
        const valor = (custos as Record<string, unknown>)[key] as number | null;
        if (valor && valor > 0) {
          upfront.push({
            id: key,
            prestador: papel,
            papel,
            valor,
            grossUp: 0,
            valorBruto: valor,
            tipo: 'auto',
          });
        }
      });

      recorrenteFields.forEach(({ key, papel }) => {
        const valor = (custos as Record<string, unknown>)[key] as number | null;
        if (valor && valor > 0) {
          anual.push({
            id: key,
            prestador: papel,
            papel,
            valor,
            grossUp: 0,
            valorBruto: valor,
            tipo: 'auto',
          });
        }
      });

      setCostsData({ upfront, anual, mensal: [] });
    }
  }, [custosLinhas, custos]);

  const handleSectionChange = (type: CostType, items: CostItem[]) => {
    setCostsData((prev) => ({ ...prev, [type]: items }));
    // TODO: Salvar alterações no banco de dados
  };

  if (isLoadingCustos || isLoadingLinhas) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const totalUpfront = costsData.upfront.reduce((sum, item) => sum + item.valorBruto, 0);
  const totalAnual = costsData.anual.reduce((sum, item) => sum + item.valorBruto, 0);
  const totalMensal = costsData.mensal.reduce((sum, item) => sum + item.valorBruto, 0);

  const custoPrimeiroAno = totalUpfront + totalAnual + (totalMensal * 12);
  const custoAnosSubsequentes = totalAnual + (totalMensal * 12);

  const percentualVolume = volume > 0 ? ((custoPrimeiroAno / volume) * 100).toFixed(2) : '0.00';

  const hasCosts = costsData.upfront.length > 0 || costsData.anual.length > 0 || costsData.mensal.length > 0;

  return (
    <div className="space-y-6">
      {!hasCosts && (
        <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-900/10">
          <CardContent className="py-6">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Nenhum custo encontrado para esta emissão</p>
                <p className="text-sm text-muted-foreground">
                  Você pode adicionar custos manualmente nas seções abaixo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <CostSection
        type="upfront"
        items={costsData.upfront}
        onChange={(items) => handleSectionChange('upfront', items)}
      />

      <CostSection
        type="anual"
        items={costsData.anual}
        onChange={(items) => handleSectionChange('anual', items)}
      />

      <CostSection
        type="mensal"
        items={costsData.mensal}
        onChange={(items) => handleSectionChange('mensal', items)}
      />

      {/* Summary Card */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">CUSTO TOTAL DA OPERAÇÃO</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-lg p-4 shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">Primeiro Ano</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(custoPrimeiroAno)}</p>
            </div>
            <div className="bg-card rounded-lg p-4 shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">Anos Subsequentes</p>
              <p className="text-2xl font-bold">{formatCurrency(custoAnosSubsequentes)}</p>
              <p className="text-xs text-muted-foreground">/ano</p>
            </div>
            <div className="bg-card rounded-lg p-4 shadow-sm">
              <p className="text-sm text-muted-foreground mb-1">% do Volume</p>
              <p className="text-2xl font-bold text-amber-600">{percentualVolume}%</p>
              <p className="text-xs text-muted-foreground">Volume: {formatCurrency(volume)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
