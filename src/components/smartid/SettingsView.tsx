import React, { useState } from 'react';
import { 
  Settings, 
  Globe, 
  RotateCcw, 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  Server, 
  Lock,
  Clock,
  Check
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SmartIdStore } from '../../services/smartIdStore';

export const SettingsView: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [auditLogs, setAuditLogs] = useState(() => SmartIdStore.getAuditLogs());
  const [resetNotice, setResetNotice] = useState(false);

  const handleResetData = () => {
    SmartIdStore.resetSeedData();
    setAuditLogs(SmartIdStore.getAuditLogs());
    setResetNotice(true);
    setTimeout(() => setResetNotice(false), 3000);
  };

  const handleExportDatabase = () => {
    const data = {
      citizens: SmartIdStore.getCitizens(),
      audit: SmartIdStore.getAuditLogs(),
      exportedAt: new Date().toISOString(),
      system: 'NIDA Smart ID Management System v2.4',
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `NIDA_SmartID_Database_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Settings Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t.settings_title}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {t.settings_subtitle}
            </p>
          </div>
        </div>

        {/* Section 1: Bilingual Language Settings */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  {t.settings_lang_title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t.settings_lang_desc}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setLanguage('sw')}
              className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                language === 'sw'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">Kiswahili</span>
                {language === 'sw' && <Check className="w-4 h-4 text-emerald-600" />}
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">Lugha ya Taifa ya Tanzania</span>
            </button>

            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                language === 'en'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">English</span>
                {language === 'en' && <Check className="w-4 h-4 text-emerald-600" />}
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">Official International Language</span>
            </button>
          </div>
        </div>

        {/* Section 2: Database Management & Backup */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900">
            Kanzidata & Hifadhi ya Data (Database & Backup)
          </h3>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExportDatabase}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.settings_export_data}</span>
            </button>

            <button
              type="button"
              onClick={handleResetData}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-red-600 font-bold text-xs border border-red-200 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.settings_reset_data}</span>
            </button>
          </div>

          {resetNotice && (
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t.settings_reset_confirm}</span>
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Immutable Audit Trail */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            {t.settings_audit_title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.settings_audit_desc}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Actor / Terminal</th>
                <th className="py-2.5 px-3">Details</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-800">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-sans text-slate-600">
                    {log.actor}
                  </td>
                  <td className="py-3 px-3 font-sans text-slate-800 text-[11px]">
                    {log.details}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-[10px] font-bold text-emerald-600">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
