import React, { useState } from 'react';
import { 
  Search, 
  RotateCw, 
  Phone, 
  CreditCard, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Wallet,
  Clock,
  Printer,
  ChevronRight,
  HelpCircle,
  Zap
} from 'lucide-react';
import { SystemUser, NidaRecord, SearchQueryHistory } from '../../types';
import { SystemStore, REQUEST_COST_TSH } from '../../services/systemStore';
import { executeSinsoftLookup } from '../../services/apiService';
import { ResultCard } from '../ResultCard';
import { detectCarrier } from '../../data/mockRecords';
import { 
  formatTanzanianNin, 
  extractNinDigits, 
  isLikelyPhoneNumber, 
  validateTanzanianNin 
} from '../../utils/ninValidator';

interface DirectLookupViewProps {
  currentUser: SystemUser;
  onOpenCertificateModal: (nin: string) => void;
  onOpenTopupModal: () => void;
  onBalanceUpdated?: () => void;
}

export const DirectLookupView: React.FC<DirectLookupViewProps> = ({
  currentUser,
  onOpenCertificateModal,
  onOpenTopupModal,
  onBalanceUpdated,
}) => {
  const [queryInput, setQueryInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeRecord, setActiveRecord] = useState<NidaRecord | null>(null);
  const [matchedByType, setMatchedByType] = useState<'phone' | 'nin' | 'name' | null>(null);
  const [searchFeedback, setSearchFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [recentSearches, setRecentSearches] = useState<SearchQueryHistory[]>(() => {
    try {
      const saved = localStorage.getItem('sinsoft_recent_lookups');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const user = SystemStore.getUser(currentUser.phone) || currentUser;

  // Auto-detect format & carrier
  const cleanInput = queryInput.trim();
  const isPhone = isLikelyPhoneNumber(cleanInput);
  const detectedCarrier = isPhone ? detectCarrier(cleanInput) : null;
  const ninValidation = validateTanzanianNin(cleanInput);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (isLikelyPhoneNumber(raw)) {
      setQueryInput(raw);
      return;
    }
    const digits = extractNinDigits(raw);
    if ((/^(19|20)/.test(digits) && digits.length >= 4) || digits.length > 10) {
      setQueryInput(formatTanzanianNin(raw));
    } else {
      setQueryInput(raw);
    }
  };

  const performLookup = (searchTarget: string) => {
    const q = searchTarget.trim();
    if (!q) {
      setSearchFeedback({ type: 'error', message: 'Tafadhali ingiza NIN au namba ya simu.' });
      return;
    }

    if (user.credit < REQUEST_COST_TSH) {
      setSearchFeedback({
        type: 'error',
        message: `Salio halitoshi! Lookup inahitaji TSh ${REQUEST_COST_TSH.toFixed(2)}, lakini salio lako ni TSh ${user.credit.toFixed(2)}. Tafadhali weka salio.`,
      });
      return;
    }

    setIsSearching(true);
    setSearchFeedback(null);
    setActiveRecord(null);

    setTimeout(() => {
      const response = executeSinsoftLookup({
        query: q,
        userPhone: user.phone,
        deductCredit: true,
      });

      setIsSearching(false);

      if (response.success && response.data) {
        const d = response.data;
        const rec: NidaRecord = {
          id: `lookup-${Date.now()}`,
          nin: d.nin,
          fullName: d.full_name,
          firstName: d.first_name,
          middleName: d.middle_name,
          lastName: d.last_name,
          gender: d.gender,
          dateOfBirth: d.date_of_birth,
          age: d.age,
          primaryPhone: d.phone,
          registeredSims: d.registered_sims.map((sim) => ({
            msisdn: sim.msisdn,
            carrier: sim.carrier as any,
            biometricStatus: sim.biometric_status as any,
            registrationDate: sim.registration_date,
            simSerial: '892550109923847192',
            isPrimary: true,
          })),
          placeOfBirth: d.place_of_birth,
          nationality: d.nationality,
          citizenshipType: d.citizenship_type as any,
          verificationStatus: d.verification_status as any,
          issueDate: d.issue_date,
          expiryDate: d.expiry_date,
          documentNumber: d.document_number,
          fingerprintEnrolled: d.biometrics.fingerprint_enrolled,
          facialRecognitionMatched: d.biometrics.facial_matched,
          securityChecksum: d.security_checksum,
          residence: d.residence,
          avatarUrl: d.photo_url,
        };

        setActiveRecord(rec);
        setMatchedByType((response.query_type as any) || 'nin');
        setSearchFeedback({
          type: 'success',
          message: `Kitambulisho kimehakikiwa kikamilifu! TSh ${REQUEST_COST_TSH.toFixed(2)} imekatwa kutoka salio lako.`,
        });

        // Save to recent
        const newRecent: SearchQueryHistory = {
          query: q,
          queryType: response.query_type as any,
          timestamp: Date.now(),
          recordNin: rec.nin,
          recordName: rec.fullName,
          recordPhone: rec.primaryPhone,
          status: rec.verificationStatus,
        };
        const updatedRecent = [newRecent, ...recentSearches.filter((r) => r.recordNin !== rec.nin).slice(0, 7)];
        setRecentSearches(updatedRecent);
        try {
          localStorage.setItem('sinsoft_recent_lookups', JSON.stringify(updatedRecent));
        } catch {
          // ignore
        }

        onBalanceUpdated?.();
      } else {
        setSearchFeedback({
          type: 'error',
          message: response.message || 'Taarifa za NIDA hazikupatikana.',
        });
      }
    }, 400);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(queryInput);
  };

  return (
    <div className="space-y-6">
      {/* Search Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                sinsoft.online/id/lookup.php
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                ONLINE REGISTRY
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Tanzania NIDA Instant ID & SIM Lookup
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Tafuta taarifa kamili za mwananchi kwa kutumia namba ya NIDA (tarakimu 20) au namba ya simu ya mkononi.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-500">Gharama: </span>
              <strong className="text-blue-600 dark:text-blue-400 font-mono font-bold">
                TSh {REQUEST_COST_TSH.toFixed(2)} / lookup
              </strong>
            </div>
          </div>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="relative flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                {isPhone ? <Phone className="w-5 h-5 text-blue-500" /> : <CreditCard className="w-5 h-5 text-blue-500" />}
              </div>
              <input
                type="text"
                value={queryInput}
                onChange={handleInputChange}
                placeholder="Ingiza NIN (mfano: 19900315-11103-00001-21) au Simu (0754...)"
                className="w-full pl-12 pr-28 py-3.5 border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 text-slate-950 dark:text-white rounded-2xl font-mono text-sm font-bold focus:outline-none focus:border-blue-600 transition-colors placeholder:text-slate-400"
              />

              {/* Detected carrier or NIN badge inside input */}
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                {detectedCarrier ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                    {detectedCarrier}
                  </span>
                ) : ninValidation.isValidCompleteNin ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> 20-DIGIT NIN
                  </span>
                ) : null}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSearching || !queryInput.trim()}
              className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer shrink-0"
            >
              {isSearching ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Inatafuta...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Hakiki Sasa</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Mifano ya Haraka:</span>
            {[
              { label: 'NIN 1 (Juma Bakari)', val: '19900315-11103-00001-21' },
              { label: 'NIN 2 (Amina Saidi)', val: '19850720-31201-00045-18' },
              { label: 'Simu Vodacom', val: '0754112233' },
              { label: 'Simu Airtel', val: '0685994422' },
              { label: 'Simu Tigo', val: '0713445566' },
            ].map((p) => (
              <button
                key={p.val}
                type="button"
                onClick={() => {
                  setQueryInput(p.val);
                  performLookup(p.val);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-600 dark:text-slate-300 text-[11px] font-mono transition-colors cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </form>

        {/* Feedback Alert */}
        {searchFeedback && (
          <div
            className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between gap-2 ${
              searchFeedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {searchFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
              )}
              <span>{searchFeedback.message}</span>
            </div>

            {searchFeedback.type === 'error' && user.credit < REQUEST_COST_TSH && (
              <button
                type="button"
                onClick={onOpenTopupModal}
                className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shrink-0 transition-colors"
              >
                Weka Salio Sasa
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results Section */}
      {activeRecord && (
        <div className="space-y-4">
          <ResultCard
            record={activeRecord}
            onPrint={() => onOpenCertificateModal(activeRecord.nin)}
            onNewSearch={() => {
              setActiveRecord(null);
              setQueryInput('');
            }}
            matchedBy={matchedByType}
          />
        </div>
      )}

      {/* Recent Searches Tray */}
      {recentSearches.length > 0 && !activeRecord && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Historia ya Hivi Karibuni ({recentSearches.length})</span>
            </h3>
            <button
              type="button"
              onClick={() => {
                setRecentSearches([]);
                localStorage.removeItem('sinsoft_recent_lookups');
              }}
              className="text-[11px] font-bold text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              Futa Historia
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {recentSearches.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setQueryInput(item.recordNin);
                  performLookup(item.recordNin);
                }}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-slate-200 dark:border-slate-700/60 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="space-y-0.5 overflow-hidden">
                  <p className="font-extrabold text-xs text-slate-800 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {item.recordName}
                  </p>
                  <p className="font-mono text-[10px] text-slate-400 truncate">
                    {item.recordNin}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
