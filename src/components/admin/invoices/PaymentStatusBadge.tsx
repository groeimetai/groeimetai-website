'use client';

import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Ban,
  Timer,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type MolliePaymentStatus =
  | 'open'
  | 'pending'
  | 'authorized'
  | 'paid'
  | 'failed'
  | 'canceled'
  | 'expired'
  | null
  | undefined;

interface PaymentStatusBadgeProps {
  status: MolliePaymentStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig: Record<
  string,
  {
    label: string;
    color: string;
    bgColor: string;
    icon: typeof CheckCircle;
  }
> = {
  open: {
    label: 'Openstaand',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/20',
    icon: Clock,
  },
  pending: {
    label: 'In behandeling',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/20',
    icon: Timer,
  },
  authorized: {
    label: 'Geautoriseerd',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/20',
    icon: CheckCircle,
  },
  paid: {
    label: 'Betaald',
    color: 'text-green-500',
    bgColor: 'bg-green-500/20',
    icon: CheckCircle,
  },
  failed: {
    label: 'Mislukt',
    color: 'text-red-500',
    bgColor: 'bg-red-500/20',
    icon: XCircle,
  },
  canceled: {
    label: 'Geannuleerd',
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/20',
    icon: Ban,
  },
  expired: {
    label: 'Verlopen',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/20',
    icon: AlertCircle,
  },
  unknown: {
    label: 'Onbekend',
    color: 'text-gray-400',
    bgColor: 'bg-gray-400/20',
    icon: HelpCircle,
  },
};

export function PaymentStatusBadge({
  status,
  showIcon = true,
  size = 'md',
  className,
}: PaymentStatusBadgeProps) {
  const config = statusConfig[status || 'unknown'] || statusConfig.unknown;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  if (!status) {
    return (
      <Badge
        variant="outline"
        className={cn(
          'border-0 text-gray-400 bg-gray-400/10',
          sizeClasses[size],
          className
        )}
      >
        {showIcon && <HelpCircle className={cn(iconSizes[size], 'mr-1')} />}
        Geen Mollie
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'border-0',
        config.color,
        config.bgColor,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={cn(iconSizes[size], 'mr-1')} />}
      {config.label}
    </Badge>
  );
}

export function getPaymentStatusInfo(status: MolliePaymentStatus) {
  return statusConfig[status || 'unknown'] || statusConfig.unknown;
}
