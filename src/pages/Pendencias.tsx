import { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Clock, CheckCircle2, AlertCircle, Inbox } from 'lucide-react';
import { STATUS_PENDENCIA_LABELS, StatusPendencia } from '@/types';
import { PageTransition, AnimatedCard, AnimatedListItem } from '@/components/ui/animations';
import { EmptyState } from '@/components/ui/empty-state';
import { motion } from 'framer-motion';

const COLUMNS: StatusPendencia[] = ['pendente', 'em_andamento', 'concluido'];

// Status config com contraste acessível
const statusConfig: Record<StatusPendencia, { color: string; icon: typeof Clock }> = {
  pendente: { 
    color: 'bg-amber-100 text-amber-800 border-amber-300', 
    icon: AlertCircle 
  },
  em_andamento: { 
    color: 'bg-blue-100 text-blue-800 border-blue-300', 
    icon: Clock 
  },
  concluido: { 
    color: 'bg-green-100 text-green-800 border-green-300', 
    icon: CheckCircle2 
  },
};

const Pendencias = () => {
  const [search, setSearch] = useState('');

  // TODO: Implement real pendencias hook when table is created
  const grouped: Record<StatusPendencia, { id: string; titulo: string; descricao?: string; prioridade?: 'alta' | 'media' | 'baixa' }[]> = {
    pendente: [],
    em_andamento: [],
    concluido: [],
  };

  const clearSearch = () => {
    setSearch('');
  };

  const totalPendencias = Object.values(grouped).flat().length;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container py-6 space-y-6">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Pendências</h1>
              <p className="text-muted-foreground">Acompanhe as pendências das emissões</p>
            </div>
            <Button className="w-full sm:w-auto gap-2">
              <Plus className="h-4 w-4" />
              Nova Pendência
            </Button>
          </motion.div>

          {/* Search */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative max-w-md"
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar pendências..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </motion.div>

          {/* Kanban Board */}
          {totalPendencias === 0 ? (
            <AnimatedCard>
              <EmptyState
                icon={Inbox}
                title="Nenhuma pendência encontrada"
                description="Não há pendências cadastradas no sistema."
                action={{ label: 'Criar primeira pendência', onClick: () => {} }}
              />
            </AnimatedCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {COLUMNS.map((status, colIndex) => {
                const config = statusConfig[status];
                const items = grouped[status];
                const Icon = config.icon;

                return (
                  <AnimatedCard key={status} index={colIndex}>
                    <div className="space-y-3">
                      {/* Column Header */}
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <h3 className="font-semibold text-sm">{STATUS_PENDENCIA_LABELS[status]}</h3>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`${config.color} font-medium`}
                        >
                          {items.length}
                        </Badge>
                      </div>

                      {/* Column Content */}
                      <div className="space-y-3 min-h-[200px] bg-muted/20 rounded-lg p-3">
                        {items.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Inbox className="h-8 w-8 text-muted-foreground/50 mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Nenhuma pendência
                            </p>
                          </div>
                        ) : (
                          items.map((item, itemIndex) => (
                            <AnimatedListItem key={item.id} index={itemIndex}>
                              <Card className="cursor-pointer hover:shadow-md transition-shadow group">
                                <CardContent className="p-4">
                                  <h4 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
                                    {item.titulo}
                                  </h4>
                                  {item.descricao && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                      {item.descricao}
                                    </p>
                                  )}
                                  {item.prioridade && (
                                    <Badge 
                                      variant="outline" 
                                      className={`mt-2 text-xs ${
                                        item.prioridade === 'alta' 
                                          ? 'bg-red-100 text-red-800 border-red-300' 
                                          : item.prioridade === 'media'
                                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                                          : 'bg-blue-100 text-blue-800 border-blue-300'
                                      }`}
                                    >
                                      {item.prioridade === 'alta' ? 'Alta' : item.prioridade === 'media' ? 'Média' : 'Baixa'}
                                    </Badge>
                                  )}
                                </CardContent>
                              </Card>
                            </AnimatedListItem>
                          ))
                        )}
                      </div>
                    </div>
                  </AnimatedCard>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  );
};

export default Pendencias;
