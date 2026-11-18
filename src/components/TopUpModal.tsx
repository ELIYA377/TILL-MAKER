import React, { useState } from 'react';
import { 
  X, 
  Coins, 
  CheckCircle2, 
  ShieldCheck, 
  Smartphone, 
  Loader2, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { RequestStore } from '../services/requestStore';
import { useLanguage } from '../context/LanguageContext';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newBalance: number) => void;
  requiredTokens?: number;
}

interface TokenPackage {
  id: string;
  tokens: number;
  bonusTokens?: number;
  priceTsh: number;
  labelSw: string;
  labelEn: string;
  isPopular?: boolean;
}

const TOKEN_PACKAGES: TokenPackage[] = [
  { id: 'pkg-1', tokens: 1, priceTsh: 200, labelSw: 'Ombi 1 la NIDA', labelEn: '1 NIDA Request' },
  { id: 'pkg-3', tokens: 3, priceTsh: 600, labelSw: 'Maombi 3 ya NIDA', labelEn: '3 NIDA Requests', isPopular: true },
  { id: 'pkg-5', tokens: 5, priceTsh: 1000, labelSw: 'Maombi 5 ya NIDA', labelEn: '5 NIDA Requests' },
  { id: 'pkg-10', tokens: 10, bonusTokens: 1, priceTsh: 2000, labelSw: 'Maombi 10 + 1 Bonus', labelEn: '10 Requests + 1 Bonus' },
];

export const TopUpModal: React.FC<TopUpModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  requiredTokens = 1,
}) => {
  const { t, language } = useLanguage();
  const [selectedPkg, setSelectedPkg] = useState<TokenPackage>(TOKEN_PACKAGES[0]);
  const [paymentPhone, setPaymentPhone] = useState(RequestStore.getUserPhone());
  const [carrier, setCarrier] = useState<'mpesa' | 'airtel' | 'tigo' | 'halopesa'>('airtel');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'select' | 'confirming' | 'success'>('select');

  if (!isOpen) return null;

  const totalTokensToAdd = selectedPkg.tokens + (selectedPkg.bonusTokens || 0);

  const handleProcessPayment = () => {
    if (!paymentPhone.trim() || paymentPhone.replace(/\D/g, '').length < 9) {
      alert(t.req_invalid_phone);
      return;
    }

    setIsProcessing(true);
    setPaymentStep('confirming');

    // Simulate USSD Push Prompt & Payment Gateway Response (1.4s)
    setTimeout(() => {
      const newBalance = RequestStore.addTokens(totalTokensToAdd);
      setIsProcessing(false);
      setPaymentStep('success');

      setTimeout(() => {
        onSuccess(newBalance);
        onClose();
        setPaymentStep('select');
      }, 1500);
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#0C101A] border border-amber-500/30 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#080C14]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                <span>{t.topup_title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {t.topup_rate}
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                {t.topup_subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80 transition-colors disabled:opacity-50 cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {paymentStep === 'select' && (
            <>
              {/* Alert notice if user was blocked by zero tokens */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200/90 leading-relaxed">
                  <span className="font-bold text-amber-300">{t.topup_notice_title}</span> {t.topup_notice_desc}
                </div>
              </div>

              {/* Package Selection Grid */}
              <div className="space-y-2.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 block">
                  {t.topup_package_label}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {TOKEN_PACKAGES.map((pkg) => {
                    const isSelected = selectedPkg.id === pkg.id;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPkg(pkg)}
                        className={`relative p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-950/30 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                            : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                        }`}
                      >
                        {pkg.isPopular && (
                          <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-amber-500 text-neutral-950 shadow-sm">
                            {t.topup_popular}
                          </span>
                        )}
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-lg font-black text-neutral-100 font-mono">
                            {pkg.tokens} {pkg.tokens === 1 ? t.nav_tokens : t.nav_tokens_plural}
                          </span>
                          {pkg.bonusTokens && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              +{pkg.bonusTokens} {t.topup_free_bonus}
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-bold text-amber-400 font-mono">
                          Tshs {pkg.priceTsh.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-1">
                          {language === 'sw' ? pkg.labelSw : pkg.labelEn}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Network Provider Selector */}
              <div className="space-y-2.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 block">
                  {t.topup_mobile_money_label}
                </label>
                <div className="grid grid-cols-4 gap-2 text-xs font-mono font-semibold">
                  {[
                    { id: 'airtel', name: 'Airtel Money', color: 'text-red-400 border-red-500/30' },
                    { id: 'mpesa', name: 'M-Pesa', color: 'text-emerald-400 border-emerald-500/30' },
                    { id: 'tigo', name: 'Tigo Pesa', color: 'text-blue-400 border-blue-500/30' },
                    { id: 'halopesa', name: 'HaloPesa', color: 'text-orange-400 border-orange-500/30' },
                  ].map((prov) => (
                    <button
                      key={prov.id}
                      type="button"
                      onClick={() => setCarrier(prov.id as any)}
                      className={`py-2 px-1 rounded-lg border text-center transition-all cursor-pointer ${
                        carrier === prov.id
                          ? 'bg-neutral-800 border-amber-400 text-amber-300 font-bold shadow-sm'
                          : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {prov.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Mobile Number Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 block">
                  {t.topup_payment_phone_label}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <Smartphone className="w-4 h-4 text-amber-400" />
                  </div>
                  <input
                    type="tel"
                    value={paymentPhone}
                    onChange={(e) => setPaymentPhone(e.target.value)}
                    placeholder={t.topup_payment_phone_placeholder}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 focus:border-amber-400 text-sm font-mono text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                  />
                </div>
                <p className="text-[11px] text-neutral-400">
                  {t.topup_payment_phone_note}
                </p>
              </div>

              {/* Order Summary Strip */}
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
                <div className="flex justify-between items-center text-neutral-400">
                  <span>{t.topup_summary_tokens}</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {totalTokensToAdd} {totalTokensToAdd > 1 ? t.nav_tokens_plural : t.nav_tokens}
                  </span>
                </div>
                <div className="flex justify-between items-center text-neutral-200 border-t border-neutral-800/80 pt-2 font-bold">
                  <span>{t.topup_summary_amount}</span>
                  <span className="font-mono text-amber-400 text-base">
                    Tshs {selectedPkg.priceTsh.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Pay Button */}
              <button
                type="button"
                onClick={handleProcessPayment}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-bold text-sm tracking-wide shadow-[0_4px_20px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <Sparkles className="w-4 h-4 text-neutral-950" />
                <span>{t.topup_pay_button} (Tshs {selectedPkg.priceTsh.toLocaleString()})</span>
              </button>
            </>
          )}

          {/* Processing / Confirming Step */}
          {paymentStep === 'confirming' && (
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-400 flex items-center justify-center mx-auto text-amber-400 animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-neutral-100">
                  {t.topup_processing_title}
                </h4>
                <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                  {t.topup_processing_desc} ({paymentPhone} · Tshs {selectedPkg.priceTsh.toLocaleString()}).
                </p>
              </div>
              <div className="inline-flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t.topup_gateway_secure}</span>
              </div>
            </div>
          )}

          {/* Success Step */}
          {paymentStep === 'success' && (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-neutral-100">
                {t.topup_success_title}
              </h4>
              <p className="text-xs text-emerald-300">
                {totalTokensToAdd} {t.topup_success_desc}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
