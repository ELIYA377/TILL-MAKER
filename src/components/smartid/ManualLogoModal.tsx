import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  RotateCcw, 
  Check, 
  X, 
  Sparkles, 
  Layers, 
  Building,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileCheck
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { TelecomCarrier, TelecomAgentProfile } from '../../types';
import { SmartIdStore } from '../../services/smartIdStore';
import { TelecomLogo, TELECOM_CARRIERS } from './TelecomLogos';

interface ManualLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeAgent?: TelecomAgentProfile;
  defaultCarrier?: TelecomCarrier;
  onLogoUpdated?: (newLogoUrl?: string) => void;
}

export const ManualLogoModal: React.FC<ManualLogoModalProps> = ({
  isOpen,
  onClose,
  activeAgent,
  defaultCarrier = 'Vodacom',
  onLogoUpdated,
}) => {
  const { language, t } = useLanguage();

  const [selectedCarrier, setSelectedCarrier] = useState<TelecomCarrier>(
    activeAgent ? activeAgent.carrier : defaultCarrier
  );
  const [scope, setScope] = useState<'card' | 'carrier'>('card');
  const [previewUrl, setPreviewUrl] = useState<string>(() => {
    if (activeAgent?.customLogoUrl) return activeAgent.customLogoUrl;
    const carrierLogo = SmartIdStore.getCarrierLogo(activeAgent ? activeAgent.carrier : defaultCarrier);
    return carrierLogo || '';
  });
  const [urlInput, setUrlInput] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle local file upload (PNG, JPG, SVG, WebP)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMsg({
        type: 'error',
        text: language === 'sw' ? 'Tafadhali chagua faili la picha halali (PNG, JPG, SVG, WebP).' : 'Please select a valid image file (PNG, JPG, SVG, WebP).'
      });
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setStatusMsg({
        type: 'error',
        text: language === 'sw' ? 'Picha isizidi ukubwa wa 3MB.' : 'Image size must be under 3MB.'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPreviewUrl(dataUrl);
      setStatusMsg({
        type: 'success',
        text: language === 'sw' ? 'Picha imepakiwa! Bofya "Hifadhi Nembo" ili kuweka kwenye kitambulisho.' : 'Image loaded! Click "Save Logo" to apply to credential.'
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle pasting an image URL
  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    setPreviewUrl(urlInput.trim());
    setStatusMsg({
      type: 'success',
      text: language === 'sw' ? 'Kiungo cha picha kimewekwa! Hakiki hapo chini kisha bofya Hifadhi.' : 'URL set! Verify below and click Save.'
    });
  };

  // Save manual logo
  const handleSave = () => {
    if (!previewUrl) {
      setStatusMsg({
        type: 'error',
        text: language === 'sw' ? 'Hakuna picha iliyochaguliwa.' : 'No logo image selected.'
      });
      return;
    }

    if (scope === 'card' && activeAgent) {
      SmartIdStore.updateTelecomAgentLogo(activeAgent.id, previewUrl);
      setStatusMsg({
        type: 'success',
        text: language === 'sw' ? 'Nembo imewekwa kwa mkono kwenye kitambulisho hiki!' : 'Manual logo successfully applied to this ID card!'
      });
      onLogoUpdated?.(previewUrl);
    } else {
      // Scope carrier
      SmartIdStore.setCustomCarrierLogo(selectedCarrier, previewUrl);
      setStatusMsg({
        type: 'success',
        text: language === 'sw' ? `Nembo imewekwa kwa mkono kwa vitambulisho vyote vya ${selectedCarrier}!` : `Manual logo applied to all ${selectedCarrier} cards!`
      });
      onLogoUpdated?.(previewUrl);
    }

    setTimeout(() => {
      onClose();
    }, 1000);
  };

  // Reset to default vector logo
  const handleResetToDefault = () => {
    if (scope === 'card' && activeAgent) {
      SmartIdStore.updateTelecomAgentLogo(activeAgent.id, undefined);
    } else {
      SmartIdStore.resetCustomCarrierLogo(selectedCarrier);
    }
    setPreviewUrl('');
    setUrlInput('');
    setStatusMsg({
      type: 'success',
      text: language === 'sw' ? 'Nembo asilia ya mtandao imerejeshwa!' : 'Default vector logo restored!'
    });
    onLogoUpdated?.(undefined);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-[#0a192f] to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                {t.telecom_manual_logo_title}
              </h3>
              <p className="text-xs text-slate-300">
                {language === 'sw' ? 'Weka au badilisha nembo ya kampuni ya simu kwa mkono (Manual)' : 'Upload or customize carrier logo manually'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800">

          {/* Feedback Alert */}
          {statusMsg && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-top-1 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Scope Selector: This Card vs Global Operator */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              {language === 'sw' ? 'Wigo wa Nembo (Logo Scope)' : 'Where to Apply This Logo:'}
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setScope('card')}
                disabled={!activeAgent}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  scope === 'card'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                } ${!activeAgent ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${scope === 'card' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'}`}>
                    {scope === 'card' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-xs font-black text-slate-900 block truncate">
                    {t.telecom_card_custom_logo}
                  </span>
                </div>
                {activeAgent && (
                  <span className="text-[11px] text-slate-500 font-medium block mt-1 ml-6 truncate">
                    {activeAgent.ownerName} ({activeAgent.carrier})
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setScope('carrier')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  scope === 'carrier'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${scope === 'carrier' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'}`}>
                    {scope === 'carrier' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-xs font-black text-slate-900 block truncate">
                    {t.telecom_carrier_custom_logo}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium block mt-1 ml-6 truncate">
                  {selectedCarrier} (Vyote / All)
                </span>
              </button>
            </div>
          </div>

          {/* Carrier Selection Chips */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              {language === 'sw' ? 'Chagua Kampuni ya Simu' : 'Select Telecom Company:'}
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {(['Vodacom', 'Airtel', 'Tigo', 'Halotel', 'TTCL', 'Zantel'] as TelecomCarrier[]).map((c) => {
                const isCurrent = selectedCarrier === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setSelectedCarrier(c);
                      const saved = SmartIdStore.getCarrierLogo(c);
                      if (saved) setPreviewUrl(saved);
                    }}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      isCurrent
                        ? 'border-emerald-600 bg-emerald-50 shadow-xs ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <TelecomLogo carrier={c} size="sm" variant="icon" />
                    <span className="text-[10px] font-extrabold text-slate-800">{c}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upload Method 1: Local File Picker (PNG, JPG, SVG) */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              1. {t.telecom_upload_logo}
            </label>
            
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 rounded-2xl p-6 text-center transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white group-hover:bg-emerald-100 text-slate-600 group-hover:text-emerald-700 shadow-xs border border-slate-200 mx-auto flex items-center justify-center mb-3 transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-xs font-extrabold text-slate-800 block">
                {t.telecom_logo_drag_drop}
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">
                PNG, JPG, SVG, WebP (Upeo 3MB) · Uwazi (Transparent Background inapendekezwa)
              </span>
            </div>
          </div>

          {/* Upload Method 2: Image URL input */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              2. {t.telecom_logo_url_input}
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/carrier-logo.png"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Pakia / Fetch
              </button>
            </div>
          </div>

          {/* Live Preview & Comparison */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span>Hakikisho la Nembo kwenye Kadi (Live Card Preview)</span>
              </label>

              {previewUrl && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  {t.telecom_custom_logo_badge}
                </span>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Logo Display Box */}
                <div className="w-14 h-14 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-md overflow-hidden border border-white/20 shrink-0">
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Custom Preview" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <TelecomLogo carrier={selectedCarrier} size="lg" variant="icon" />
                  )}
                </div>

                <div>
                  <span className="text-xs font-black text-white block">
                    {TELECOM_CARRIERS[selectedCarrier].name}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">
                    {previewUrl ? '★ Nembo ya Mkono (Custom Upload)' : '✔ Nembo Asilia ya Mtandao (Default Vector)'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {TELECOM_CARRIERS[selectedCarrier].moneyBrand}
                  </span>
                </div>
              </div>

              {previewUrl && (
                <button
                  type="button"
                  onClick={() => setPreviewUrl('')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  title="Futa Nembo Hii"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Futa</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>{t.telecom_reset_default_logo}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
            >
              Funga (Cancel)
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Hifadhi Nembo (Save Logo)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
