'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { auth } from '@/lib/firebase/config';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

interface SyncPaymentsButtonProps {
  onSyncComplete?: (results: SyncResults) => void;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

interface SyncResults {
  total: number;
  synced: number;
  updated: number;
  noPayment: number;
  errors: number;
}

interface SyncStatus {
  lastSyncAt: string | null;
  syncedBy: string | null;
  results: SyncResults | null;
}

export function SyncPaymentsButton({
  onSyncComplete,
  className,
  variant = 'outline',
  size = 'default',
}: SyncPaymentsButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<boolean | null>(null);

  // Fetch last sync status on mount
  useEffect(() => {
    fetchLastSyncStatus();
  }, []);

  const fetchLastSyncStatus = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await fetch('/api/invoices/sync-all-payments', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const { data } = await response.json();
        if (data.lastSyncAt) {
          setLastSync(new Date(data.lastSyncAt));
        }
      }
    } catch (error) {
      console.error('Error fetching sync status:', error);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncSuccess(null);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Niet ingelogd');
      }

      const token = await currentUser.getIdToken();
      const response = await fetch('/api/invoices/sync-all-payments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sync mislukt');
      }

      const { data } = await response.json();
      const results = data as { total: number; synced: number; updated: number; noPayment: number; errors: number };

      setLastSync(new Date());
      setSyncSuccess(true);

      // Show appropriate toast message
      if (results.updated > 0) {
        toast.success(
          `Sync voltooid! ${results.updated} factuur${results.updated > 1 ? 'en' : ''} bijgewerkt naar betaald.`
        );
      } else if (results.synced > 0) {
        toast.success(`Sync voltooid! ${results.synced} factuur${results.synced > 1 ? 'en' : ''} gecontroleerd.`);
      } else {
        toast.success('Sync voltooid. Geen openstaande facturen met Mollie betalingen gevonden.');
      }

      if (results.errors > 0) {
        toast.error(`${results.errors} factuur${results.errors > 1 ? 'en' : ''} konden niet gesynchroniseerd worden.`);
      }

      onSyncComplete?.(results);

      // Reset success state after animation
      setTimeout(() => setSyncSuccess(null), 2000);
    } catch (error) {
      console.error('Error syncing payments:', error);
      setSyncSuccess(false);
      toast.error(error instanceof Error ? error.message : 'Kon betalingen niet synchroniseren');

      // Reset error state after animation
      setTimeout(() => setSyncSuccess(null), 2000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant={variant}
        size={size}
        onClick={handleSync}
        disabled={isSyncing}
        className={cn(
          'border-white/20 text-white hover:bg-white/10',
          syncSuccess === true && 'bg-green-500/20 border-green-500/50',
          syncSuccess === false && 'bg-red-500/20 border-red-500/50',
          className
        )}
      >
        {isSyncing ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Synchroniseren...
          </>
        ) : syncSuccess === true ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Gesynchroniseerd
          </>
        ) : syncSuccess === false ? (
          <>
            <AlertCircle className="w-4 h-4 mr-2" />
            Sync mislukt
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Betalingen
          </>
        )}
      </Button>
      {lastSync && (
        <span className="text-xs text-white/40">
          Laatste sync: {formatDistanceToNow(lastSync, { addSuffix: true, locale: nl })}
        </span>
      )}
    </div>
  );
}

// Single invoice sync button
interface SyncSinglePaymentButtonProps {
  invoiceId: string;
  onSyncComplete?: (result: { mollieStatus: string | null; invoiceUpdated: boolean }) => void;
  className?: string;
}

export function SyncSinglePaymentButton({
  invoiceId,
  onSyncComplete,
  className,
}: SyncSinglePaymentButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Niet ingelogd');
      }

      const token = await currentUser.getIdToken();
      const response = await fetch(`/api/invoices/${invoiceId}/sync-payment`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sync mislukt');
      }

      const { data } = await response.json();

      if (data.invoiceUpdated) {
        toast.success('Betaling status bijgewerkt!');
      } else if (data.mollieStatus) {
        toast.success(`Mollie status: ${data.mollieStatus}`);
      } else {
        toast.success('Geen Mollie betaling gevonden');
      }

      onSyncComplete?.(data);
    } catch (error) {
      console.error('Error syncing payment:', error);
      toast.error(error instanceof Error ? error.message : 'Kon betaling niet synchroniseren');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSync}
      disabled={isSyncing}
      className={cn('h-8 w-8 p-0', className)}
      title="Sync met Mollie"
    >
      <RefreshCw className={cn('w-4 h-4', isSyncing && 'animate-spin')} />
    </Button>
  );
}
