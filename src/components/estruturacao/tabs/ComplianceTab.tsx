import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle, Clock, XCircle, Plus, Trash2, Building2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  useComplianceChecks,
  useCreateComplianceCheck,
  useUpdateComplianceStatus,
  useDeleteComplianceCheck,
  useOperacaoComplianceCompleto,
} from '@/hooks/useCompliance';
import { toast } from 'sonner';

interface ComplianceTabProps {
  operacaoId: string;
  emissaoComercialId?: string;
  isComplianceUser?: boolean; // TODO: verificar permissão real do usuário
}

const statusConfig = {
  pendente: { label: 'Pendente', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  em_analise: { label: 'Em Análise', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: AlertCircle },
  aprovado: { label: 'Aprovado', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
  reprovado: { label: 'Reprovado', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
};

const tipoEntidadeOptions = [
  { value: 'emitente', label: 'Emitente' },
  { value: 'garantidor', label: 'Garantidor' },
  { value: 'devedor', label: 'Devedor' },
  { value: 'avalista', label: 'Avalista' },
  { value: 'outro', label: 'Outro' },
];

export function ComplianceTab({ operacaoId, emissaoComercialId, isComplianceUser = false }: ComplianceTabProps) {
  const { data: checks, isLoading } = useComplianceChecks(operacaoId);
  const { data: isCompleto } = useOperacaoComplianceCompleto(operacaoId);
  const createCheck = useCreateComplianceCheck();
  const updateStatus = useUpdateComplianceStatus();
  const deleteCheck = useDeleteComplianceCheck();

  // Buscar CNPJ principal da emissão (do Comercial)
  const { data: emissaoMeta } = useQuery({
    queryKey: ['emissao-cnpj', emissaoComercialId],
    queryFn: async () => {
      if (!emissaoComercialId) return null;
      const { data, error } = await supabase
        .from('emissoes')
        .select('empresa_cnpj, empresa_razao_social')
        .eq('id', emissaoComercialId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!emissaoComercialId,
  });

  const [novoCnpj, setNovoCnpj] = useState('');
  const [novoTipo, setNovoTipo] = useState('outro');
  const [novoNome, setNovoNome] = useState('');

  const handleAdicionarCnpj = async () => {
    if (!novoCnpj.trim()) {
      toast.error('Informe o CNPJ');
      return;
    }
    // Validação básica de CNPJ (14 dígitos)
    const cnpjLimpo = novoCnpj.replace(/\D/g, '');
    if (cnpjLimpo.length !== 14) {
      toast.error('CNPJ inválido (deve ter 14 dígitos)');
      return;
    }

    try {
      await createCheck.mutateAsync({
        operacao_id: operacaoId,
        cnpj: cnpjLimpo,
        tipo_entidade: novoTipo,
        nome_entidade: novoNome.trim() || null,
      });
      toast.success('CNPJ adicionado para compliance');
      setNovoCnpj('');
      setNovoNome('');
      setNovoTipo('outro');
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao adicionar CNPJ');
    }
  };

  const handleAlterarStatus = async (checkId: string, novoStatus: string) => {
    try {
      await updateStatus.mutateAsync({
        id: checkId,
        operacao_id: operacaoId,
        status: novoStatus as any,
      });
      toast.success('Status atualizado');
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao atualizar status');
    }
  };

  const handleRemover = async (checkId: string) => {
    if (!confirm('Remover este CNPJ do compliance?')) return;
    try {
      await deleteCheck.mutateAsync({ id: checkId, operacao_id: operacaoId });
      toast.success('CNPJ removido');
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao remover');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Geral */}
      <Card className={isCompleto ? 'border-green-500' : 'border-amber-500'}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            {isCompleto ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-600" />
            )}
            <CardTitle className="text-base">
              Compliance {isCompleto ? 'Completo' : 'Pendente'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {isCompleto
              ? 'Todos os CNPJs foram verificados e aprovados.'
              : 'Existem CNPJs pendentes de verificação.'}
          </p>
          <div className="mt-3 flex gap-2 text-xs">
            <Badge variant="outline">
              {checks?.length || 0} total
            </Badge>
            <Badge variant="outline" className="text-green-600">
              {checks?.filter(c => c.status === 'aprovado').length || 0} aprovados
            </Badge>
            <Badge variant="outline" className="text-amber-600">
              {checks?.filter(c => c.status === 'pendente').length || 0} pendentes
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* CNPJ Principal (do Comercial) */}
      {emissaoMeta?.empresa_cnpj && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">CNPJ Principal (do Comercial)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{emissaoMeta.empresa_cnpj}</p>
                {emissaoMeta.empresa_razao_social && (
                  <p className="text-sm text-muted-foreground">{emissaoMeta.empresa_razao_social}</p>
                )}
              </div>
              {/* Verificar se já existe check para este CNPJ */}
              {checks?.some(c => c.cnpj === emissaoMeta.empresa_cnpj) ? (
                <Badge variant="outline" className="text-green-600">Já adicionado</Badge>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setNovoCnpj(emissaoMeta.empresa_cnpj!);
                    setNovoTipo('emitente');
                    setNovoNome(emissaoMeta.empresa_razao_social || '');
                  }}
                >
                  Adicionar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Lista de CNPJs para Compliance */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">CNPJs em Verificação</h3>
        
        {checks?.length === 0 ? (
          <Card className="bg-muted/50">
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              Nenhum CNPJ adicionado para compliance.
              <br />
              Adicione o CNPJ principal ou outros envolvidos na operação.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {checks?.map((check) => {
              const status = statusConfig[check.status];
              const StatusIcon = status.icon;
              
              return (
                <Card key={check.id} className={check.status === 'reprovado' ? 'border-red-200' : ''}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{check.cnpj}</span>
                          <Badge className={status.color} variant="outline">
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          <p>Tipo: {tipoEntidadeOptions.find(t => t.value === check.tipo_entidade)?.label}</p>
                          {check.nome_entidade && <p>{check.nome_entidade}</p>}
                          {check.observacoes && (
                            <p className="text-amber-600">Obs: {check.observacoes}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Ações de Compliance */}
                        {isComplianceUser && (
                          <Select
                            value={check.status}
                            onValueChange={(v) => handleAlterarStatus(check.id, v)}
                          >
                            <SelectTrigger className="w-36 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pendente">Pendente</SelectItem>
                              <SelectItem value="em_analise">Em Análise</SelectItem>
                              <SelectItem value="aprovado">Aprovado</SelectItem>
                              <SelectItem value="reprovado">Reprovado</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemover(check.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Separator />

      {/* Adicionar Novo CNPJ */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Adicionar CNPJ para Compliance</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ *</Label>
              <Input
                id="cnpj"
                placeholder="00.000.000/0000-00"
                value={novoCnpj}
                onChange={(e) => setNovoCnpj(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Entidade *</Label>
              <Select value={novoTipo} onValueChange={setNovoTipo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tipoEntidadeOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nome">Nome/Razão Social (opcional)</Label>
            <Input
              id="nome"
              placeholder="Nome da entidade"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleAdicionarCnpj}
            disabled={createCheck.isPending}
            className="w-full sm:w-auto"
          >
            {createCheck.isPending ? 'Adicionando...' : 'Adicionar CNPJ'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
