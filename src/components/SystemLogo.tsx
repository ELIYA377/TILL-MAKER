import React, { useState } from 'react';
import badgeImage from '../assets/images/nida_metallic_badge_1790171872604.jpg';
import { Shield, Sparkles } from 'lucide-react';

interface SystemLogoProps {
  onReset?: () => void;
}

export const SystemLogo: React.FC<SystemLogoProps> = ({ onReset }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div 
      onClick={onReset}
      className="flex items-center gap-3.5 group cursor-pointer transition-all duration-200"
      title="NIDA Lookup System - Secure Identity Registry Portal"
    >
      {/* Sleek Metallic / Gold Badge Design */}
      <div className="relative flex-shrink-0">
        {/* Ambient glow behind badge */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500/40 via-yellow-400/30 to-emerald-500/40 blur-sm opacity-70 group-hover:opacity-100 transition duration-300" />
        
        {/* Metallic Bezel Frame */}
        <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl p-[2px] bg-gradient-to-br from-amber-200 via-amber-600 to-yellow-900 shadow-[0_4px_20px_rgba(245,158,11,0.25)] flex items-center justify-center overflow-hidden">
          {/* Inner metallic reflection layer */}
          <div className="w-full h-full rounded-[10px] bg-neutral-950 flex items-center justify-center overflow-hidden relative">
            {!imgError ? (
              <img
                src={badgeImage}
                alt="NIDA Official Metallic Seal"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              /* Fallback rich metallic SVG crest */
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-950 to-amber-950/40 text-amber-400">
                <Shield className="w-7 h-7 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                <span className="text-[7px] font-mono tracking-widest text-amber-300 font-bold mt-0.5">NIDA</span>
              </div>
            )}
            
            {/* Subtle glass reflection highlight */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Small verified holographic icon pin */}
        <div className="absolute -bottom-1 -right-1 bg-[#090D14] border border-amber-400/60 rounded-full p-0.5 shadow-md">
          <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
        </div>
      </div>

      {/* Title & Official Subtitle */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <h1 className="text-lg md:text-2xl font-extrabold tracking-tight metallic-gold-text font-sans">
            NIDA LOOKUP SYSTEM
          </h1>
          <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
            OFFICIAL
          </span>
        </div>
        <p className="text-[11px] md:text-xs text-neutral-400 tracking-wide font-medium flex items-center gap-1.5">
          <span>National Identification Authority</span>
          <span className="text-amber-500/60">·</span>
          <span className="text-emerald-400/90 font-mono text-[10px]">VERIFIED REGISTRY</span>
        </p>
      </div>
    </div>
  );
};
