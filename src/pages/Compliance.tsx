import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Search,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { useOperacoesCompliance, type ComplianceResumo } from '@/hooks/useCompliance';
import { EmissaoEstruturacaoDrawer } from '@/components/estruturacao/EmissaoEstruturacaoDrawer';
import { formatCurrency } from '@/utils/formatters';

const statusConfig = {
  completo: { label: 'Completo', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  pendente: { label: 'Pendente', color: 'bg-amber-100 text-amber-700', icon: Clock },
  bloqueado: { label: 'Bloqueado', color: 'bg-red-100 text-red-700', icon: XCircle },
  incompleto: { label: 'Incompleto', color: 'bg-gray-100 text-gray-700', icon: AlertCircle },
};

export default function CompliancePage() {
  const { data: operacoes, isLoading } = useOperacoesCompliance();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOperacao, setSelectedOperacao] = useState<ComplianceResumo | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredOperacoes = operacoes?.filter(op => 
    op.numero_emissao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.nome_operacao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ordenar: bloqueados primeiro, depois pendentes, depois completo
  const sortedOperacoes = filteredOperacoes?.sort((a, b) => {
    const priority = { bloqueado: 0, pendente: 1, incompleto: 2, completo: 3 };
    return priority[a.compliance_status] - priority[b.compliance_status];
  });

  const handleOpenOperacao = (operacao: ComplianceResumo) => {
    setSelectedOperacao(operacao);
    setDrawerOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Compliance</h1>
        </div>
        <p className="text-muted-foreground">
          Gerenciamento de verificações de CNPJ das operações
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operacoes?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Completo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {operacoes?.filter(o => o.compliance_status === 'completo').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600">Pendente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {operacoes?.filter(o => o.compliance_status === 'pendente').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Bloqueado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {operacoes?.filter(o => o.compliance_status === 'bloqueado').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por número ou nome da operação..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Operações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Operação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Checks</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedOperacoes?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Nenhuma operação encontrada
                  </TableCell>
                </TableRow>
              ) : (
                sortedOperacoes?.map((operacao) => {
                  const status = statusConfig[operacao.compliance_status];
                  const StatusIcon = status.icon;
                  
                  return (
                    <TableRow key={operacao.operacao_id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{operacao.numero_emissao}</p>
                          <p className="text-sm text-muted-foreground">{operacao.nome_operacao}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={status.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-0.5">
                          <span className="text-green-600">{operacao.aprovados} aprovados</span>
                          {operacao.pendentes > 0 && (
                            <>, <span className="text-amber-600">{operacao.pendentes} pendentes</span></>
                          )}
                          {operacao.em_analise > 0 && (
                            <>, <span className="text-blue-600">{operacao.em_analise} em análise</span></>
                          )}
                          {operacao.reprovados > 0 && (
                            <>, <span className="text-red-600">{operacao.reprovados} reprovados</span></>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenOperacao(operacao)}
                        >
                          Verificar
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Drawer */}
      {selectedOperacao && (
        <EmissaoEstruturacaoDrawer
          emissao={{
            id: selectedOperacao.operacao_id,
            numero_emissao: selectedOperacao.numero_emissao,
            nome_operacao: selectedOperacao.nome_operacao,
            status: selectedOperacao.operacao_status,
          } as any}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          initialTab="compliance"
        />
      )}
    </div>
  );
}
