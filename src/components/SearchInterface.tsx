import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Fingerprint, 
  Sparkles, 
  HelpCircle, 
  Phone, 
  User, 
  CreditCard, 
  Radio, 
  Zap,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  BadgeCheck
} from 'lucide-react';
import { detectCarrier, normalizePhoneNumber } from '../data/mockRecords';
import { SearchInputMode } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { 
  validateTanzanianNin, 
  formatTanzanianNin, 
  extractNinDigits, 
  isLikelyPhoneNumber 
} from '../utils/ninValidator';

interface SearchInterfaceProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  currentQuery?: string;
  onModeChange?: (mode: SearchInputMode) => void;
}

export const SearchInterface: React.FC<SearchInterfaceProps> = ({
  onSearch,
  isLoading,
  currentQuery = '',
}) => {
  const { language } = useLanguage();
  const [searchInput, setSearchInput] = useState(currentQuery);
  const [searchMode, setSearchMode] = useState<SearchInputMode>('auto');
  const [showTips, setShowTips] = useState(false);
  const [autoFormattedBanner, setAutoFormattedBanner] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Analyze searchInput dynamically using client-side validation logic
  const ninValidation = validateTanzanianNin(searchInput);
  const isPhone = isLikelyPhoneNumber(searchInput);

  useEffect(() => {
    if (currentQuery && currentQuery !== searchInput) {
      setSearchInput(currentQuery);
    }
  }, [currentQuery]);

  /**
   * Handle user input with smart client-side NIN pattern detection & auto-formatting
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;

    // Check if input is a phone number (e.g. starts with 07, 06, +255)
    // If so, do not format as NIN
    if (isLikelyPhoneNumber(rawVal) && searchMode !== 'nin') {
      setSearchInput(rawVal);
      setAutoFormattedBanner(null);
      return;
    }

    // If searchMode is explicitly 'name', don't format as NIN unless mode is changed
    if (searchMode === 'name' && !/^\d/.test(rawVal.trim())) {
      setSearchInput(rawVal);
      setAutoFormattedBanner(null);
      return;
    }

    // Check if user is typing numeric digits that match or could match a NIN (e.g. 1994..., 2001...)
    const digitsOnly = extractNinDigits(rawVal);
    const startsWithBirthYear = /^(19|20)\d*/.test(digitsOnly);
    const isNinMode = searchMode === 'nin';

    // If user is typing in NIN mode, or starts typing year pattern (19XX or 20XX), or pasted raw digits:
    if ((isNinMode && digitsOnly.length > 0) || (startsWithBirthYear && digitsOnly.length >= 4) || digitsOnly.length > 10) {
      // Auto-format into YYYYMMDD-XXXXX-XXXXX-XX pattern
      const formatted = formatTanzanianNin(rawVal);
      setSearchInput(formatted);

      if (digitsOnly.length >= 8 && searchMode === 'auto') {
        setSearchMode('nin');
      }

      if (digitsOnly.length === 20) {
        setAutoFormattedBanner(language === 'sw' ? 'NIN ya Kitanzania imetambuliwa na kupangwa kikamilifu (20 digits)!' : 'Tanzanian NIN detected and structured (20 digits)!');
      } else {
        setAutoFormattedBanner(null);
      }
      return;
    }

    // Default regular input for names or free-form search
    setSearchInput(rawVal);
    setAutoFormattedBanner(null);
  };

  /**
   * Quick keydown handling: Enter submits
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim() || isLoading) return;
    onSearch(searchInput.trim());
  };

  const handleClear = () => {
    setSearchInput('');
    setAutoFormattedBanner(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSampleClick = (sample: string, mode?: SearchInputMode) => {
    if (mode === 'nin') {
      const formatted = formatTanzanianNin(sample);
      setSearchInput(formatted);
      setSearchMode('nin');
      onSearch(formatted);
    } else {
      setSearchInput(sample);
      if (mode) setSearchMode(mode);
      onSearch(sample);
    }
  };

  // Detect telecom carrier dynamically if phone
  const cleanedPhone = normalizePhoneNumber(searchInput);
  const isLikelyPhoneOnly = /^0[67]\d{2,8}$/.test(cleanedPhone) || /^\+?255[67]\d{2,8}$/.test(searchInput.replace(/\s+/g, ''));
  const detectedCarrier = isLikelyPhoneOnly ? detectCarrier(cleanedPhone) : null;

  // Sample presets tailored to Tanzania NIDA & Phone lookups
  const samplePresets = [
    { label: '0784 615 052 (Digital Sales)', id: '0784615052', mode: 'phone' as SearchInputMode },
    { label: '0754 112 233 (Vodacom)', id: '0754112233', mode: 'phone' as SearchInputMode },
    { label: '19900315-11103-00001-21', id: '19900315111030000121', mode: 'nin' as SearchInputMode },
    { label: '19941208-14205-00129-22', id: '19941208142050012922', mode: 'nin' as SearchInputMode },
    { label: 'Eliya Amos Mwakyusa', id: 'Eliya Amos Mwakyusa', mode: 'name' as SearchInputMode },
  ];

  const getPlaceholderText = () => {
    if (language === 'en') {
      switch (searchMode) {
        case 'phone':
          return 'Enter phone number e.g. 0784615052 or +255...';
        case 'nin':
          return 'Enter 20-digit NIN (auto-formats: YYYYMMDD-XXXXX-XXXXX-XX)...';
        case 'name':
          return 'Enter citizen full names e.g. Juma Hamisi Bakari...';
        default:
          return 'Enter Mobile Phone, NIDA (NIN), or Full Name...';
      }
    }
    switch (searchMode) {
      case 'phone':
        return 'Weka namba ya simu mf. 0784615052 au +255...';
      case 'nin':
        return 'Weka NIN (itapangwa kiotomatiki: YYYYMMDD-XXXXX-XXXXX-XX)...';
      case 'name':
        return 'Ingiza majina kamili ya mwananchi mf. Juma Hamisi Bakari...';
      default:
        return 'Weka Namba ya Simu, NIDA (NIN), au Jina Kamili...';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative rounded-2xl bg-[#0F141C]/85 backdrop-blur-xl border border-amber-500/25 p-4 md:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-emerald-500/10 -z-10 blur-sm pointer-events-none" />

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-300">
            <Fingerprint className="w-4 h-4 text-emerald-400" />
            <span className="uppercase tracking-wider font-mono text-[11px] text-amber-300 font-bold">
              {language === 'sw' ? 'Utafutaji NIDA & Usajili wa Laini za Simu' : 'NIDA Lookup & SIM Biometric Verification'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowTips(!showTips)}
            className="text-[11px] text-neutral-400 hover:text-amber-300 transition-colors flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showTips ? (language === 'sw' ? 'Ficha maelekezo' : 'Hide instructions') : (language === 'sw' ? 'Msaada wa muundo wa NIN' : 'NIN format guide')}</span>
          </button>
        </div>

        {/* Search Mode Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-950/80 rounded-xl border border-neutral-800/90 mb-4 text-xs font-mono">
          <button
            type="button"
            onClick={() => setSearchMode('auto')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              searchMode === 'auto'
                ? 'bg-gradient-to-r from-amber-500/20 to-emerald-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'sw' ? 'Zote (Auto Detect)' : 'All (Auto Detect)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setSearchMode('phone')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              searchMode === 'phone'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'sw' ? 'Namba ya Simu (Phone)' : 'Phone Number'}</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/30 text-emerald-300">NEW</span>
          </button>

          {/* Dedicated NIN Tab with auto-format indicator */}
          <button
            type="button"
            onClick={() => {
              setSearchMode('nin');
              if (searchInput && !isPhone) {
                setSearchInput(formatTanzanianNin(searchInput));
              }
            }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              searchMode === 'nin'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'sw' ? 'Namba ya NIDA (NIN)' : 'NIDA Number (NIN)'}</span>
            <span className="px-1 py-0.2 rounded text-[8px] bg-amber-500/30 text-amber-300 font-mono">
              AUTO-FORMAT
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSearchMode('name')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              searchMode === 'name'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'sw' ? 'Jina Kamili (Name)' : 'Full Name'}</span>
          </button>
        </div>

        {/* Collapsible Format Tips */}
        {showTips && (
          <div className="mb-4 p-3.5 rounded-xl bg-neutral-950/90 border border-amber-500/30 text-xs text-neutral-300 space-y-2">
            <p className="font-semibold text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> {language === 'sw' ? 'Mfumo wa Namba ya NIDA (Tanzanian NIN Format):' : 'Tanzanian NIN Pattern & Rules:'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-neutral-400">
              <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                <strong className="text-amber-300 block mb-1">Muundo Rasmi (Pattern):</strong>
                <span className="font-mono text-amber-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800 inline-block font-bold">
                  YYYYMMDD-XXXXX-XXXXX-XX
                </span>
                <p className="mt-1 text-[10px] text-neutral-400">
                  Tarakimu 20 (Mwaka, Mwezi, Siku ya kuzaliwa, Msimbo wa Eneo, Namba ya Utambulisho, na Herufi za Ukaguzi).
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                <strong className="text-emerald-400 block mb-1">Mpangilio wa Kiotomatiki (Auto-Format):</strong>
                <p className="text-[10px] leading-relaxed text-neutral-300">
                  Andika tarakimu tu bila kupiga mikwaju au mistari (mf. <code className="text-amber-300 font-mono">19900315111030000121</code>). Mfumo utaweka mikwaju kiotomatiki kwa usindikaji wa haraka!
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                <strong className="text-cyan-400 block mb-1">Uthibitishaji wa Kalenda:</strong>
                <p className="text-[10px] leading-relaxed text-neutral-300">
                  Tarakimu 8 za mwanzo zinakaguliwa kuhakikisha tarehe ya kuzaliwa (<span className="font-mono text-neutral-200">YYYYMMDD</span>) ipo kihalali kwenye kalenda.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search Input Box with Live Validation Indicators */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-stretch">
          <div className="relative flex-1 group">
            {/* Input icon dynamically switches to credit card or phone */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500 group-focus-within:text-amber-400 transition-colors">
              {searchMode === 'phone' || isLikelyPhoneOnly ? (
                <Phone className="w-5 h-5 text-emerald-400 animate-pulse" />
              ) : ninValidation.isNinPattern || searchMode === 'nin' ? (
                <CreditCard className={`w-5 h-5 ${ninValidation.isValidCompleteNin ? 'text-emerald-400' : 'text-amber-400'}`} />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </div>

            {/* Smart Search Input */}
            <input
              ref={inputRef}
              type="text"
              value={searchInput}
              onChange={handleInputChange}
              placeholder={getPlaceholderText()}
              disabled={isLoading}
              className={`w-full h-13 pl-12 pr-32 bg-neutral-950/90 text-neutral-100 placeholder:text-neutral-500 rounded-xl border text-sm md:text-base outline-none transition-all shadow-inner font-sans tracking-wide ${
                ninValidation.isValidCompleteNin
                  ? 'border-emerald-500/80 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/25'
                  : ninValidation.error
                  ? 'border-red-500/70 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
                  : ninValidation.isNinPattern
                  ? 'border-amber-500/60 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25'
                  : 'border-neutral-700/80 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20'
              }`}
            />

            {/* Right inside badges: Live Validation Status, Carrier Detection, or Clear Button */}
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {/* If Tanzanian NIN is detected, show completion status */}
              {ninValidation.isNinPattern && (
                <div className="hidden sm:flex items-center gap-1.5">
                  {ninValidation.isValidCompleteNin ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/50 text-[10px] font-mono font-bold text-emerald-300 animate-in fade-in">
                      <BadgeCheck className="w-3 h-3 text-emerald-400" />
                      <span>VALID NIN</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono text-amber-300">
                      <span>{ninValidation.rawDigits.length}/20</span>
                    </span>
                  )}
                </div>
              )}

              {/* Carrier badge if phone */}
              {detectedCarrier && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-300">
                  <Radio className="w-2.5 h-2.5 text-emerald-400 animate-ping" />
                  {detectedCarrier}
                </span>
              )}

              {/* Clear button */}
              {searchInput && !isLoading && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 text-neutral-400 hover:text-neutral-100 rounded-md hover:bg-neutral-800 transition-colors cursor-pointer"
                  title="Futa / Clear"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Glowing Search/Submit Button with Green & Gold Gradients */}
          <button
            type="submit"
            disabled={isLoading || !searchInput.trim()}
            className="relative h-13 px-6 md:px-8 rounded-xl font-bold text-sm tracking-wide text-neutral-950 bg-gradient-to-r from-emerald-400 via-yellow-400 to-amber-500 hover:from-emerald-300 hover:via-yellow-300 hover:to-amber-400 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 shadow-[0_0_24px_rgba(16,185,129,0.35),0_0_12px_rgba(245,158,11,0.25)] hover:shadow-[0_0_32px_rgba(16,185,129,0.5),0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 shrink-0 cursor-pointer overflow-hidden group"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform" />

            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                <span>{language === 'sw' ? 'INAKAGUA...' : 'CHECKING...'}</span>
              </>
            ) : (
              <>
                {searchMode === 'phone' ? (
                  <Phone className="w-4 h-4 stroke-[2.5]" />
                ) : ninValidation.isValidCompleteNin ? (
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <Search className="w-4 h-4 stroke-[2.5]" />
                )}
                <span>
                  {searchMode === 'phone' 
                    ? (language === 'sw' ? 'TAFUTA KWA SIMU' : 'LOOKUP BY PHONE') 
                    : ninValidation.isValidCompleteNin
                    ? (language === 'sw' ? 'KAGUA NIN HII' : 'VERIFY THIS NIN')
                    : (language === 'sw' ? 'KAGUA REJISTA' : 'QUERY REGISTRY')}
                </span>
              </>
            )}
          </button>
        </form>

        {/* Live Client-Side NIN Parsing & Progress Feedback Card */}
        {ninValidation.isNinPattern && searchInput.trim().length > 0 && (
          <div className="mt-3 p-3 rounded-xl bg-neutral-950/90 border border-neutral-800 text-xs font-mono animate-in fade-in duration-200 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-neutral-400 font-bold">
                  {language === 'sw' ? 'Muundo wa NIN unaotambuliwa:' : 'Detected NIN Pattern:'}
                </span>
                <span className="font-black text-amber-300 tracking-wider">
                  {ninValidation.formattedNin}
                </span>
              </div>

              {/* Progress Bar of Digits (X / 20) */}
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      ninValidation.isValidCompleteNin ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                    style={{ width: `${ninValidation.progressPercent}%` }}
                  />
                </div>
                <span className="text-[11px] text-neutral-400">
                  {ninValidation.rawDigits.length}/20 digits
                </span>
              </div>
            </div>

            {/* Sub-details: Parsed DOB date and validation state */}
            <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-neutral-900 text-[11px]">
              {ninValidation.parsedDob && (
                <div className="flex items-center gap-1.5 text-neutral-300">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {language === 'sw' ? 'Tarehe ya Kuzaliwa:' : 'Birth Date:'}{' '}
                    <strong className="text-emerald-300">{ninValidation.parsedDob.dateString}</strong>
                  </span>
                </div>
              )}

              {ninValidation.error && (
                <div className="flex items-center gap-1 text-red-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{ninValidation.error}</span>
                </div>
              )}

              {ninValidation.isValidCompleteNin && (
                <div className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{language === 'sw' ? 'Muundo kamili wa tarakimu 20 umeidhinishwa!' : 'Full 20-digit pattern ready for instant query!'}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Sample Presets */}
        <div className="mt-4 pt-3 border-t border-neutral-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-neutral-400 text-[11px] font-medium mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{language === 'sw' ? 'Mifano ya Haraka:' : 'Quick Samples:'}</span>
          </span>
          {samplePresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSampleClick(preset.id, preset.mode)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-md bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/50 text-neutral-300 hover:text-amber-300 text-[11px] font-mono transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {preset.mode === 'phone' ? (
                <Phone className="w-3 h-3 text-emerald-400" />
              ) : preset.mode === 'nin' ? (
                <CreditCard className="w-3 h-3 text-amber-400" />
              ) : (
                <User className="w-3 h-3 text-amber-400" />
              )}
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
