import { useState, useCallback } from 'react';
import { Investidor, EmissaoComInvestidores, LinkOnboarding, StatusInvestidor } from '@/types/emissao';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const ONBOARDING_BASE_URL = 'http://100.91.53.76:8084/onboarding';

interface UseEmissaoInvestidoresReturn {
  investidores: Investidor[];
  isLoading: boolean;
  error: string | null;
  buscarInvestidores: (emissaoId: string) => Promise<void>;
  gerarLinkOnboarding: (emissaoId: string, investidorId?: string) => Promise<LinkOnboarding | null>;
  adicionarInvestidorExistente: (emissaoId: string, investidorId: string) => Promise<boolean>;
  vincularNovoInvestidor: (emissaoId: string, dadosInvestidor: Partial<Investidor>) => Promise<Investidor | null>;
}

export function useEmissaoInvestidores(): UseEmissaoInvestidoresReturn {
  const [investidores, setInvestidores] = useState<Investidor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscarInvestidores = useCallback(async (emissaoId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/emissoes/${emissaoId}/investidores`);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar investidores: ${response.statusText}`);
      }
      
      const data: EmissaoComInvestidores = await response.json();
      setInvestidores(data.investidores || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setInvestidores([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const gerarLinkOnboarding = useCallback(async (
    emissaoId: string, 
    investidorId?: string
  ): Promise<LinkOnboarding | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Gera UUID v4 para o token
      const token = crypto.randomUUID();
      
      const payload: { token: string; investidor_id?: string } = { token };
      if (investidorId) {
        payload.investidor_id = investidorId;
      }
      
      const response = await fetch(`${API_BASE_URL}/emissoes/${emissaoId}/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao gerar link: ${response.statusText}`);
      }
      
      const linkOnboarding: LinkOnboarding = {
        token,
        url: `${ONBOARDING_BASE_URL}/${token}`,
        data_geracao: new Date().toISOString(),
      };
      
      return linkOnboarding;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar link');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const adicionarInvestidorExistente = useCallback(async (
    emissaoId: string, 
    investidorId: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/emissoes/${emissaoId}/investidores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ investidor_id: investidorId }),
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao adicionar investidor: ${response.statusText}`);
      }
      
      // Recarrega a lista de investidores
      await buscarInvestidores(emissaoId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar investidor');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [buscarInvestidores]);

  const vincularNovoInvestidor = useCallback(async (
    emissaoId: string,
    dadosInvestidor: Partial<Investidor>
  ): Promise<Investidor | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/emissoes/${emissaoId}/investidores/novo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosInvestidor),
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao criar investidor: ${response.statusText}`);
      }
      
      const novoInvestidor: Investidor = await response.json();
      
      // Recarrega a lista de investidores
      await buscarInvestidores(emissaoId);
      return novoInvestidor;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar investidor');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [buscarInvestidores]);

  return {
    investidores,
    isLoading,
    error,
    buscarInvestidores,
    gerarLinkOnboarding,
    adicionarInvestidorExistente,
    vincularNovoInvestidor,
  };
}
