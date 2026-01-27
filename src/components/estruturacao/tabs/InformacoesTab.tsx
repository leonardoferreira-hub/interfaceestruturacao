import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useDadosEstruturacao, useUpdateCampoEstruturacao } from '@/hooks/useDadosEstruturacao';
import { useUpdateOperacao } from '@/hooks/useUpdateOperacao';
import { useOperacao } from '@/hooks/useOperacoesEstruturacao';
import { useUsuarios } from '@/hooks/useUsuarios';
import { useCategorias, useVeiculos, useLastros, useTiposOferta } from '@/hooks/useLookups';
import { formatCurrency } from '@/utils/formatters';
import type { EmissaoDB } from '@/types/database';
import type { StatusOkNok, StatusBoletagem } from '@/types/dados-estruturacao';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import {
  EditableTextField,
  EditableDateField,
  StatusOkNokField,
  StatusBoletagemField,
  UserSelectField,
  BooleanField,
} from '../EditableFields';

interface InformacoesTabProps {
  emissao: EmissaoDB;
}

export function InformacoesTab({ emissao }: InformacoesTabProps) {
  // Para campos da OPERAÇÃO, precisamos do registro mais atual (selectedEmissao fica stale no state)
  const { data: operacaoAtual } = useOperacao(emissao.id);
  const operacao = (operacaoAtual || emissao) as any;

  const { data: dadosEstruturacao, isLoading: loadingDados } = useDadosEstruturacao(operacao.id_emissao_comercial || emissao.id);
  const { updateCampo } = useUpdateCampoEstruturacao();
  const updateOperacao = useUpdateOperacao();
  
  const { data: usuarios = [] } = useUsuarios();
  const { data: categorias = [] } = useCategorias();
  const { data: veiculos = [] } = useVeiculos();
  const { data: lastros = [] } = useLastros();
  const { data: tiposOferta = [] } = useTiposOferta();

  // Handlers para campos de estruturação
  const handleUpdateEstruturacao = async (campo: string, valor: unknown) => {
    const idEmissao = operacao.id_emissao_comercial || emissao.id;
    try {
      await updateCampo(idEmissao, campo, valor);
      toast.success('Salvo');
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao salvar');
    }
  };

  // Handler para campos da operação (tabela estruturacao.operacoes)
  const handleUpdateOperacao = async (campo: string, valor: unknown) => {
    try {
      await updateOperacao.mutateAsync({ id: emissao.id, dados: { [campo]: valor } as any });
      toast.success('Salvo');
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao salvar');
    }
  };

  if (loadingDados) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isMajoracao = (operacao.volume || 0) > 50000000;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        {/* GESTÃO */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold tracking-tight">Gestão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(() => {
              const PMO_ORDER = ['Leonardo', 'Lucas', 'Ronaldo', 'Beatriz', 'Eduarda'];
              const pmos = PMO_ORDER
                .map((n) => {
                  const needle = n.toLowerCase();
                  return usuarios.find((u) => (u.nome_completo || '').trim().toLowerCase() === needle);
                })
                .filter(Boolean) as typeof usuarios;

              // Se a base ainda não tem os PMOs cadastrados (ou nomes diferentes), não deixa o select vazio.
              const pmosFallback = pmos.length > 0 ? pmos : usuarios;

              return (
                <UserSelectField
                  label="PMO"
                  value={dadosEstruturacao?.pmo_id}
                  usuarios={pmosFallback}
                  onSave={(v) => handleUpdateEstruturacao('pmo_id', v)}
                  placeholder="Selecionar PMO"
                />
              );
            })()}
            <UserSelectField
              label="Analista Financeiro"
              value={dadosEstruturacao?.analista_financeiro_id}
              usuarios={usuarios}
              onSave={(v) => handleUpdateEstruturacao('analista_financeiro_id', v)}
              placeholder="Selecionar Analista"
            />
            <UserSelectField
              label="Analista Contábil"
              value={dadosEstruturacao?.analista_contabil_id}
              usuarios={usuarios}
              onSave={(v) => handleUpdateEstruturacao('analista_contabil_id', v)}
              placeholder="Selecionar Analista"
            />
            <UserSelectField
              label="Analista de Gestão"
              value={dadosEstruturacao?.analista_gestao_id}
              usuarios={usuarios}
              onSave={(v) => handleUpdateEstruturacao('analista_gestao_id', v)}
              placeholder="Selecionar Analista"
            />
            </div>
          </CardContent>
        </Card>

        {/* OPERAÇÃO */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold tracking-tight">Operação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <EditableTextField
              label="Nome da Operação"
              value={operacao.nome_operacao}
              onSave={(v) => handleUpdateOperacao('nome_operacao', v)}
              placeholder="Não informado"
            />
            <EditableTextField
              label="Número da Emissão"
              value={operacao.numero_emissao}
              onSave={(v) => handleUpdateOperacao('numero_emissao', v)}
            />
            
            {/* Categoria */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Categoria</Label>
              <Select 
                value={operacao.categoria_id || '__none__'} 
                onValueChange={(v) => handleUpdateOperacao('categoria_id', v === '__none__' ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">
                    <span className="text-muted-foreground">Selecionar categoria</span>
                  </SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.codigo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Veículo */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Veículo</Label>
              <Select 
                value={operacao.veiculo_id || '__none__'} 
                onValueChange={(v) => handleUpdateOperacao('veiculo_id', v === '__none__' ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar veículo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">
                    <span className="text-muted-foreground">Selecionar veículo</span>
                  </SelectItem>
                  {veiculos.map((veic) => (
                    <SelectItem key={veic.id} value={veic.id}>
                      {veic.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lastro - apenas para CRI e CRA */}
            {(operacao.categoria_id === 'b4fe5ff5-fc0d-4407-ba2a-b322f24fba17' || 
              operacao.categoria_id === 'a884c86f-84ac-449b-843b-22744c21aa46') && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Lastro</Label>
                <Select 
                  value={operacao.lastro_id || '__none__'} 
                  onValueChange={(v) => handleUpdateOperacao('lastro_id', v === '__none__' ? null : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar lastro" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">
                      <span className="text-muted-foreground">Selecionar lastro</span>
                    </SelectItem>
                    {lastros.map((lastro) => (
                      <SelectItem key={lastro.id} value={lastro.id}>
                        {lastro.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Tipo Oferta */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Tipo Oferta</Label>
              <Select 
                value={operacao.tipo_oferta_id || '__none__'} 
                onValueChange={(v) => handleUpdateOperacao('tipo_oferta_id', v === '__none__' ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">
                    <span className="text-muted-foreground">Selecionar tipo</span>
                  </SelectItem>
                  {tiposOferta.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id}>
                      {tipo.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Volume e Majoração */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Volume</Label>
              <div className="flex items-center gap-2">
                <span className="font-medium">{formatCurrency(operacao.volume || 0)}</span>
                {isMajoracao && (
                  <Badge variant="secondary" className="text-xs">
                    Majoração
                  </Badge>
                )}
              </div>
            </div>

            <BooleanField
              label="Floating"
              value={dadosEstruturacao?.floating}
              onSave={(v) => handleUpdateEstruturacao('floating', v)}
            />
            </div>
          </CardContent>
        </Card>

        {/* DATAS E FINANCEIRO */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold tracking-tight">Datas e Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Data Entrada Pipe</Label>
              <p className="text-sm font-medium py-2">
                {dadosEstruturacao?.data_entrada_pipe 
                  ? new Date(dadosEstruturacao.data_entrada_pipe).toLocaleDateString('pt-BR')
                  : '-'
                }
              </p>
            </div>
            <EditableDateField
              label="Previsão Liquidação"
              value={dadosEstruturacao?.previsao_liquidacao}
              onSave={(v) => handleUpdateEstruturacao('previsao_liquidacao', v)}
            />
            <EditableDateField
              label="Data Liquidação"
              value={dadosEstruturacao?.data_liquidacao}
              onSave={(v) => handleUpdateEstruturacao('data_liquidacao', v)}
            />
            <EditableDateField
              label="1ª Data Pagamento"
              value={dadosEstruturacao?.primeira_data_pagamento}
              onSave={(v) => handleUpdateEstruturacao('primeira_data_pagamento', v)}
            />
            <EditableDateField
              label="Data DF"
              value={dadosEstruturacao?.data_df}
              onSave={(v) => handleUpdateEstruturacao('data_df', v)}
            />
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <EditableTextField
              label="Banco"
              value={dadosEstruturacao?.banco}
              onSave={(v) => handleUpdateEstruturacao('banco', v)}
              placeholder="Nome do banco"
            />
            <EditableTextField
              label="Agência"
              value={dadosEstruturacao?.agencia}
              onSave={(v) => handleUpdateEstruturacao('agencia', v)}
              placeholder="Número da agência"
            />
            <EditableTextField
              label="Conta Bancária"
              value={dadosEstruturacao?.conta_bancaria}
              onSave={(v) => handleUpdateEstruturacao('conta_bancaria', v)}
              placeholder="Número da conta"
            />
          </div>
        </CardContent>
      </Card>
      </div>

      <div className="space-y-6">
        {/* STATUS E CHECKLIST */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold tracking-tight">Status e Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatusOkNokField
              label="Compliance"
              value={dadosEstruturacao?.compliance as StatusOkNok}
              onSave={(v) => handleUpdateEstruturacao('compliance', v)}
            />
            <StatusBoletagemField
              label="Boletagem"
              value={dadosEstruturacao?.boletagem as StatusBoletagem}
              onSave={(v) => handleUpdateEstruturacao('boletagem', v)}
            />
            <StatusOkNokField
              label="Due Diligence"
              value={dadosEstruturacao?.due_diligence as StatusOkNok}
              onSave={(v) => handleUpdateEstruturacao('due_diligence', v)}
            />
            <StatusOkNokField
              label="Mapa Liquidação"
              value={dadosEstruturacao?.mapa_liquidacao as StatusOkNok}
              onSave={(v) => handleUpdateEstruturacao('mapa_liquidacao', v)}
            />
            <StatusOkNokField
              label="Mapa Registros"
              value={dadosEstruturacao?.mapa_registros as StatusOkNok}
              onSave={(v) => handleUpdateEstruturacao('mapa_registros', v)}
            />
            <StatusOkNokField
              label="LO"
              value={dadosEstruturacao?.lo_status as StatusOkNok}
              onSave={(v) => handleUpdateEstruturacao('lo_status', v)}
            />
            <StatusOkNokField
              label="Kick Off"
              value={dadosEstruturacao?.kick_off as StatusOkNok}
              onSave={(v) => handleUpdateEstruturacao('kick_off', v)}
            />
            <StatusOkNokField
              label="Envio E-mail Prestadores"
              value={dadosEstruturacao?.envio_email_prestadores as StatusOkNok}
              onSave={(v) => handleUpdateEstruturacao('envio_email_prestadores', v)}
            />
            <StatusOkNokField
              label="Passagem Bastão"
              value={dadosEstruturacao?.passagem_bastao as StatusOkNok}
              onSave={(v) => handleUpdateEstruturacao('passagem_bastao', v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* OBSERVAÇÕES */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold tracking-tight">Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">
              Notas rápidas por categoria (estilo Notion)
            </div>

            {/* Tabs internas para reduzir altura e ficar mais "produto" */}
            <div className="overflow-x-auto">
              <div className="min-w-max">
                <Tabs defaultValue="proximos">
                  <TabsList className="w-auto justify-start">
                    <TabsTrigger value="proximos">Próximos</TabsTrigger>
                    <TabsTrigger value="alertas">Alertas</TabsTrigger>
                    <TabsTrigger value="tech">Tech</TabsTrigger>
                    <TabsTrigger value="resumo">Resumo</TabsTrigger>
                    <TabsTrigger value="investidores">Investidores</TabsTrigger>
                  </TabsList>

                  <TabsContent value="proximos" className="mt-4">
                    <EditableTextField
                      label="Próximos Passos"
                      value={dadosEstruturacao?.proximos_passos}
                      onSave={(v) => handleUpdateEstruturacao('proximos_passos', v)}
                      placeholder="Descreva os próximos passos..."
                      multiline
                    />
                  </TabsContent>

                  <TabsContent value="alertas" className="mt-4">
                    <EditableTextField
                      label="Alertas"
                      value={dadosEstruturacao?.alertas}
                      onSave={(v) => handleUpdateEstruturacao('alertas', v)}
                      placeholder="Registre alertas importantes..."
                      multiline
                    />
                  </TabsContent>

                  <TabsContent value="tech" className="mt-4">
                    <EditableTextField
                      label="Status Tech"
                      value={dadosEstruturacao?.status_tech}
                      onSave={(v) => handleUpdateEstruturacao('status_tech', v)}
                      placeholder="Status técnico da operação..."
                      multiline
                    />
                  </TabsContent>

                  <TabsContent value="resumo" className="mt-4">
                    <EditableTextField
                      label="Resumo"
                      value={dadosEstruturacao?.resumo}
                      onSave={(v) => handleUpdateEstruturacao('resumo', v)}
                      placeholder="Resumo da operação..."
                      multiline
                    />
                  </TabsContent>

                  <TabsContent value="investidores" className="mt-4">
                    <EditableTextField
                      label="Observações Investidores"
                      value={dadosEstruturacao?.investidores_obs}
                      onSave={(v) => handleUpdateEstruturacao('investidores_obs', v)}
                      placeholder="Observações sobre investidores..."
                      multiline
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HISTÓRICO */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold tracking-tight">Histórico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-xs text-muted-foreground">Criado em</Label>
              <p className="font-medium">
                {emissao.criado_em 
                  ? new Date(emissao.criado_em).toLocaleString('pt-BR')
                  : '-'
                }
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Atualizado em</Label>
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
    </div>
  );
}
