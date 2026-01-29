import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Calendar, DollarSign, FileText, Users } from 'lucide-react';
import { InvestidoresTab } from './InvestidoresTab';
import { EmissaoComInvestidores } from '@/types/emissao';

interface EmissaoDrawerProps {
  emissaoId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function EmissaoDrawer({ emissaoId, isOpen, onClose }: EmissaoDrawerProps) {
  const [emissao, setEmissao] = useState<EmissaoComInvestidores | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('detalhes');

  useEffect(() => {
    if (emissaoId && isOpen) {
      fetchEmissao(emissaoId);
    } else {
      setEmissao(null);
      setActiveTab('detalhes');
    }
  }, [emissaoId, isOpen]);

  const fetchEmissao = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/emissoes/${id}`);
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar emissão: ${response.statusText}`);
      }
      
      const data: EmissaoComInvestidores = await response.json();
      setEmissao(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setEmissao(null);
    } finally {
      setIsLoading(false);
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativa':
      case 'aprovada':
        return 'default';
      case 'pendente':
      case 'em_analise':
        return 'secondary';
      case 'cancelada':
      case 'reprovada':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {isLoading ? (
              <Skeleton className="h-6 w-48" />
            ) : emissao ? (
              <>Emissão {emissao.codigo}</>
            ) : (
              'Detalhes da Emissão'
            )}
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        ) : emissao ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="detalhes" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Detalhes
              </TabsTrigger>
              <TabsTrigger value="investidores" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Investidores
                {emissao.investidores && emissao.investidores.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {emissao.investidores.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="detalhes" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    Informações Gerais
                    <Badge variant={getStatusBadgeVariant(emissao.status)}>
                      {emissao.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Código
                      </label>
                      <p className="text-sm font-medium">{emissao.codigo}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Nome
                      </label>
                      <p className="text-sm font-medium">{emissao.nome}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Valor Total
                      </label>
                      <p className="text-lg font-semibold">
                        {formatarMoeda(emissao.valor_total)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Quantidade de Investidores
                      </label>
                      <p className="text-lg font-semibold">
                        {emissao.investidores?.length || 0}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Data de Emissão
                      </label>
                      <p className="text-sm">{formatarData(emissao.data_emissao)}</p>
                    </div>
                    {emissao.data_vencimento && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Data de Vencimento
                        </label>
                        <p className="text-sm">{formatarData(emissao.data_vencimento)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {emissao.investidores && emissao.investidores.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resumo de Investidores</CardTitle>
                    <CardDescription>
                      Visão geral dos investidores vinculados a esta emissão
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">Pessoa Física</p>
                        <p className="text-2xl font-bold">
                          {emissao.investidores.filter(i => i.tipo === 'PF').length}
                        </p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">Pessoa Jurídica</p>
                        <p className="text-2xl font-bold">
                          {emissao.investidores.filter(i => i.tipo === 'PJ').length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="investidores" className="mt-4">
              <InvestidoresTab emissaoId={emissaoId!} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            Selecione uma emissão para visualizar os detalhes
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
