import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Clock, 
  Activity, 
  UserPlus, 
  Search, 
  ArrowRight, 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle,
  Server,
  Lock,
  ExternalLink,
  ChevronRight,
  Smartphone
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SmartIdStore } from '../../services/smartIdStore';
import { NidaRecord, TelecomCarrier } from '../../types';
import { ActiveTab } from './Sidebar';
import { TelecomLogo, detectCarrierFromPhone, TELECOM_CARRIERS } from './TelecomLogos';

interface DashboardOverviewProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onSelectCitizenForCard: (citizen: NidaRecord) => void;
  onOpenCertificateModal: (nin: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigateTab,
  onSelectCitizenForCard,
  onOpenCertificateModal,
}) => {
  const { t } = useLanguage();
  const [metrics, setMetrics] = useState(() => SmartIdStore.getMetrics());
  const [recentCitizens, setRecentCitizens] = useState<NidaRecord[]>([]);

  const loadData = () => {
    setMetrics(SmartIdStore.getMetrics());
    const all = SmartIdStore.getCitizens();
    setRecentCitizens(all.slice(0, 5));
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('smart_id_citizens_changed', handleUpdate);
    return () => window.removeEventListener('smart_id_citizens_changed', handleUpdate);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome / Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-[#0c2340] to-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{t.gov_badge}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {t.dash_hero_title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t.dash_hero_desc}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateTab('telecom')}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-blue-900/30 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap border border-blue-500/40"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>{t.nav_telecom_ids} (MNOs)</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('register')}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t.dash_quick_register}</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('verify')}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t.dash_quick_verify}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TANZANIAN TELECOM OPERATORS SHOWCASE STRIP                                */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h3 className="text-xs font-black text-slate-900 tracking-wider uppercase">
                Makampuni ya Simu Tanzania (MNOs) & Nembo Rasmi
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Nembo rasmi za Vodacom, Airtel, Tigo/Yas, Halotel, TTCL, na Zantel kwa ajili ya Mawakala, Wasajili na Wafanyakazi.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('telecom')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Fungua Mfumo wa Vitambulisho vya Simu</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3">
          {(['Vodacom', 'Airtel', 'Tigo', 'Halotel', 'TTCL', 'Zantel'] as TelecomCarrier[]).map((c) => {
            const meta = TELECOM_CARRIERS[c];
            return (
              <button
                key={c}
                type="button"
                onClick={() => onNavigateTab('telecom')}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-slate-50 transition-all flex flex-col items-center text-center gap-2 cursor-pointer group shadow-2xs"
              >
                <TelecomLogo carrier={c} size="md" variant="icon" />
                <div>
                  <span className="text-xs font-black text-slate-900 block group-hover:text-emerald-700 transition-colors">
                    {meta.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold block">
                    {meta.moneyBrand}
                  </span>
                </div>
                <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full mt-auto">
                  {meta.prefixes[0]}x Laini
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4 PRIMARY METRIC CARDS                                                    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Metric 1: Total Registered Users */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t.metric_total_users}
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tabular-nums">
              {metrics.total.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-600">Enrolled</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Civil Registry Database</span>
            <button 
              onClick={() => onNavigateTab('directory')}
              className="font-bold text-blue-900 hover:underline"
            >
              View List &rarr;
            </button>
          </div>
        </div>

        {/* Metric 2: Active IDs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t.metric_active_ids}
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-emerald-600 font-mono tabular-nums">
              {metrics.active.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {Math.round((metrics.active / (metrics.total || 1)) * 100)}% Active
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Validated by TCRA Biometrics
          </div>
        </div>

        {/* Metric 3: Pending Verification */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t.metric_pending}
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-amber-600 font-mono tabular-nums">
              {metrics.pending.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-amber-700">Review Required</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Awaiting Document Verification
          </div>
        </div>

        {/* Metric 4: System Status Metrics */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t.metric_system_status}
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {metrics.uptime}
            </span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Optimal</span>
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between font-mono">
            <span>TCRA: SYNCED</span>
            <span>LATENCY: 14ms</span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SECOND ROW: RECENT CITIZEN ENROLLMENTS & SYSTEM HEALTH BREAKDOWN          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Recent Registrations Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                {t.dash_recent_registrations}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.dash_recent_sub}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('directory')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>{t.dash_view_all}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase">
                  <th className="py-2.5 px-3">{t.col_citizen}</th>
                  <th className="py-2.5 px-3">{t.col_nin}</th>
                  <th className="py-2.5 px-3">{t.col_phone}</th>
                  <th className="py-2.5 px-3">{t.col_status}</th>
                  <th className="py-2.5 px-3 text-right">{t.col_actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentCitizens.map((citizen) => (
                  <tr key={citizen.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
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
                          <span className="text-[10px] text-slate-400">
                            {citizen.residence.region}, {citizen.residence.district}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                      {citizen.nin}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <TelecomLogo carrier={detectCarrierFromPhone(citizen.primaryPhone)} size="sm" variant="icon" />
                        <span className="font-mono text-slate-800 font-bold">{citizen.primaryPhone}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        citizen.verificationStatus === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : citizen.verificationStatus === 'PENDING_UPDATE' || citizen.verificationStatus === 'PROVISIONAL'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {citizen.verificationStatus}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectCitizenForCard(citizen);
                          onNavigateTab('generator');
                        }}
                        className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                        title="Tengeneza Smart ID Card"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span className="text-[11px] hidden sm:inline">Kadi</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Distribution & System Health Info */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status Breakdown Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">
              {t.dash_distribution_title}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Verified & Active</span>
                  <span className="font-mono">{metrics.active} / {metrics.total}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((metrics.active / (metrics.total || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Pending Verification</span>
                  <span className="font-mono">{metrics.pending} / {metrics.total}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((metrics.pending / (metrics.total || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Restricted / Flags</span>
                  <span className="font-mono">{metrics.restricted} / {metrics.total}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((metrics.restricted / (metrics.total || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Infrastructure Specs */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3 text-xs">
            <h3 className="text-sm font-extrabold text-slate-900">
              {t.dash_system_health}
            </h3>

            <div className="space-y-2 text-slate-600">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span>{t.metric_tcra}</span>
                <span className="font-mono font-bold text-emerald-600">ONLINE (SYNC)</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span>{t.metric_security}</span>
                <span className="font-mono font-bold text-slate-800">TLS 1.3 · 256-Bit</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span>{t.metric_last_audit}</span>
                <span className="font-mono text-slate-500">{metrics.lastAuditCheck}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
