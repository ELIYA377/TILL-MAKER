import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Globe, 
  ShieldCheck, 
  CreditCard, 
  UserCheck, 
  UserPlus, 
  Users, 
  Settings, 
  LogOut,
  Bell,
  Search
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Sidebar, ActiveTab } from './Sidebar';
import { DashboardOverview } from './DashboardOverview';
import { UserRegistration } from './UserRegistration';
import { UserDirectorySearch } from './UserDirectorySearch';
import { DigitalIdCard } from './DigitalIdCard';
import { VerificationPortal } from './VerificationPortal';
import { TelecomIdPortal } from './TelecomIdPortal';
import { SettingsView } from './SettingsView';
import { SmartIdStore } from '../../services/smartIdStore';
import { NidaRecord } from '../../types';
import { PrintCertificateModal } from '../PrintCertificateModal';
import sealImage from '../../assets/images/coat_of_arms_seal_1790750477491.jpg';

export const SmartIdApp: React.FC = () => {
  const { language, toggleLanguage, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // All citizens from store
  const [citizens, setCitizens] = useState<NidaRecord[]>(() => SmartIdStore.getCitizens());

  // Currently selected citizen for Digital ID Card Generator
  const [selectedCitizen, setSelectedCitizen] = useState<NidaRecord>(() => {
    const list = SmartIdStore.getCitizens();
    return list[0];
  });

  // Query to auto-run on Verification Portal
  const [verificationTargetNin, setVerificationTargetNin] = useState<string>('19900315-11103-00001-21');

  // Official Certificate Verification Slip Modal
  const [certificateRecord, setCertificateRecord] = useState<NidaRecord | null>(null);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      const fresh = SmartIdStore.getCitizens();
      setCitizens(fresh);
      if (fresh.length > 0 && (!selectedCitizen || !fresh.some((c) => c.nin === selectedCitizen.nin))) {
        setSelectedCitizen(fresh[0]);
      }
    };
    window.addEventListener('smart_id_citizens_changed', handleUpdate);
    return () => window.removeEventListener('smart_id_citizens_changed', handleUpdate);
  }, [selectedCitizen]);

  // Navigate to Card Generator with citizen selected
  const handleSelectCitizenForCard = (citizen: NidaRecord) => {
    setSelectedCitizen(citizen);
    setActiveTab('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate to Verification Portal with NIN
  const handleNavigateToVerify = (nin: string) => {
    setVerificationTargetNin(nin);
    setActiveTab('verify');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open official certificate slip
  const handleOpenCertificate = (nin: string) => {
    const found = SmartIdStore.getCitizenByNin(nin);
    if (found) {
      setCertificateRecord(found);
      setIsCertificateModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex font-sans selection:bg-emerald-600 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Bar Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs h-18 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
                {activeTab === 'dashboard' && t.nav_dashboard}
                {activeTab === 'telecom' && t.nav_telecom_ids}
                {activeTab === 'register' && t.nav_register}
                {activeTab === 'directory' && t.nav_directory}
                {activeTab === 'verify' && t.nav_verify}
                {activeTab === 'generator' && t.nav_generator}
                {activeTab === 'settings' && t.nav_settings}
              </h2>
              <span className="text-[11px] text-slate-400 font-medium hidden sm:block">
                {t.app_title} · United Republic of Tanzania
              </span>
            </div>
          </div>

          {/* Right Header Zone: Language Switcher, Gateway Status & Active Admin */}
          <div className="flex items-center gap-3">
            {/* Quick Language Toggle Pill */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
              title={t.lang_toggle_label}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'sw' ? 'SW' : 'EN'}</span>
              <span className="text-[10px] text-slate-400 font-normal">({t.current_lang_label})</span>
            </button>

            {/* Officer Terminal Badge */}
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200 text-left">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                TZ
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  Officer Terminal
                </span>
                <span className="text-[10px] text-emerald-600 font-bold block">
                  NIDA & TCRA Gateway
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              onNavigateTab={setActiveTab}
              onSelectCitizenForCard={handleSelectCitizenForCard}
              onOpenCertificateModal={handleOpenCertificate}
            />
          )}

          {activeTab === 'telecom' && (
            <TelecomIdPortal
              onOpenCertificateModal={handleOpenCertificate}
            />
          )}

          {activeTab === 'register' && (
            <UserRegistration
              onRegistrationSuccess={(citizen) => {
                setSelectedCitizen(citizen);
              }}
              onNavigateToCard={handleSelectCitizenForCard}
            />
          )}

          {activeTab === 'directory' && (
            <UserDirectorySearch
              onSelectCitizenForCard={handleSelectCitizenForCard}
              onOpenCertificateModal={handleOpenCertificate}
              onNavigateToVerify={handleNavigateToVerify}
            />
          )}

          {activeTab === 'generator' && (
            <DigitalIdCard
              citizen={selectedCitizen || citizens[0]}
              allCitizens={citizens}
              onSelectCitizen={setSelectedCitizen}
              onOpenCertificateModal={handleOpenCertificate}
            />
          )}

          {activeTab === 'verify' && (
            <VerificationPortal
              initialQuery={verificationTargetNin}
              onOpenCertificateModal={handleOpenCertificate}
              onSelectCitizenForCard={handleSelectCitizenForCard}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Official Certificate Verification Slip Modal */}
      {isCertificateModalOpen && certificateRecord && (
        <PrintCertificateModal
          record={certificateRecord}
          onClose={() => setIsCertificateModalOpen(false)}
        />
      )}
    </div>
  );
};
