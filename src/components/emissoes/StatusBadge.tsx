import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { StatusEmissao, STATUS_LABELS, STATUS_COLORS } from '@/types';

interface StatusBadgeProps {
  status: StatusEmissao;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge 
      variant="secondary" 
      className={cn(STATUS_COLORS[status], className)}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
