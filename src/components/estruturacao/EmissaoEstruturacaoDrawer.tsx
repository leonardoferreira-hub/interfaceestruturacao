import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Users,
  TrendingUp,
  Calendar,
  Building2,
  Banknote
} from 'lucide-react';
import type { EmissaoDB } from '@/types/database';
import { DocumentosTab } from './tabs/DocumentosTab';
import { InvestidoresTab } from './tabs/InvestidoresTab';
import { FluxoCaixaTab } from './tabs/FluxoCaixaTab';
import { EventosTab } from './tabs/EventosTab';
import { InformacoesTab } from './tabs/InformacoesTab';
import { SeriesTab } from './tabs/SeriesTab';
import { DespesasTab } from './tabs/DespesasTab';
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
      <SheetContent className="w-full sm:max-w-3xl lg:max-w-5xl p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-start justify-between"
          >
            <div>
              <SheetTitle className="text-xl">
                {emissao.nome_operacao || emissao.numero_emissao}
              </SheetTitle>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex items-center gap-2 mt-1 text-sm text-muted-foreground"
              >
                <Building2 className="h-4 w-4" />
                <span>{emissao.empresa_razao_social || 'Empresa não informada'}</span>
              </motion.div>
            </div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.2 }}
            >
              <Badge variant="secondary">{emissao.numero_emissao}</Badge>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="flex items-center gap-4 mt-3 text-sm text-muted-foreground"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.4 }}
              className="flex items-center gap-1"
            >
              <TrendingUp className="h-4 w-4" />
              <span>{formatCurrency(emissao.volume || 0)}</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.5 }}
              className="flex items-center gap-1"
            >
              <Calendar className="h-4 w-4" />
              <span>
                {emissao.criado_em
                  ? new Date(emissao.criado_em).toLocaleDateString('pt-BR')
                  : 'Sem data'
                }
              </span>
            </motion.div>
          </motion.div>
        </SheetHeader>

        <Tabs defaultValue="informacoes" className="flex flex-col h-[calc(100vh-140px)]">
          <TabsList className="mx-6 mt-4 justify-start w-auto flex-wrap">
            <TabsTrigger value="informacoes" className="gap-2">
              <Building2 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="series" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Séries
            </TabsTrigger>
            <TabsTrigger value="despesas" className="gap-2">
              <Banknote className="h-4 w-4" />
              Despesas
            </TabsTrigger>
            <TabsTrigger value="documentos" className="gap-2">
              <FileText className="h-4 w-4" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="investidores" className="gap-2">
              <Users className="h-4 w-4" />
              Investidores
            </TabsTrigger>
            <TabsTrigger value="eventos" className="gap-2">
              <Calendar className="h-4 w-4" />
              Cronograma
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 px-6 py-4">
            <TabsContent value="informacoes" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <InformacoesTab emissao={emissao} />
              </motion.div>
            </TabsContent>
            <TabsContent value="series" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SeriesTab idEmissao={emissao.id} />
              </motion.div>
            </TabsContent>
            <TabsContent value="despesas" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <DespesasTab idEmissao={emissao.id} />
              </motion.div>
            </TabsContent>
            <TabsContent value="documentos" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <DocumentosTab idEmissao={emissao.id} />
              </motion.div>
            </TabsContent>
            <TabsContent value="investidores" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <InvestidoresTab idEmissao={emissao.id} />
              </motion.div>
            </TabsContent>
            <TabsContent value="eventos" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <EventosTab idEmissao={emissao.id} />
              </motion.div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}