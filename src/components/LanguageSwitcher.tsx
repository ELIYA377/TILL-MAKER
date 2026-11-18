import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface LanguageSwitcherProps {
  variant?: 'pill' | 'dropdown' | 'compact';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = 'pill',
  className = '' 
}) => {
  const { language, setLanguage, toggleLanguage } = useLanguage();

  if (variant === 'compact') {
    return (
      <button
        onClick={toggleLanguage}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700/80 text-xs font-mono transition-all cursor-pointer ${className}`}
        title={language === 'sw' ? 'Badili kwenda English' : 'Badili kwenda Kiswahili'}
      >
        <Globe className="w-3.5 h-3.5 text-amber-400" />
        <span className="font-bold text-neutral-200">
          {language === 'sw' ? 'EN' : 'SW'}
        </span>
      </button>
    );
  }

  return (
    <div className={`inline-flex items-center p-0.5 rounded-xl bg-neutral-900/90 border border-neutral-800 shadow-sm ${className}`}>
      <button
        type="button"
        onClick={() => setLanguage('sw')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
          language === 'sw'
            ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
            : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <span>🇹🇿</span>
        <span>KISWAHILI</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
          language === 'en'
            ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
            : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <span>🇬🇧</span>
        <span>ENGLISH</span>
      </button>
    </div>
  );
};
