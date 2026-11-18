import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Camera, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Printer, 
  Fingerprint, 
  Phone, 
  Calendar, 
  MapPin, 
  UserCheck, 
  Building,
  RotateCcw,
  Sparkles,
  Check,
  X
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SmartIdStore } from '../../services/smartIdStore';
import { NidaRecord } from '../../types';
import { TelecomLogo, detectCarrierFromPhone, TELECOM_CARRIERS } from './TelecomLogos';

interface VerificationPortalProps {
  initialQuery?: string;
  onOpenCertificateModal: (nin: string) => void;
  onSelectCitizenForCard: (citizen: NidaRecord) => void;
}

export const VerificationPortal: React.FC<VerificationPortalProps> = ({
  initialQuery = '19900315-11103-00001-21',
  onOpenCertificateModal,
  onSelectCitizenForCard,
}) => {
  const { t } = useLanguage();

  const [activeMode, setActiveMode] = useState<'scanner' | 'manual'>('scanner');
  const [queryInput, setQueryInput] = useState(initialQuery);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    authentic: boolean;
    record?: NidaRecord;
    message: string;
    confidence: number;
    timestamp: number;
  } | null>(() => {
    return SmartIdStore.verifyIdentity(initialQuery);
  });

  const runVerification = (q: string) => {
    setIsVerifying(true);
    setTimeout(() => {
      const res = SmartIdStore.verifyIdentity(q);
      setVerifyResult(res);
      setIsVerifying(false);
    }, 500);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;
    runVerification(queryInput.trim());
  };

  // Simulate scanning a QR Code
  const handleSimulateScan = (sampleNin?: string) => {
    const targetNin = sampleNin || '19990102455240000122';
    setQueryInput(targetNin);
    setIsVerifying(true);
    setTimeout(() => {
      runVerification(targetNin);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t.verify_title}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {t.verify_subtitle}
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs: Scanner Mode vs Manual Input Mode */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => setActiveMode('scanner')}
            className={`py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMode === 'scanner'
                ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                : 'hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{t.tab_scanner}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('manual')}
            className={`py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMode === 'manual'
                ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                : 'hover:text-slate-900'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>{t.tab_manual}</span>
          </button>
        </div>

        {/* SCANNER MODE VIEWPORT */}
        {activeMode === 'scanner' ? (
          <div className="space-y-4">
            <div className="relative mx-auto max-w-md aspect-[16/10] rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-800 shadow-2xl flex flex-col items-center justify-center text-white p-4">
              {/* Background simulated camera grid */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-30" />

              {/* Optical Targeting Box & Laser Scanline */}
              <div className="relative w-56 h-36 border-2 border-emerald-500/80 rounded-xl bg-emerald-950/20 shadow-inner flex flex-col items-center justify-center overflow-hidden">
                {/* Laser scanline */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-scanline shadow-[0_0_8px_#34d399]" />

                {/* Reticle corner accents */}
                <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
                <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
                <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
                <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-emerald-400" />

                <QrCode className="w-12 h-12 text-emerald-400/80 mb-1" />
                <span className="text-[9px] font-mono tracking-widest text-emerald-300 uppercase">
                  {isVerifying ? 'DECODING QR PAYLOAD...' : 'READY FOR SCAN'}
                </span>
              </div>

              {/* Live Overlay Status */}
              <div className="absolute top-3 left-3 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono text-emerald-400 border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>CAMERA SENSOR ACTIVE</span>
              </div>

              <div className="absolute bottom-3 inset-x-4 text-center text-[10px] text-slate-400 font-mono">
                {t.scanner_laser_hint}
              </div>
            </div>

            {/* Simulate Scan Button */}
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={() => handleSimulateScan()}
                disabled={isVerifying}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-900/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Inasoma QR Code...</span>
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4" />
                    <span>{t.scanner_simulate_btn}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* MANUAL INPUT MODE */
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label htmlFor="manualQuery" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {t.manual_input_label}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="manualQuery"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder={t.manual_input_placeholder}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-mono text-sm font-bold focus:outline-none focus:border-emerald-600 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Inakagua Kwenye Kanzidata...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t.manual_verify_btn}</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Quick Test Sample Badges */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600">{t.sample_verify_badges}</span>
          <button
            type="button"
            onClick={() => handleSimulateScan('19900315-11103-00001-21')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 font-mono cursor-pointer transition-colors"
          >
            Juma (NIN)
          </button>
          <button
            type="button"
            onClick={() => handleSimulateScan('0754112233')}
            className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 font-mono cursor-pointer transition-colors flex items-center gap-1"
          >
            <TelecomLogo carrier="Vodacom" size="sm" variant="icon" />
            <span>0754112233 (Vodacom)</span>
          </button>
          <button
            type="button"
            onClick={() => handleSimulateScan('0623033377')}
            className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 font-mono cursor-pointer transition-colors flex items-center gap-1"
          >
            <TelecomLogo carrier="Halotel" size="sm" variant="icon" />
            <span>0623033377 (Halotel)</span>
          </button>
          <button
            type="button"
            onClick={() => handleSimulateScan('0784615052')}
            className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-mono cursor-pointer transition-colors flex items-center gap-1"
          >
            <TelecomLogo carrier="Airtel" size="sm" variant="icon" />
            <span>0784615052 (Airtel)</span>
          </button>
          <button
            type="button"
            onClick={() => handleSimulateScan('0655112233')}
            className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-mono cursor-pointer transition-colors flex items-center gap-1"
          >
            <TelecomLogo carrier="Tigo" size="sm" variant="icon" />
            <span>0655112233 (Tigo)</span>
          </button>
          <button
            type="button"
            onClick={() => handleSimulateScan('99999999999999999999')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 font-mono cursor-pointer transition-colors"
          >
            Feki / Fake NIN
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VERIFICATION RESULTS CONTAINER                                            */}
      {/* ========================================================================= */}
      {verifyResult && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Result Status Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
            verifyResult.authentic
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-red-50 border-red-300 text-red-950'
          }`}>
            <div className="flex items-center gap-3">
              {verifyResult.authentic ? (
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-black">
                  <AlertCircle className="w-6 h-6" />
                </div>
              )}
              <div>
                <h3 className="text-sm sm:text-base font-extrabold tracking-tight">
                  {verifyResult.authentic ? t.verify_status_authentic : t.verify_status_invalid}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">
                  {verifyResult.message}
                </p>
              </div>
            </div>

            {verifyResult.authentic && verifyResult.record && (
              <button
                type="button"
                onClick={() => onOpenCertificateModal(verifyResult.record!.nin)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t.verify_print_slip}</span>
              </button>
            )}
          </div>

          {/* Citizen Verified Details Card */}
          {verifyResult.record && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-300 bg-slate-200 shrink-0">
                    <img 
                      src={verifyResult.record.avatarUrl} 
                      alt={verifyResult.record.fullName} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900 tracking-tight">
                      {verifyResult.record.fullName}
                    </h4>
                    <span className="text-xs text-slate-500 font-mono">
                      {verifyResult.record.nationality} · {verifyResult.record.citizenshipType}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <Fingerprint className="w-3.5 h-3.5" />
                    <span>Level-3 Biometrics</span>
                  </span>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">National ID Number (NIN)</span>
                  <p className="font-mono font-bold text-blue-900 text-sm mt-0.5">
                    {verifyResult.record.nin}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Date of Birth & Gender</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {verifyResult.record.dateOfBirth} · {verifyResult.record.gender}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Primary Mobile Line</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <TelecomLogo carrier={detectCarrierFromPhone(verifyResult.record.primaryPhone)} size="sm" variant="icon" />
                    <span className="font-mono font-bold text-slate-800">
                      {verifyResult.record.primaryPhone}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                    {detectCarrierFromPhone(verifyResult.record.primaryPhone)} · TCRA Active
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Residence (Makazi)</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {verifyResult.record.residence.region}, {verifyResult.record.residence.district}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>SECURITY CHECKSUM: {verifyResult.record.securityChecksum}</span>
                <button
                  type="button"
                  onClick={() => onSelectCitizenForCard(verifyResult.record!)}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  Tazama Kadi ya Smart ID &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
