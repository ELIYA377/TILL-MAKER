import React, { useEffect, useState } from 'react';
import { Fingerprint, Shield, Cpu, Database, PhoneCall, Smartphone } from 'lucide-react';
import { isPhoneNumberQuery } from '../data/mockRecords';

interface ScannerLoadingProps {
  searchedText: string;
}

export const ScannerLoading: React.FC<ScannerLoadingProps> = ({ searchedText }) => {
  const [stepIndex, setStepIndex] = useState(0);

  const isPhone = isPhoneNumberQuery(searchedText);

  const steps = isPhone
    ? [
        { label: 'Inaunganisha na Mfumo wa Mawasiliano TCRA & NIDA...', icon: Smartphone },
        { label: `Inatafuta usajili wa alama za vidole kwa laini "${searchedText}"...`, icon: PhoneCall },
        { label: 'Inalinganisha taarifa za kadi ya SIM na Kanzidata Kuu ya NIDA...', icon: Fingerprint },
        { label: 'Inathibitisha Namba ya Utambulisho wa Taifa (NIN) na Majina...', icon: Shield },
      ]
    : [
        { label: 'Inaunganisha na Tovuti Kuu ya NIDA Gateway...', icon: Database },
        { label: `Inatafuta kumbukumbu ya usajili kwa "${searchedText}"...`, icon: Cpu },
        { label: 'Inakagua mfumo wa biometrik na alama za vidole...', icon: Fingerprint },
        { label: 'Inathibitisha uhalali na hati ya utambulisho wa taifa...', icon: Shield },
      ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 360);

    return () => clearInterval(timer);
  }, [steps.length]);

  const CurrentIcon = steps[stepIndex].icon;

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div className="relative rounded-2xl bg-[#0B0F17]/90 backdrop-blur-xl border border-emerald-500/30 p-8 shadow-[0_0_40px_rgba(16,185,129,0.15)] overflow-hidden">
        {/* Animated Laser Scanning Line */}
        <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10B981] animate-scanline pointer-events-none z-10" />

        <div className="flex flex-col items-center justify-center text-center space-y-6">
          {/* Biometric Scanning Radar Visualizer */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Concentric Pulsing Radar Rings */}
            <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-radar" />
            <div className="absolute inset-2 rounded-full border border-amber-500/25 animate-ping opacity-30" />
            <div className="absolute inset-4 rounded-full border border-emerald-400/30" />

            {/* Glowing Center Badge */}
            <div className="relative w-16 h-16 rounded-2xl bg-neutral-900 border border-emerald-400/50 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <CurrentIcon className="w-8 h-8 text-emerald-400 animate-pulse" />
            </div>
          </div>

          {/* Text Indicators */}
          <div className="space-y-2 max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{isPhone ? 'UKAGUZI WA NIDA KWA NAMBA YA SIMU' : 'REGISTRY SEARCH IN PROGRESS'}</span>
            </div>

            <h3 className="text-lg md:text-xl font-bold text-neutral-100 font-sans">
              {steps[stepIndex].label}
            </h3>

            <p className="text-xs text-neutral-400 font-mono">
              Namba / Target: <span className="text-amber-300 font-semibold">{searchedText}</span>
            </p>
          </div>

          {/* Progress Bar with Gold & Emerald Accents */}
          <div className="w-full max-w-sm">
            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden p-[1px]">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-amber-500 rounded-full transition-all duration-300 shadow-[0_0_10px_#10B981]"
                style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-neutral-400 font-mono mt-2">
              <span>SECURITY LEVEL: CLASS-A ENCRYPTED</span>
              <span>{Math.round(((stepIndex + 1) / steps.length) * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
