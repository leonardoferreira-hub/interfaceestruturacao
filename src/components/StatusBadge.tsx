import { StatusInvestidor } from '@/types/emissao';

interface StatusBadgeProps {
  status: StatusInvestidor;
  className?: string;
}

const statusConfig: Record<StatusInvestidor, { label: string; className: string }> = {
  pendente: {
    label: 'Pendente',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  em_analise: {
    label: 'Em Análise',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  aprovado: {
    label: 'Aprovado',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  reprovado: {
    label: 'Reprovado',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  if (!config) {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 ${className}`}>
        {status}
      </span>
    );
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className} ${className}`}>
      {config.label}
    </span>
  );
}
