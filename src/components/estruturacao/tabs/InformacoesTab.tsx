import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useSeries } from '@/hooks/useEmissoes';
import { formatCurrency } from '@/utils/formatters';
import type { EmissaoDB } from '@/types/database';
import { Loader2 } from 'lucide-react';

interface InformacoesTabProps {
  emissao: EmissaoDB;
}

export function InformacoesTab({ emissao }: InformacoesTabProps) {
  const { data: series, isLoading: seriesLoading } = useSeries(emissao.id);

  return (
    <div className="space-y-6">
      {/* Dados da Empresa */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados da Empresa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Razão Social</p>
              <p className="font-medium">{emissao.empresa_razao_social || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nome Fantasia</p>
              <p className="font-medium">{emissao.empresa_nome_fantasia || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CNPJ</p>
              <p className="font-medium">{emissao.empresa_cnpj || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Endereço</p>
              <p className="font-medium">{emissao.empresa_endereco || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados da Emissão */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados da Emissão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Número da Emissão</p>
              <p className="font-medium">{emissao.numero_emissao}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nome da Operação</p>
              <p className="font-medium">{emissao.nome_operacao || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Volume Total</p>
              <p className="font-medium">{formatCurrency(emissao.volume || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Oferta</p>
              <p className="font-medium">{emissao.oferta || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Versão</p>
              <p className="font-medium">{emissao.versao || 1}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium capitalize">{emissao.status || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contato */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contato</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="font-medium">{emissao.contato_nome || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">E-mail</p>
              <p className="font-medium">{emissao.contato_email || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Demandante</p>
              <p className="font-medium">{emissao.demandante_proposta || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Destinatária</p>
              <p className="font-medium">{emissao.empresa_destinataria || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Séries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Séries</CardTitle>
          <CardDescription>
            {series?.length || 0} série(s) cadastrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {seriesLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : series && series.length > 0 ? (
            <div className="space-y-4">
              {series.map((serie) => (
                <div key={serie.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Série {serie.numero}</h4>
                    <span className="text-sm font-medium">
                      {formatCurrency(serie.valor_emissao || 0)}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Prazo</p>
                      <p>{serie.prazo ? `${serie.prazo} meses` : '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Taxa de Juros</p>
                      <p>{serie.taxa_juros ? `${serie.taxa_juros}%` : '-'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Vencimento</p>
                      <p>
                        {serie.data_vencimento 
                          ? new Date(serie.data_vencimento).toLocaleDateString('pt-BR')
                          : '-'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma série cadastrada.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Timestamps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Histórico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Criado em</p>
              <p className="font-medium">
                {emissao.criado_em 
                  ? new Date(emissao.criado_em).toLocaleString('pt-BR')
                  : '-'
                }
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Atualizado em</p>
              <p className="font-medium">
                {emissao.atualizado_em 
                  ? new Date(emissao.atualizado_em).toLocaleString('pt-BR')
                  : '-'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
