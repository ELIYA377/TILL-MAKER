import React from 'react';
import { ShieldCheck, Activity, Lock, Cpu } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const HeaderMarquee: React.FC = () => {
  const { t } = useLanguage();

  const marqueeItems = [
    { text: t.marquee_online, icon: ShieldCheck, color: 'text-emerald-400' },
    { text: t.marquee_phone_active, icon: Activity, color: 'text-amber-300' },
    { text: t.marquee_registry_v2, icon: Activity, color: 'text-amber-400' },
    { text: t.marquee_ssl, icon: Lock, color: 'text-emerald-400' },
    { text: t.marquee_tcra_sync, icon: Cpu, color: 'text-emerald-300' },
    { text: t.marquee_zero_incident, icon: ShieldCheck, color: 'text-emerald-400' },
  ];

  return (
    <div className="w-full bg-[#05070A] border-b border-amber-500/20 text-xs overflow-hidden select-none py-2 relative z-20 shadow-md">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-amber-500/5 to-emerald-500/5 pointer-events-none" />

      {/* Marquee Scroller */}
      <div className="flex overflow-hidden">
        <div className="animate-marquee flex items-center whitespace-nowrap">
          {marqueeItems.concat(marqueeItems).map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="inline-flex items-center gap-2 mx-6 text-neutral-300 font-mono tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                <span className="font-semibold text-neutral-200">{item.text}</span>
                <span className="text-amber-500/50 ml-4 font-bold">///</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
