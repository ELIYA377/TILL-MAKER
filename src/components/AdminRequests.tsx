import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  Clock, 
  Send, 
  Phone, 
  User, 
  AlertCircle,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Check,
  Copy
} from 'lucide-react';
import { NidaServiceRequest } from '../types';
import { RequestStore } from '../services/requestStore';
import { lookupNidaRecord, INITIAL_MOCK_RECORDS } from '../data/mockRecords';
import { useLanguage } from '../context/LanguageContext';

interface AdminRequestsProps {
  onNavigateToLookup?: (ninOrPhone: string) => void;
  onNavigateToUserRequest?: () => void;
}

export const AdminRequests: React.FC<AdminRequestsProps> = ({ 
  onNavigateToLookup,
  onNavigateToUserRequest 
}) => {
  const { t, language } = useLanguage();
  const [requests, setRequests] = useState<NidaServiceRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'Pending' | 'Completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputNins, setInputNins] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedNin, setCopiedNin] = useState<string | null>(null);

  // Sync requests from store
  useEffect(() => {
    setRequests(RequestStore.getRequests());

    const handleUpdate = () => {
      setRequests(RequestStore.getRequests());
    };

    window.addEventListener('nida_requests_updated', handleUpdate);
    return () => window.removeEventListener('nida_requests_updated', handleUpdate);
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleInputChange = (requestId: string, value: string) => {
    setInputNins((prev) => ({
      ...prev,
      [requestId]: value,
    }));
  };

  // Admin action: Kamilisha / Patia NIDA
  const handleFulfillRequest = (requestId: string) => {
    const enteredNin = inputNins[requestId]?.trim();
    if (!enteredNin || enteredNin.length < 8) {
      showNotification('error', t.admin_complete_validation_error);
      return;
    }

    const result = RequestStore.completeRequest(
      requestId, 
      enteredNin, 
      language === 'sw' ? 'NIDA imehakikiwa na kupatiwa kikamilifu na Afisa wa NIDA.' : 'NIDA verified and provided by authorized NIDA officer.'
    );

    if (result.success) {
      showNotification('success', t.admin_complete_success);
      // Clear input
      setInputNins((prev) => {
        const copy = { ...prev };
        delete copy[requestId];
        return copy;
      });
    } else {
      showNotification('error', result.error || 'Failed to complete request.');
    }
  };

  // Helper: Suggest NIN from system database or mock generator
  const handleAutoSuggestNin = (requestId: string, targetPhone: string) => {
    const lookup = lookupNidaRecord(targetPhone);
    if (lookup.record) {
      setInputNins((prev) => ({
        ...prev,
        [requestId]: lookup.record!.nin,
      }));
      showNotification('success', language === 'sw' ? `NIN imepatikana kwenye rejista kwa ajili ya: ${lookup.record.fullName}` : `NIN found in registry for: ${lookup.record.fullName}`);
    } else {
      const randomDigits = Math.floor(10000 + Math.random() * 90000);
      const generated = `19920512-14205-${randomDigits}-22`;
      setInputNins((prev) => ({
        ...prev,
        [requestId]: generated,
      }));
      showNotification('success', language === 'sw' ? `NIN inayokubalika imependekezwa: ${generated}` : `Suggested valid NIN format: ${generated}`);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNin(text);
    setTimeout(() => setCopiedNin(null), 2000);
  };

  // Filter requests
  const filteredRequests = requests.filter((req) => {
    const matchesFilter = filterStatus === 'all' || req.status === filterStatus;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !query ||
      req.targetPhone.includes(query) ||
      req.userPhone.includes(query) ||
      (req.applicantName && req.applicantName.toLowerCase().includes(query)) ||
      (req.nidaNumber && req.nidaNumber.toLowerCase().includes(query)) ||
      req.id.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  const pendingCount = requests.filter((r) => r.status === 'Pending').length;
  const completedCount = requests.filter((r) => r.status === 'Completed').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Notification */}
      {notification && (
        <div 
          className={`p-4 rounded-xl border flex items-center gap-3 backdrop-blur-md transition-all ${
            notification.type === 'success' 
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200' 
              : 'bg-red-950/80 border-red-500/40 text-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-medium leading-relaxed">{notification.message}</span>
        </div>
      )}

      {/* Admin Section Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.admin_badge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-100 font-sans">
            {t.admin_title}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            {t.admin_subtitle}
          </p>
        </div>

        {/* Quick Nav / Reset */}
        <div className="flex items-center gap-2">
          {onNavigateToUserRequest && (
            <button
              onClick={onNavigateToUserRequest}
              className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-amber-500/30 hover:border-amber-400 text-amber-300 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{t.admin_to_user_form}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => {
              RequestStore.resetData();
              showNotification('success', language === 'sw' ? 'Takwimu za mfano zimerudishwa upya.' : 'Demo requests reset successfully.');
            }}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
            title={t.admin_reset_seed}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800">
          <span className="text-[10px] font-mono uppercase text-neutral-400 block font-semibold">
            {t.admin_metric_total}
          </span>
          <span className="text-2xl font-black font-mono text-neutral-100">
            {requests.length}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30">
          <span className="text-[10px] font-mono uppercase text-amber-300/80 block font-semibold">
            {t.admin_metric_pending}
          </span>
          <span className="text-2xl font-black font-mono text-amber-400">
            {pendingCount}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
          <span className="text-[10px] font-mono uppercase text-emerald-300/80 block font-semibold">
            {t.admin_metric_completed}
          </span>
          <span className="text-2xl font-black font-mono text-emerald-400">
            {completedCount}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800">
          <span className="text-[10px] font-mono uppercase text-neutral-400 block font-semibold">
            {t.admin_metric_tokens}
          </span>
          <span className="text-2xl font-black font-mono text-neutral-100">
            {requests.length} <span className="text-xs text-amber-400 font-sans font-normal">(Tshs {(requests.length * 200).toLocaleString()})</span>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-neutral-950/90 border border-neutral-800">
        {/* Filter Segmented Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-900 rounded-lg text-xs font-mono">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {t.admin_filter_all} ({requests.length})
          </button>
          <button
            onClick={() => setFilterStatus('Pending')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              filterStatus === 'Pending'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {t.admin_filter_pending} ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('Completed')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              filterStatus === 'Completed'
                ? 'bg-emerald-500 text-neutral-950 font-bold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {t.admin_filter_completed} ({completedCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.admin_search_placeholder}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 focus:border-amber-400 text-xs font-mono text-neutral-100 placeholder-neutral-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Admin Structured Table */}
      <div className="rounded-xl border border-neutral-800 bg-[#0A0E18] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950/80 text-[11px] font-mono uppercase text-neutral-400 tracking-wider">
                <th scope="col" className="py-3.5 px-4 font-bold">
                  {t.admin_col_user}
                </th>
                <th scope="col" className="py-3.5 px-4 font-bold">
                  {t.admin_col_requested_phone}
                </th>
                <th scope="col" className="py-3.5 px-4 font-bold">
                  {t.admin_col_timestamp}
                </th>
                <th scope="col" className="py-3.5 px-4 font-bold">
                  {t.admin_col_status}
                </th>
                <th scope="col" className="py-3.5 px-4 font-bold min-w-[280px]">
                  {t.admin_col_action}
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-neutral-800/80">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-400 font-mono text-xs">
                    {t.admin_no_records}
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const isPending = req.status === 'Pending';
                  const isCompleted = req.status === 'Completed';

                  return (
                    <tr 
                      key={req.id}
                      className="hover:bg-neutral-900/40 transition-colors"
                    >
                      {/* Column 1: User / Phone Number */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-neutral-200 flex items-center gap-1.5">
                            <User className="w-3 h-3 text-amber-400" />
                            <span>{req.userPhone}</span>
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400 block">
                            ID: {req.userId}
                          </span>
                          {req.applicantName && (
                            <span className="text-[11px] text-neutral-300 font-sans block">
                              {req.applicantName}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 2: Requested Mobile Number */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1">
                          <span className="font-mono font-bold text-emerald-400 flex items-center gap-1 text-sm">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{req.targetPhone}</span>
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400 block">
                            #{req.id}
                          </span>
                        </div>
                      </td>

                      {/* Column 3: Timestamp */}
                      <td className="py-4 px-4 align-top font-mono text-neutral-300">
                        <div className="flex items-center gap-1 text-xs">
                          <Clock className="w-3 h-3 text-neutral-400" />
                          <span>
                            {new Date(req.timestamp).toLocaleDateString(language === 'sw' ? 'sw-TZ' : 'en-US', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {new Date(req.timestamp).toLocaleTimeString(language === 'sw' ? 'sw-TZ' : 'en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      {/* Column 4: Status */}
                      <td className="py-4 px-4 align-top">
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                            <span>Pending</span>
                          </span>
                        )}

                        {isCompleted && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Completed</span>
                          </span>
                        )}
                      </td>

                      {/* Column 5: Action */}
                      <td className="py-4 px-4 align-top">
                        {isPending ? (
                          <div className="space-y-2 max-w-sm">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={inputNins[req.id] || ''}
                                onChange={(e) => handleInputChange(req.id, e.target.value)}
                                placeholder={t.admin_input_nin_placeholder}
                                className="flex-1 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 focus:border-amber-400 text-xs font-mono text-neutral-100 placeholder-neutral-600 focus:outline-none"
                              />

                              {/* Quick Auto Suggest / Fill button */}
                              <button
                                type="button"
                                onClick={() => handleAutoSuggestNin(req.id, req.targetPhone)}
                                title="Auto-suggest valid NIN"
                                className="px-2 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-neutral-700 text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>{t.admin_suggest_btn}</span>
                              </button>
                            </div>

                            {/* Submit button */}
                            <button
                              type="button"
                              onClick={() => handleFulfillRequest(req.id)}
                              className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-neutral-950 font-bold text-xs font-mono shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
                            >
                              <Send className="w-3 h-3" />
                              <span>{t.admin_complete_btn}</span>
                            </button>
                          </div>
                        ) : (
                          /* Already completed view */
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <div className="px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/30 font-mono text-emerald-300 font-bold text-xs">
                                {req.nidaNumber}
                              </div>

                              <button
                                type="button"
                                onClick={() => handleCopy(req.nidaNumber!)}
                                className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-emerald-300 transition-colors cursor-pointer"
                                title="Copy NIN"
                              >
                                {copiedNin === req.nidaNumber ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>

                              {onNavigateToLookup && (
                                <button
                                  type="button"
                                  onClick={() => onNavigateToLookup(req.nidaNumber!)}
                                  className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-amber-300 transition-colors cursor-pointer"
                                  title="Lookup details"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            <span className="text-[10px] text-neutral-400 font-mono block">
                              {t.admin_completed_time}{' '}
                              {req.completedAt
                                ? new Date(req.completedAt).toLocaleTimeString(language === 'sw' ? 'sw-TZ' : 'en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : 'Recent'}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
