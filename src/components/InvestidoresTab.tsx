import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Link2, Copy, Check, Loader2, UserPlus } from 'lucide-react';
import { useEmissaoInvestidores } from '@/hooks/useEmissaoInvestidores';
import { StatusBadge } from './StatusBadge';
import { Investidor, LinkOnboarding } from '@/types/emissao';

interface InvestidoresTabProps {
  emissaoId: string;
}

export function InvestidoresTab({ emissaoId }: InvestidoresTabProps) {
  const {
    investidores,
    isLoading,
    error,
    buscarInvestidores,
    gerarLinkOnboarding,
    adicionarInvestidorExistente,
  } = useEmissaoInvestidores();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [investidorSelecionado, setInvestidorSelecionado] = useState<string>('');
  const [linkGerado, setLinkGerado] = useState<LinkOnboarding | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [isGerandoLink, setIsGerandoLink] = useState(false);

  useEffect(() => {
    if (emissaoId) {
      buscarInvestidores(emissaoId);
    }
  }, [emissaoId, buscarInvestidores]);

  const handleGerarLink = async (investidorId?: string) => {
    setIsGerandoLink(true);
    const link = await gerarLinkOnboarding(emissaoId, investidorId);
    if (link) {
      setLinkGerado(link);
    }
    setIsGerandoLink(false);
  };

  const handleAdicionarExistente = async () => {
    if (!investidorSelecionado) return;
    
    const sucesso = await adicionarInvestidorExistente(emissaoId, investidorSelecionado);
    if (sucesso) {
      setIsDialogOpen(false);
      setInvestidorSelecionado('');
    }
  };

  const copiarLink = async () => {
    if (linkGerado?.url) {
      await navigator.clipboard.writeText(linkGerado.url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const formatarCnpjCpf = (valor: string) => {
    if (valor.length === 11) {
      return valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return valor.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Investidores Vinculados</CardTitle>
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Adicionar Existente
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Investidor Existente</DialogTitle>
                  <DialogDescription>
                    Selecione um investidor já cadastrado para vincular a esta emissão.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="investidor">Investidor</Label>
                    <Input
                      id="investidor"
                      placeholder="Digite o ID ou busque o investidor..."
                      value={investidorSelecionado}
                      onChange={(e) => setInvestidorSelecionado(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleAdicionarExistente}
                    disabled={!investidorSelecionado || isLoading}
                  >
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Adicionar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button size="sm" onClick={() => handleGerarLink()} disabled={isGerandoLink}>
              {isGerandoLink ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Link2 className="w-4 h-4 mr-2" />
              )}
              Gerar Link
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && investidores.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              {error}
            </div>
          ) : investidores.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum investidor vinculado a esta emissão.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CNPJ/CPF</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Razão Social</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investidores.map((investidor) => (
                  <TableRow key={investidor.id}>
                    <TableCell className="font-mono">
                      {formatarCnpjCpf(investidor.cnpj_cpf)}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        investidor.tipo === 'PF' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {investidor.tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{investidor.razao_social}</TableCell>
                    <TableCell>
                      <StatusBadge status={investidor.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleGerarLink(investidor.id)}
                        disabled={isGerandoLink}
                      >
                        <Link2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de Link Gerado */}
      {linkGerado && (
        <Dialog open={!!linkGerado} onOpenChange={() => setLinkGerado(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Link de Onboarding Gerado</DialogTitle>
              <DialogDescription>
                Compartilhe este link com o investidor para que ele complete o cadastro.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>URL do Link</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={linkGerado.url}
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copiarLink}
                  >
                    {copiado ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Token: <span className="font-mono">{linkGerado.token}</span></p>
                <p>Gerado em: {new Date(linkGerado.data_geracao).toLocaleString('pt-BR')}</p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setLinkGerado(null)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
