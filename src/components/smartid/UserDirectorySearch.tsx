import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  CreditCard, 
  ShieldCheck, 
  Printer, 
  Copy, 
  Check, 
  SlidersHorizontal, 
  UserCheck, 
  Phone, 
  MapPin, 
  Eye, 
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SmartIdStore } from '../../services/smartIdStore';
import { NidaRecord, VerificationStatus, TelecomCarrier } from '../../types';
import { TelecomLogo, detectCarrierFromPhone, TELECOM_CARRIERS } from './TelecomLogos';

interface UserDirectorySearchProps {
  onSelectCitizenForCard: (citizen: NidaRecord) => void;
  onOpenCertificateModal: (nin: string) => void;
  onNavigateToVerify: (nin: string) => void;
}

export const UserDirectorySearch: React.FC<UserDirectorySearchProps> = ({
  onSelectCitizenForCard,
  onOpenCertificateModal,
  onNavigateToVerify,
}) => {
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING_UPDATE' | 'RESTRICTED'>('ALL');
  const [carrierFilter, setCarrierFilter] = useState<TelecomCarrier | 'ALL'>('ALL');
  const [citizens, setCitizens] = useState<NidaRecord[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = () => {
    let results = SmartIdStore.searchCitizens(searchQuery, statusFilter);
    if (carrierFilter !== 'ALL') {
      results = results.filter((c) => detectCarrierFromPhone(c.primaryPhone) === carrierFilter);
    }
    setCitizens(results);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('smart_id_citizens_changed', handleUpdate);
    return () => window.removeEventListener('smart_id_citizens_changed', handleUpdate);
  }, [searchQuery, statusFilter, carrierFilter]);

  const handleCopyNin = (nin: string, id: string) => {
    navigator.clipboard.writeText(nin);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleToggleStatus = (citizen: NidaRecord) => {
    const nextStatus: VerificationStatus = 
      citizen.verificationStatus === 'VERIFIED' ? 'RESTRICTED' : 'VERIFIED';
    SmartIdStore.updateStatus(citizen.nin, nextStatus);
    loadData();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Search Header Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {t.search_title}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {t.search_subtitle}
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg self-start sm:self-center font-mono">
            {t.search_count_label} <strong className="text-emerald-700 font-bold">{citizens.length}</strong>
          </div>
        </div>

        {/* Fast Search Input Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.search_input_placeholder}
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-medium text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.search_filter_all}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('VERIFIED')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'VERIFIED' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.search_filter_verified}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('PENDING_UPDATE')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'PENDING_UPDATE' ? 'bg-amber-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.search_filter_pending}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('RESTRICTED')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'RESTRICTED' ? 'bg-red-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.search_filter_restricted}
          </button>
        </div>

        {/* Telecom Operator Carrier Filter Strip */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs font-semibold pb-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap mr-1">
            Mitandao ya Simu:
          </span>
          <button
            type="button"
            onClick={() => setCarrierFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer text-xs ${
              carrierFilter === 'ALL'
                ? 'bg-slate-900 text-white font-extrabold shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Yote
          </button>
          {(['Vodacom', 'Airtel', 'Tigo', 'Halotel', 'TTCL', 'Zantel'] as TelecomCarrier[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCarrierFilter(c)}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer text-xs ${
                carrierFilter === c
                  ? 'bg-emerald-600 text-white font-extrabold shadow-2xs ring-2 ring-emerald-500/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <TelecomLogo carrier={c} size="sm" variant="icon" />
              <span>{c}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Citizens Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {citizens.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">
              {t.no_citizens_found}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
              className="px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              Futa Vichungi (Clear Filters)
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">{t.col_citizen}</th>
                  <th className="py-3 px-4">{t.col_nin}</th>
                  <th className="py-3 px-4">{t.col_phone}</th>
                  <th className="py-3 px-4">{t.col_residence}</th>
                  <th className="py-3 px-4">{t.col_status}</th>
                  <th className="py-3 px-4 text-right">{t.col_actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {citizens.map((citizen) => (
                  <tr key={citizen.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* Citizen Photo & Full Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-xs">
                          <img 
                            src={citizen.avatarUrl} 
                            alt={citizen.fullName} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 leading-tight">
                            {citizen.fullName}
                          </p>
                          <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                            DOB: {citizen.dateOfBirth} · {citizen.gender}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* NIN with Copy Button */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-blue-900 text-xs">
                          {citizen.nin}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyNin(citizen.nin, citizen.id)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                          title="Copy NIN"
                        >
                          {copiedId === citizen.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono block">
                        DOC: {citizen.documentNumber}
                      </span>
                    </td>

                    {/* Phone & Carrier Logo */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <TelecomLogo carrier={detectCarrierFromPhone(citizen.primaryPhone)} size="sm" variant="icon" />
                        <div>
                          <span className="font-mono font-bold text-slate-900 block leading-tight">
                            {citizen.primaryPhone}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold block">
                            {detectCarrierFromPhone(citizen.primaryPhone)} · TCRA Verified
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Residence */}
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                      <span className="font-semibold block">{citizen.residence.region}</span>
                      <span className="text-[10px] text-slate-400">{citizen.residence.district}, {citizen.residence.ward}</span>
                    </td>

                    {/* Status badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        citizen.verificationStatus === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : citizen.verificationStatus === 'PENDING_UPDATE' || citizen.verificationStatus === 'PROVISIONAL'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {citizen.verificationStatus === 'VERIFIED' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {citizen.verificationStatus !== 'VERIFIED' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                        <span>{citizen.verificationStatus}</span>
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View / Generate Smart ID Card */}
                        <button
                          type="button"
                          onClick={() => onSelectCitizenForCard(citizen)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="Fungua Kadi ya Kidijitali"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>{t.action_view_card}</span>
                        </button>

                        {/* Verify Portal */}
                        <button
                          type="button"
                          onClick={() => onNavigateToVerify(citizen.nin)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="Hakiki kwenye Portal"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-900" />
                          <span>{t.action_verify}</span>
                        </button>

                        {/* Print Certificate Modal */}
                        <button
                          type="button"
                          onClick={() => onOpenCertificateModal(citizen.nin)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                          title="Print Official Slip"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
