import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Loader2,
  User,
  Building2,
  Users2,
  Link2,
  Copy,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Status config
const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pendente_cadastro: { 
    label: 'Pendente Cadastro', 
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: Clock
  },
  em_analise: { 
    label: 'Em Análise', 
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Clock
  },
  aprovado: { 
    label: 'Aprovado', 
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle
  },
  reprovado: { 
    label: 'Reprovado', 
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle
  },
  integralizado: { 
    label: 'Integralizado', 
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: CheckCircle
  },
  pronto_para_integralizar: { 
    label: 'Pronto p/ Integralizar', 
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: CheckCircle
  },
  cadastro_vencido: { 
    label: 'Cadastro Vencido', 
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: AlertCircle
  },
};

const tipoConfig: Record<string, { label: string; icon: any }> = {
  pessoa_fisica: { label: 'Pessoa Física', icon: User },
  pessoa_juridica: { label: 'Pessoa Jurídica', icon: Building2 },
  institucional: { label: 'Institucional', icon: Users2 },
};

interface InvestidorEmissao {
  id: string;
  cnpj_cpf: string;
  nome: string;
  tipo: 'pessoa_fisica' | 'pessoa_juridica' | 'institucional';
  status: string;
  status_efetivo: string;
  cadastro_valido: boolean;
  cadastro_valido_ate: string;
  valor_integralizacao: number;
  usou_cadastro_existente: boolean;
}

interface InvestidoresTabProps {
  idEmissao: string;
  numeroEmissao?: string;
}

// Hook para buscar investidores da emissão no compliance
function useInvestidoresEmissao(emissaoId: string | undefined) {
  return useQuery({
    queryKey: ['investidores-emissao', emissaoId],
    queryFn: async () => {
      if (!emissaoId) return [];
      
      const { data, error } = await supabase.rpc('get_investidores_emissao', {
        p_emissao_id: emissaoId
      });
      
      if (error) {
        console.error('Erro ao buscar investidores:', error);
        throw new Error('Erro ao buscar investidores: ' + error.message);
      }
      
      return (data || []) as InvestidorEmissao[];
    },
    enabled: !!emissaoId,
    refetchInterval: 5000, // Atualiza a cada 5 segundos
  });
}

export function InvestidoresTab({ idEmissao, numeroEmissao }: InvestidoresTabProps) {
  const [linkGerado, setLinkGerado] = useState<string>('');
  const [gerandoLink, setGerandoLink] = useState(false);
  
  const { data: investidores, isLoading } = useInvestidoresEmissao(idEmissao);

  const gerarLink = async () => {
    setGerandoLink(true);
    try {
      const baseUrl = import.meta.env.VITE_COMPLIANCE_URL || 'https://interfacecompliance.lovable.app';
      const link = `${baseUrl}/cadastro-investidores/${idEmissao}`;
      setLinkGerado(link);
      
      // Pequeno delay para garantir que o estado foi atualizado
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Tentar copiar com múltiplos fallbacks
      let copiado = false;
      
      // Método 1: Clipboard API moderna
      if (!copiado && navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(link);
          copiado = true;
          console.log('✅ Copiado via Clipboard API');
        } catch (err) {
          console.log('❌ Clipboard API falhou:', err);
        }
      }
      
      // Método 2: execCommand com textarea
      if (!copiado) {
        try {
          const textArea = document.createElement('textarea');
          textArea.value = link;
          textArea.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          const resultado = document.execCommand('copy');
          document.body.removeChild(textArea);
          if (resultado) {
            copiado = true;
            console.log('✅ Copiado via execCommand');
          }
        } catch (err) {
          console.log('❌ execCommand falhou:', err);
        }
      }
      
      // Método 3: Selecionar e copiar o texto do input
      if (!copiado) {
        try {
          // Criar um input temporário visível
          const input = document.createElement('input');
          input.type = 'text';
          input.value = link;
          input.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:300px;padding:10px;z-index:9999;border:2px solid #3b82f6;border-radius:8px;font-size:14px;';
          input.readOnly = true;
          document.body.appendChild(input);
          input.select();
          input.setSelectionRange(0, 99999); // Para mobile
          const resultado = document.execCommand('copy');
          document.body.removeChild(input);
          if (resultado) {
            copiado = true;
            console.log('✅ Copiado via input visível');
          }
        } catch (err) {
          console.log('❌ Input visível falhou:', err);
        }
      }
      
      if (copiado) {
        toast.success('✅ Link copiado! Cole no WhatsApp/email do cliente.');
      } else {
        toast.warning('⚠️ Não foi possível copiar automaticamente. Selecione e copie manualmente.');
        // Mostrar o input para cópia manual
        const input = document.createElement('input');
        input.type = 'text';
        input.value = link;
        input.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:80%;max-width:400px;padding:15px;z-index:9999;border:2px solid #3b82f6;border-radius:8px;font-size:16px;box-shadow:0 10px 40px rgba(0,0,0,0.3);';
        input.readOnly = true;
        input.onclick = () => {
          input.select();
          toast.info('Link selecionado! Use Ctrl+C para copiar.');
        };
        document.body.appendChild(input);
        input.select();
        
        // Remover após 10 segundos ou clique fora
        const remover = () => {
          if (document.body.contains(input)) {
            document.body.removeChild(input);
          }
          document.removeEventListener('click', remover);
        };
        setTimeout(remover, 10000);
        document.addEventListener('click', remover);
      }
    } catch (err) {
      toast.error('Erro ao gerar link');
    } finally {
      setGerandoLink(false);
    }
  };

  const copiarLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(linkGerado);
        toast.success('Link copiado!');
      } else {
        // Fallback para HTTP ou contextos sem clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = linkGerado;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success('Link copiado!');
      }
    } catch (err) {
      toast.error('Não foi possível copiar. Selecione e copie manualmente.');
    }
  };

  const prontosParaIntegralizar = investidores?.filter(
    (i) => i.status_efetivo === 'pronto_para_integralizar' || i.status === 'aprovado'
  ).length || 0;

  const totalPendentes = investidores?.filter(
    (i) => i.status === 'pendente_cadastro'
  ).length || 0;

  const totalEmAnalise = investidores?.filter(
    (i) => i.status === 'em_analise'
  ).length || 0;

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com botão de gerar link */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Cadastro de Investidores
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Envie o link para o cliente cadastrar os investidores. 
                Cada um passará pelo compliance (KYC + documentos).
              </p>
            </div>
            {!linkGerado ? (
              <Button 
                size="sm" 
                onClick={gerarLink}
                disabled={gerandoLink}
                className="shrink-0"
              >
                {gerandoLink ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Link2 className="h-4 w-4 mr-2" />
                )}
                Gerar Link
              </Button>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={copiarLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setLinkGerado('')}>
                  Novo
                </Button>
              </div>
            )}
          </div>
          
          {linkGerado && (
            <div className="mt-3 p-2 bg-white rounded border text-sm break-all font-mono">
              {linkGerado}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status summary */}
      {investidores && investidores.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          <Card className="bg-slate-50">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{investidores.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className="bg-emerald-50">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-emerald-700">{prontosParaIntegralizar}</p>
              <p className="text-xs text-emerald-600">Aprovados</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-blue-700">{totalEmAnalise}</p>
              <p className="text-xs text-blue-600">Em Análise</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-50">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-amber-700">{totalPendentes}</p>
              <p className="text-xs text-amber-600">Pendentes</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de investidores */}
      {!investidores || investidores.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum investidor cadastrado.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Gere o link acima e envie para o cliente.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {investidores.map((investidor) => {
            const statusKey = investidor.status_efetivo || investidor.status || 'pendente_cadastro';
            const status = statusConfig[statusKey] || statusConfig.pendente_cadastro;
            const StatusIcon = status.icon;
            const TipoIcon = tipoConfig[investidor.tipo]?.icon || User;
            
            return (
              <Card key={investidor.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <TipoIcon className="h-4 w-4 text-slate-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{investidor.nome || 'Investidor'}</p>
                          {investidor.usou_cadastro_existente && (
                            <Badge variant="outline" className="text-xs bg-slate-100">
                              Cadastro Existente
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          CNPJ/CPF: {investidor.cnpj_cpf}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {tipoConfig[investidor.tipo]?.label}
                        </p>
                        {investidor.valor_integralizacao > 0 && (
                          <p className="text-sm font-medium mt-1 text-slate-700">
                            Valor: R$ {investidor.valor_integralizacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge className={`${status.color} border`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                      
                      {investidor.cadastro_valido_ate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Válido até: {new Date(investidor.cadastro_valido_ate).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info box */}
      <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground">
        <p className="font-medium mb-2">Como funciona:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Gere o link e envie para o cliente</li>
          <li>O cliente cadastra os investidores (PF/PJ/Institucional)</li>
          <li>Se o CNPJ já existe e está válido, os dados são pré-carregados</li>
          <li>Cada investidor recebe email para completar KYC e documentos</li>
          <li>Compliance analisa e aprova (validade de 1 ano)</li>
          <li>Após aprovado, o investidor pode integralizar na operação</li>
        </ol>
      </div>
    </div>
  );
}
