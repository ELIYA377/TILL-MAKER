import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Coins, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  Plus, 
  HelpCircle,
  ExternalLink,
  Shield,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import { NidaServiceRequest } from '../types';
import { RequestStore } from '../services/requestStore';
import { TopUpModal } from './TopUpModal';
import { useLanguage } from '../context/LanguageContext';

interface NidaRequestProps {
  onNavigateToLookup?: (ninOrPhone: string) => void;
  onNavigateToAdmin?: () => void;
}

export const NidaRequest: React.FC<NidaRequestProps> = ({ 
  onNavigateToLookup,
  onNavigateToAdmin 
}) => {
  const { t, language } = useLanguage();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [tokenBalance, setTokenBalance] = useState<number>(RequestStore.getTokens());
  const [requests, setRequests] = useState<NidaServiceRequest[]>([]);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load requests and tokens on mount
  useEffect(() => {
    setRequests(RequestStore.getRequests());
    setTokenBalance(RequestStore.getTokens());

    const handleRequestsUpdate = () => {
      setRequests(RequestStore.getRequests());
    };

    const handleWalletUpdate = () => {
      setTokenBalance(RequestStore.getTokens());
    };

    window.addEventListener('nida_requests_updated', handleRequestsUpdate);
    window.addEventListener('nida_wallet_updated', handleWalletUpdate);

    return () => {
      window.removeEventListener('nida_requests_updated', handleRequestsUpdate);
      window.removeEventListener('nida_wallet_updated', handleWalletUpdate);
    };
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Detect telecom carrier from phone number prefix
  const getCarrierFromPhone = (phone: string) => {
    const clean = phone.replace(/\D/g, '');
    if (clean.startsWith('078') || clean.startsWith('068') || clean.startsWith('069')) return { name: 'Airtel', color: 'text-red-400 border-red-500/30 bg-red-950/20' };
    if (clean.startsWith('075') || clean.startsWith('076') || clean.startsWith('074')) return { name: 'Vodacom', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20' };
    if (clean.startsWith('071') || clean.startsWith('065') || clean.startsWith('067')) return { name: 'Tigo', color: 'text-blue-400 border-blue-500/30 bg-blue-950/20' };
    if (clean.startsWith('062') || clean.startsWith('061')) return { name: 'Halotel', color: 'text-orange-400 border-orange-500/30 bg-orange-950/20' };
    if (clean.startsWith('073')) return { name: 'TTCL', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20' };
    return null;
  };

  const detectedCarrier = getCarrierFromPhone(phoneNumber);

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Token Validation: Check if user has at least 1 token
    if (tokenBalance < 1) {
      setIsTopUpOpen(true);
      showNotification('error', t.req_insufficient_tokens);
      return;
    }

    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    if (cleanPhone.length < 9) {
      showNotification('error', t.req_invalid_phone);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const result = RequestStore.submitRequest(cleanPhone, applicantName);
      setIsSubmitting(false);

      if (result.success && result.request) {
        setPhoneNumber('');
        setApplicantName('');
        showNotification('success', t.req_success_submit);
      } else {
        showNotification('error', result.error || 'Error submitting request.');
      }
    }, 600);
  };

  const handleCopyNin = (nin: string, reqId: string) => {
    navigator.clipboard.writeText(nin);
    setCopiedId(reqId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSetZeroTokensForTesting = () => {
    RequestStore.setTokens(0);
    showNotification('error', language === 'sw' ? 'Salio limewekwa 0 Tokens kwa ajili ya kupima. Jaribu kutuma ombi sasa!' : 'Balance set to 0 Tokens for testing. Try submitting now!');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Notice */}
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
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-medium leading-relaxed">{notification.message}</span>
        </div>
      )}

      {/* Main Title & Value Proposition */}
      <section className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{t.req_badge}</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-100 font-sans">
          {t.req_hero_title_1} <span className="metallic-gold-text">{t.req_hero_title_2}</span>
        </h2>

        <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
          {t.req_hero_desc}
        </p>
      </section>

      {/* Form Card & Wallet Integration */}
      <div className="max-w-2xl mx-auto">
        <div className="p-6 sm:p-8 rounded-2xl bg-[#090D15]/95 border border-amber-500/30 shadow-[0_4px_30px_rgba(0,0,0,0.8),0_0_25px_rgba(245,158,11,0.1)] relative overflow-hidden backdrop-blur-md">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Wallet Balance Strip */}
          <div className="mb-6 p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase text-neutral-400 block tracking-wider font-semibold">
                  {t.req_wallet_title}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-black font-mono text-neutral-100">
                    {tokenBalance} {tokenBalance === 1 ? t.nav_tokens : t.nav_tokens_plural}
                  </span>
                  <span className="text-xs font-mono text-amber-400/90 font-medium">
                    ({t.req_wallet_enough} {tokenBalance})
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Top Up Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsTopUpOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 hover:border-amber-400 text-amber-300 text-xs font-bold font-mono flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.req_wallet_topup_btn}</span>
              </button>

              {/* Dev Helper button to set 0 tokens to test blocking */}
              {tokenBalance > 0 && (
                <button
                  type="button"
                  onClick={handleSetZeroTokensForTesting}
                  title="Jaribu Salio 0 (Test blocked modal)"
                  className="px-2 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 text-[10px] font-mono border border-neutral-700 transition-colors"
                >
                  {t.req_wallet_test_zero}
                </button>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmitRequest} className="space-y-5">
            {/* Field: Mobile Phone Number */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="mobile-phone-input"
                  className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.req_phone_label}</span>
                  <span className="text-amber-400">*</span>
                </label>

                {detectedCarrier && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${detectedCarrier.color}`}>
                    {t.req_carrier}: {detectedCarrier.name}
                  </span>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <span className="text-xs font-mono text-amber-400/90 font-semibold">+255</span>
                </div>
                <input
                  id="mobile-phone-input"
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={t.req_phone_placeholder}
                  className="w-full pl-14 pr-4 py-3 rounded-xl bg-neutral-900/90 border border-neutral-800 focus:border-amber-400 text-base font-mono text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-400/50 transition-all shadow-inner"
                />
              </div>

              {/* Sample quick numbers for fast testing */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-neutral-400">
                <span className="font-mono text-[10px] text-neutral-400">{t.req_examples}</span>
                {['0784615052', '0754112233', '0655234567'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPhoneNumber(num)}
                    className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-amber-300 font-mono text-[10px] transition-colors cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Field: Optional Applicant Name */}
            <div className="space-y-1.5">
              <label 
                htmlFor="applicant-name-input"
                className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5"
              >
                <span>{t.req_name_label}</span>
              </label>
              <input
                id="applicant-name-input"
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder={t.req_name_placeholder}
                className="w-full px-4 py-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 focus:border-amber-400 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-400/50 transition-all"
              />
            </div>

            {/* Helper Note */}
            <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800/90 flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-neutral-300 leading-relaxed font-sans">
                <span className="text-amber-300 font-medium">
                  {t.req_cost_note}
                </span>{' '}
                {t.req_cost_note_desc}
              </div>
            </div>

            {/* Prominent Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-extrabold text-sm tracking-wide shadow-[0_4px_25px_rgba(245,158,11,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-neutral-950" />
              <span>{isSubmitting ? t.req_submitting_btn : t.req_submit_btn}</span>
              <span className="text-xs font-mono bg-neutral-950/20 px-2 py-0.5 rounded text-neutral-900 font-bold ml-1">
                {t.req_cost_tag}
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* User's Requests Section */}
      <section className="max-w-4xl mx-auto space-y-4 pt-4 border-t border-neutral-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-mono font-bold uppercase text-neutral-200 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-amber-400" />
              <span>{t.req_my_requests_title}</span>
            </h3>
            <p className="text-xs text-neutral-400">
              {t.req_my_requests_desc}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-neutral-400">
              {t.req_total_requests}: <strong className="text-amber-300">{requests.length}</strong>
            </span>
            {onNavigateToAdmin && (
              <button
                onClick={onNavigateToAdmin}
                className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-amber-300 text-xs font-mono transition-colors flex items-center gap-1"
                title={t.req_open_admin}
              >
                <span>{t.req_open_admin}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-neutral-950/60 border border-neutral-800/80 text-neutral-400 space-y-2">
            <Shield className="w-8 h-8 text-neutral-600 mx-auto" />
            <h4 className="text-sm font-bold text-neutral-300">{t.req_no_requests_title}</h4>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              {t.req_no_requests_desc}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => {
              const isCompleted = req.status === 'Completed';
              const isPending = req.status === 'Pending';
              const carrier = getCarrierFromPhone(req.targetPhone);

              return (
                <div
                  key={req.id}
                  className={`p-4 sm:p-5 rounded-xl border transition-all duration-200 ${
                    isCompleted
                      ? 'bg-neutral-950/90 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                      : 'bg-neutral-950/70 border-neutral-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left Info */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-sm sm:text-base font-bold font-mono text-neutral-100 flex items-center gap-1.5">
                          <Phone className="w-4 h-4 text-emerald-400" />
                          <span>{req.targetPhone}</span>
                        </span>

                        {carrier && (
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${carrier.color}`}>
                            {carrier.name}
                          </span>
                        )}

                        {req.applicantName && (
                          <span className="text-xs text-neutral-400 font-sans">
                            · {req.applicantName}
                          </span>
                        )}

                        <span className="text-[10px] font-mono text-neutral-400">
                          ID: {req.id}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-neutral-400" />
                          {new Date(req.timestamp).toLocaleString(language === 'sw' ? 'sw-TZ' : 'en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                        <span>·</span>
                        <span className="text-amber-400/90">{t.req_cost_tag}</span>
                      </div>
                    </div>

                    {/* Right: Status & Received NIDA */}
                    <div className="sm:text-right space-y-2">
                      {isPending && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs font-mono font-medium">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                          </span>
                          <span>{t.req_status_pending}</span>
                        </div>
                      )}

                      {isCompleted && req.nidaNumber && (
                        <div className="space-y-2">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{t.req_status_completed}</span>
                          </div>

                          <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between gap-3">
                            <div>
                              <span className="text-[10px] uppercase font-mono text-neutral-400 block">
                                {t.req_received_nin}
                              </span>
                              <span className="text-sm sm:text-base font-black font-mono text-emerald-300 tracking-wider">
                                {req.nidaNumber}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleCopyNin(req.nidaNumber!, req.id)}
                                className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-emerald-300 transition-colors cursor-pointer"
                                title={t.req_copy_nin}
                              >
                                {copiedId === req.id ? (
                                  <Check className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>

                              {onNavigateToLookup && (
                                <button
                                  type="button"
                                  onClick={() => onNavigateToLookup(req.nidaNumber!)}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-neutral-950 text-xs font-bold font-mono transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                                  title={t.req_verify_info}
                                >
                                  <span>{t.req_verify_info}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {req.adminNotes && (
                    <div className="mt-3 pt-2 border-t border-neutral-900 text-[11px] text-neutral-400 font-mono flex items-center gap-1.5">
                      <span className="text-amber-400/80 font-bold">{t.req_admin_note}</span>
                      <span>{req.adminNotes}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Top Up Modal */}
      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        requiredTokens={1}
        onSuccess={(newBal) => {
          setTokenBalance(newBal);
          showNotification('success', `${t.topup_success_toast} ${newBal} ${t.nav_tokens_plural}.`);
        }}
      />
    </div>
  );
};
