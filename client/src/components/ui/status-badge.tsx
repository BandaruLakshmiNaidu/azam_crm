// === STATUS BADGE COMPONENT ===
// Reusable status badge with consistent styling

import { Badge } from '@/components/ui/badge';
import { getStatusColor, getStatusIcon } from '@shared/utils';
import { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';

export interface StatusBadgeProps {
  status: string;
  showIcon?: boolean;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function StatusBadge({
  status,
  showIcon = true,
  variant,
  size = 'default',
  className = '',
}: StatusBadgeProps) {
  const statusColor = getStatusColor(status);
  const iconName = getStatusIcon(status);
  const Icon = Icons[iconName as keyof typeof Icons] as LucideIcon;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    default: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <Badge
      variant={variant || 'secondary'}
      className={`${statusColor} ${sizeClasses[size]} ${className} flex items-center space-x-1`}
    >
      {showIcon && Icon && <Icon className="h-3 w-3" />}
      <span className="capitalize">{status}</span>
    </Badge>
  );
}