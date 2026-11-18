import React from 'react';
import { Phone, MessageSquare, Shield, Cpu, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = 2026;

  return (
    <footer className="w-full mt-auto bg-[#05070A] border-t border-amber-500/20 text-neutral-400 text-xs">
      {/* Upper Footer: System Info & Developer Credit Feature */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left Column: System Identity */}
          <div className="md:col-span-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981] animate-pulse" />
              <span className="font-extrabold text-sm text-neutral-200 tracking-wide font-sans">
                NIDA LOOKUP PORTAL
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              National Identification Database Gateway for citizen registration verification and biometric validation.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400/90 font-mono">
              <Shield className="w-3.5 h-3.5" />
              <span>CONFIDENTIAL & SECURE 256-BIT ENCRYPTION</span>
            </div>
          </div>

          {/* Center Column: System Engine Tag */}
          <div className="md:col-span-4 text-center md:text-left space-y-2 border-y md:border-y-0 md:border-x border-neutral-800/80 py-4 md:py-0 md:px-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-bold">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>D EDITOR AUTOMATIC SYSTEM</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              High-availability automated registry resolution algorithm with real-time biometric checksum verification.
            </p>
          </div>

          {/* Right Column: Developer Credit (Explicitly requested by user) */}
          <div className="md:col-span-4 flex flex-col items-center md:items-end space-y-3">
            <div className="text-center md:text-right">
              <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 block mb-1">
                ENGINEERING & SUPPORT
              </span>
              <div className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-yellow-400 font-sans tracking-wide">
                Developed by DIGITAL SALES 0784615052
              </div>
            </div>

            {/* Direct Contact Buttons */}
            <div className="flex items-center gap-2">
              <a
                href="tel:0784615052"
                className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-amber-500/30 hover:border-amber-400 text-amber-300 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                title="Call 0784615052"
              >
                <Phone className="w-3 h-3 text-emerald-400" />
                <span>0784615052</span>
              </a>

              <a
                href="https://wa.me/255784615052"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                title="Chat with Digital Sales on WhatsApp"
              >
                <MessageSquare className="w-3 h-3 text-emerald-400" />
                <span>WhatsApp</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal / Version Strip */}
      <div className="bg-[#030406] border-t border-neutral-900 py-3">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-neutral-400 font-mono">
          <div>
            © {currentYear} NIDA LOOKUP SYSTEM · D EDITOR AUTOMATIC SYSTEM
          </div>
          <div className="flex items-center gap-4">
            <span className="text-emerald-400">REGISTRY STATUS: 100% OPERATIONAL</span>
            <span className="text-neutral-400">|</span>
            <span className="text-amber-400">DIGITAL SALES 0784615052</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
