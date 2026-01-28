import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle, 
  ShieldCheck,
  Building2
} from 'lucide-react';
import { useComplianceChecks, useUpdateComplianceStatus, type ComplianceCheck } from '@/hooks/useCompliance';
import { toast } from 'sonner';

interface ComplianceDrawerProps {
  operacaoId: string;
  numeroEmissao: string;
  nomeOperacao: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig = {
  pendente: { label: 'Pendente', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  em_analise: { label: 'Em Análise', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: AlertCircle },
  aprovado: { label: 'Aprovado', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
  reprovado: { label: 'Reprovado', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
};

const tipoEntidadeLabels: Record<string, string> = {
  emitente: 'Emitente',
  garantidor: 'Garantidor',
  devedor: 'Devedor',
  avalista: 'Avalista',
  outro: 'Outro',
};

export function ComplianceDrawer({
  operacaoId,
  numeroEmissao,
  nomeOperacao,
  open,
  onOpenChange,
}: ComplianceDrawerProps) {
  const { data: checks, isLoading } = useComplianceChecks(operacaoId);
  const updateStatus = useUpdateComplianceStatus();

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

  const totalChecks = checks?.length || 0;
  const aprovados = checks?.filter(c => c.status === 'aprovado').length || 0;
  const isCompleto = totalChecks > 0 && totalChecks === aprovados;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <SheetTitle className="text-lg">Verificação de Compliance</SheetTitle>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{numeroEmissao}</p>
            {nomeOperacao && <p>{nomeOperacao}</p>}
          </div>
        </SheetHeader>

        <div className="px-6 py-4 space-y-4 overflow-y-auto h-[calc(100vh-140px)]">
          {/* Status Geral */}
          <Card className={isCompleto ? 'border-green-500' : 'border-amber-500'}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                {isCompleto ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                )}
                <CardTitle className="text-sm">
                  {isCompleto ? 'Compliance Aprovado' : 'Verificação Pendente'}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {isCompleto
                  ? 'Todos os CNPJs foram verificados e aprovados.'
                  : `${totalChecks - aprovados} de ${totalChecks} CNPJs aguardando verificação.`}
              </p>
            </CardContent>
          </Card>

          {/* Lista de CNPJs */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">CNPJs para Verificação</h3>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : checks?.length === 0 ? (
              <Card className="bg-muted/50">
                <CardContent className="py-6 text-center text-sm text-muted-foreground">
                  Nenhum CNPJ pendente de verificação.
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
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{check.cnpj}</span>
                            </div>
                            <div className="text-xs text-muted-foreground space-y-0.5">
                              <p>Tipo: {tipoEntidadeLabels[check.tipo_entidade]}</p>
                              {check.nome_entidade && <p>{check.nome_entidade}</p>}
                              {check.observacoes && (
                                <p className="text-amber-600 mt-1">Obs: {check.observacoes}</p>
                              )}
                            </div>
                            <div className="mt-2">
                              <Badge className={status.color} variant="outline">
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {status.label}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="w-36">
                            <Select
                              value={check.status}
                              onValueChange={(v) => handleAlterarStatus(check.id, v)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pendente">Pendente</SelectItem>
                                <SelectItem value="em_analise">Em Análise</SelectItem>
                                <SelectItem value="aprovado">Aprovar</SelectItem>
                                <SelectItem value="reprovado">Reprovar</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
