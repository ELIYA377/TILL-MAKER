import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { usePortalCopy } from '../../lib/i18n';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { copy } = usePortalCopy();
  const s = status.toLowerCase();

  let label = status;
  if (s === 'submitted') label = copy.statusSubmitted;
  else if (s === 'completed') label = copy.statusCompleted;
  else if (s === 'rejected') label = copy.statusRejected;
  else if (s === 'pending') label = copy.statusPending;
  else if (s === 'success') label = copy.statusSuccess;
  else if (s === 'failed') label = copy.statusFailed;

  if (s === 'completed' || s === 'success' || s === 'successful' || s === 'active' || s === 'connected') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 whitespace-nowrap">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        <span>{label}</span>
      </span>
    );
  }
  if (s === 'rejected' || s === 'failed' || s === 'suspended' || s === 'error') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 whitespace-nowrap">
        <XCircle className="w-3.5 h-3.5 shrink-0" />
        <span>{label}</span>
      </span>
    );
  }
  if (s === 'not configured') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 whitespace-nowrap">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        <span>{label}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 whitespace-nowrap">
      <Clock className="w-3.5 h-3.5 shrink-0" />
      <span>{label}</span>
    </span>
  );
};
