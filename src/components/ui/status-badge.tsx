import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatusConfig {
  bg: string;
  text: string;
  label: string;
}

const statusConfig: Record<string, StatusConfig> = {
  'ok': {
    bg: 'bg-green-100 dark:bg-green-900',
    text: 'text-green-800 dark:text-green-300',
    label: 'OK'
  },
  'pendente': {
    bg: 'bg-yellow-100 dark:bg-yellow-900',
    text: 'text-yellow-800 dark:text-yellow-300',
    label: 'Pendente'
  },
  'nok': {
    bg: 'bg-red-100 dark:bg-red-900',
    text: 'text-red-800 dark:text-red-300',
    label: 'NOK'
  },
  'em_analise': {
    bg: 'bg-blue-100 dark:bg-blue-900',
    text: 'text-blue-800 dark:text-blue-300',
    label: 'Em Análise'
  },
  'aprovado': {
    bg: 'bg-green-100 dark:bg-green-900',
    text: 'text-green-800 dark:text-green-300',
    label: 'Aprovado'
  },
  'reprovado': {
    bg: 'bg-red-100 dark:bg-red-900',
    text: 'text-red-800 dark:text-red-300',
    label: 'Reprovado'
  },
  'Em Estruturação': {
    bg: 'bg-blue-100 dark:bg-blue-900',
    text: 'text-blue-800 dark:text-blue-300',
    label: 'Em Estruturação'
  },
  'Liquidada': {
    bg: 'bg-green-100 dark:bg-green-900',
    text: 'text-green-800 dark:text-green-300',
    label: 'Liquidada'
  },
  'On Hold': {
    bg: 'bg-yellow-100 dark:bg-yellow-900',
    text: 'text-yellow-800 dark:text-yellow-300',
    label: 'On Hold'
  },
  'Abortada': {
    bg: 'bg-red-100 dark:bg-red-900',
    text: 'text-red-800 dark:text-red-300',
    label: 'Abortada'
  },
  'Finalizada': {
    bg: 'bg-slate-100 dark:bg-slate-900',
    text: 'text-slate-800 dark:text-slate-300',
    label: 'Finalizada'
  }
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status] || statusConfig['pendente'];

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.bg,
        config.text,
        className
      )}
    >
      {config.label}
    </motion.span>
  );
};
