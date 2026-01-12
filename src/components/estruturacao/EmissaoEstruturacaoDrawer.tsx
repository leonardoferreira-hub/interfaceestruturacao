import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Users, 
  TrendingUp, 
  Calendar,
  Building2
} from 'lucide-react';
import type { EmissaoDB } from '@/types/database';
import { DocumentosTab } from './tabs/DocumentosTab';
import { InvestidoresTab } from './tabs/InvestidoresTab';
import { FluxoCaixaTab } from './tabs/FluxoCaixaTab';
import { EventosTab } from './tabs/EventosTab';
import { InformacoesTab } from './tabs/InformacoesTab';
import { formatCurrency } from '@/utils/formatters';

interface EmissaoEstruturacaoDrawerProps {
  emissao: EmissaoDB | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmissaoEstruturacaoDrawer({ 
  emissao, 
  open, 
  onOpenChange 
}: EmissaoEstruturacaoDrawerProps) {
  if (!emissao) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl lg:max-w-4xl p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl">
                {emissao.nome_operacao || emissao.numero_emissao}
              </SheetTitle>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>{emissao.empresa_razao_social || 'Empresa não informada'}</span>
              </div>
            </div>
            <Badge variant="secondary">{emissao.numero_emissao}</Badge>
          </div>
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>{formatCurrency(emissao.volume || 0)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {emissao.criado_em 
                  ? new Date(emissao.criado_em).toLocaleDateString('pt-BR')
                  : 'Sem data'
                }
              </span>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="informacoes" className="flex flex-col h-[calc(100vh-140px)]">
          <TabsList className="mx-6 mt-4 justify-start w-auto">
            <TabsTrigger value="informacoes" className="gap-2">
              <Building2 className="h-4 w-4" />
              Informações
            </TabsTrigger>
            <TabsTrigger value="documentos" className="gap-2">
              <FileText className="h-4 w-4" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="investidores" className="gap-2">
              <Users className="h-4 w-4" />
              Investidores
            </TabsTrigger>
            <TabsTrigger value="fluxo" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Fluxo de Caixa
            </TabsTrigger>
            <TabsTrigger value="eventos" className="gap-2">
              <Calendar className="h-4 w-4" />
              Cronograma
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 px-6 py-4">
            <TabsContent value="informacoes" className="mt-0">
              <InformacoesTab emissao={emissao} />
            </TabsContent>
            <TabsContent value="documentos" className="mt-0">
              <DocumentosTab idEmissao={emissao.id} />
            </TabsContent>
            <TabsContent value="investidores" className="mt-0">
              <InvestidoresTab idEmissao={emissao.id} />
            </TabsContent>
            <TabsContent value="fluxo" className="mt-0">
              <FluxoCaixaTab idEmissao={emissao.id} />
            </TabsContent>
            <TabsContent value="eventos" className="mt-0">
              <EventosTab idEmissao={emissao.id} />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
