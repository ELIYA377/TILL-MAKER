import React from 'react';
import { 
  LayoutDashboard, 
  UserPlus, 
  Users, 
  ShieldCheck, 
  CreditCard, 
  Settings, 
  Globe, 
  LogOut,
  CheckCircle2,
  Menu,
  X,
  Smartphone,
  Radio
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import sealImage from '../../assets/images/coat_of_arms_seal_1790750477491.jpg';

export type ActiveTab = 'dashboard' | 'telecom' | 'generator' | 'register' | 'directory' | 'verify' | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { language, toggleLanguage, t } = useLanguage();

  const navItems = [
    { id: 'dashboard', label: t.nav_dashboard, icon: LayoutDashboard, badge: undefined },
    { id: 'telecom', label: t.nav_telecom_ids, icon: Smartphone, badge: 'TZ MNOs' },
    { id: 'generator', label: t.nav_generator, icon: CreditCard, badge: undefined },
    { id: 'register', label: t.nav_register, icon: UserPlus, badge: undefined },
    { id: 'directory', label: t.nav_directory, icon: Users, badge: undefined },
    { id: 'verify', label: t.nav_verify, icon: ShieldCheck, badge: undefined },
    { id: 'settings', label: t.nav_settings, icon: Settings, badge: undefined },
  ] as const;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container: Dark blue background with green accents */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 text-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Top Branding Section */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-800 border border-emerald-500/30 p-1.5 shadow-md flex items-center justify-center shrink-0">
                <img 
                  src={sealImage} 
                  alt="Tanzania Crest" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight text-white leading-tight">
                  {t.app_title}
                </h1>
                <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase block mt-0.5">
                  SMART ID SYSTEM
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button 
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-mono">TZ-NIDA REGISTRY</span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ONLINE</span>
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`
                  w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer
                  ${isActive 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30 font-extrabold' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }
                `}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'}`} />
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className={`ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-white text-emerald-900' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isActive && !item.badge && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section: Bilingual Switcher & System Details */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/40">
          {/* Language Switcher Button */}
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Lugha / Language</span>
                <span className="text-xs font-bold text-white uppercase">{t.current_lang_label}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-xs"
            >
              {language === 'sw' ? 'EN' : 'SW'}
            </button>
          </div>

          <div className="text-[10px] text-slate-500 text-center leading-relaxed">
            Mamlaka ya Vitambulisho vya Taifa<br />
            United Republic of Tanzania · PKI v3.2
          </div>
        </div>
      </aside>
    </>
  );
};
