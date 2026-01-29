import { Navigation } from '@/components/layout/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEmissoes } from '@/hooks/useEmissoes';
import { formatCurrencyCompact, formatNumber, formatPercent } from '@/utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useMemo } from 'react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard = () => {
  const { data: emissoes, isLoading } = useEmissoes();

  const metrics = useMemo(() => ({
    total_emissoes: emissoes?.length || 0,
    valor_total_emitido: emissoes?.reduce((acc, e) => acc + (e.volume || 0), 0) || 0,
    pendencias_abertas: 0,
    taxa_conclusao_sla: 0,
  }), [emissoes]);

  const tipoData = useMemo(() => {
    return (emissoes || []).reduce((acc, e) => {
      const tipo = e.categoria || 'Outros';
      const existing = acc.find(x => x.name === tipo);
      if (existing) existing.value++;
      else acc.push({ name: tipo, value: 1 });
      return acc;
    }, [] as { name: string; value: number }[]);
  }, [emissoes]);

  const statusData = useMemo(() => {
    return (emissoes || []).reduce((acc, e) => {
      const status = e.status || 'desconhecido';
      const existing = acc.find(x => x.name === status);
      if (existing) existing.value++;
      else acc.push({ name: status, value: 1 });
      return acc;
    }, [] as { name: string; value: number }[]);
  }, [emissoes]);

  // Stats memoizado para evitar recriação a cada render
  const stats = useMemo(() => [
    { label: 'Total Emissões', value: formatNumber(metrics.total_emissoes), icon: TrendingUp, color: 'text-blue-600' },
    { label: 'Valor Total', value: formatCurrencyCompact(metrics.valor_total_emitido), icon: DollarSign, color: 'text-green-600' },
    { label: 'Pendências Abertas', value: formatNumber(metrics.pendencias_abertas), icon: AlertTriangle, color: 'text-yellow-600' },
    { label: 'Taxa SLA', value: formatPercent(metrics.taxa_conclusao_sla), icon: CheckCircle, color: 'text-emerald-600' },
  ], [metrics]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container py-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral das métricas</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map(s => {
            const Icon = s.icon;
            return (
              <Card key={s.label}>
                <CardContent className="flex items-center gap-4 p-4">
                  <Icon className={`h-8 w-8 ${s.color}`} />
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="text-2xl font-bold">{s.value}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Por Tipo</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tipoData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Por Status</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
