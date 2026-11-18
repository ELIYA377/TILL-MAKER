import React, { useState, useEffect } from 'react';
import { TelecomCarrier } from '../../types';
import { SmartIdStore } from '../../services/smartIdStore';

export interface CarrierMeta {
  id: TelecomCarrier;
  name: string;
  fullName: string;
  moneyBrand: string;
  slogan: string;
  ussd: string;
  customerCare: string;
  prefixes: string[];
  primaryColor: string;
  secondaryColor: string;
  gradientBg: string;
  lightBg: string;
  borderColor: string;
  textColor: string;
}

export const TELECOM_CARRIERS: Record<TelecomCarrier, CarrierMeta> = {
  Vodacom: {
    id: 'Vodacom',
    name: 'Vodacom',
    fullName: 'Vodacom Tanzania PLC',
    moneyBrand: 'M-Pesa',
    slogan: 'Together We Can · Kazi Ni Kwako',
    ussd: '*150*00#',
    customerCare: '100',
    prefixes: ['074', '075', '076'],
    primaryColor: '#E60000',
    secondaryColor: '#B30000',
    gradientBg: 'from-red-600 via-red-700 to-rose-900',
    lightBg: 'bg-red-50 text-red-700 border-red-200',
    borderColor: 'border-red-500',
    textColor: 'text-red-600',
  },
  Airtel: {
    id: 'Airtel',
    name: 'Airtel',
    fullName: 'Airtel Tanzania PLC',
    moneyBrand: 'Airtel Money',
    slogan: 'The Smartphone Network · Ongeza Salio Piga Zaidi',
    ussd: '*150*60#',
    customerCare: '100',
    prefixes: ['068', '069', '078'],
    primaryColor: '#ED1C24',
    secondaryColor: '#A30006',
    gradientBg: 'from-rose-600 via-red-700 to-red-900',
    lightBg: 'bg-rose-50 text-rose-700 border-rose-200',
    borderColor: 'border-rose-500',
    textColor: 'text-rose-600',
  },
  Tigo: {
    id: 'Tigo',
    name: 'Tigo (Yas)',
    fullName: 'MIC Tanzania PLC (Tigo / Yas)',
    moneyBrand: 'Tigo Pesa (Yas Pesa)',
    slogan: 'Live it. Love it · Maisha Ni Rahisi',
    ussd: '*150*01#',
    customerCare: '100',
    prefixes: ['065', '067', '071'],
    primaryColor: '#00377B',
    secondaryColor: '#00A3E0',
    gradientBg: 'from-blue-700 via-sky-700 to-slate-900',
    lightBg: 'bg-blue-50 text-blue-800 border-blue-200',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-700',
  },
  Halotel: {
    id: 'Halotel',
    name: 'Halotel',
    fullName: 'Viettel Tanzania PLC (Halotel)',
    moneyBrand: 'HaloPesa',
    slogan: 'Halo Ni Rahisi · Pamoja Popote',
    ussd: '*150*88#',
    customerCare: '100',
    prefixes: ['061', '062'],
    primaryColor: '#FF7900',
    secondaryColor: '#D85D00',
    gradientBg: 'from-amber-600 via-orange-600 to-orange-950',
    lightBg: 'bg-orange-50 text-orange-800 border-orange-200',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-600',
  },
  TTCL: {
    id: 'TTCL',
    name: 'TTCL Corporation',
    fullName: 'Tanzania Telecommunications Corporation',
    moneyBrand: 'T-Pesa',
    slogan: 'Rudi Nyumbani Kumenoga · Shirika la Mawasiliano la Taifa',
    ussd: '*150*71#',
    customerCare: '100',
    prefixes: ['073'],
    primaryColor: '#00843D',
    secondaryColor: '#003366',
    gradientBg: 'from-emerald-700 via-teal-800 to-blue-950',
    lightBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    borderColor: 'border-emerald-600',
    textColor: 'text-emerald-700',
  },
  Zantel: {
    id: 'Zantel',
    name: 'Zantel',
    fullName: 'Zanzibar Telecom Limited',
    moneyBrand: 'Ezypesa',
    slogan: 'Daima Pamoja Nawe · Mtandao wa Watu',
    ussd: '*150*02#',
    customerCare: '100',
    prefixes: ['077'],
    primaryColor: '#00A5B5',
    secondaryColor: '#00688B',
    gradientBg: 'from-cyan-600 via-teal-700 to-slate-900',
    lightBg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    borderColor: 'border-cyan-500',
    textColor: 'text-cyan-700',
  },
};

/**
 * Automatically detects the telecommunications carrier from a Tanzanian phone number
 */
export function detectCarrierFromPhone(phone: string): TelecomCarrier {
  const clean = phone.replace(/\D/g, '');
  let prefix = '';

  if (clean.startsWith('255') && clean.length >= 6) {
    prefix = '0' + clean.slice(3, 5);
  } else if (clean.startsWith('0') && clean.length >= 3) {
    prefix = clean.slice(0, 3);
  }

  if (['074', '075', '076'].includes(prefix)) return 'Vodacom';
  if (['068', '069', '078'].includes(prefix)) return 'Airtel';
  if (['065', '067', '071'].includes(prefix)) return 'Tigo';
  if (['061', '062'].includes(prefix)) return 'Halotel';
  if (['073'].includes(prefix)) return 'TTCL';
  if (['077'].includes(prefix)) return 'Zantel';

  return 'Vodacom'; // default fallback
}

export interface TelecomLogoProps {
  carrier: TelecomCarrier;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'badge';
  darkMode?: boolean;
  customLogoUrl?: string;
}

export const TelecomLogo: React.FC<TelecomLogoProps> = ({
  carrier,
  className = '',
  size = 'md',
  variant = 'full',
  darkMode = false,
  customLogoUrl,
}) => {
  const meta = TELECOM_CARRIERS[carrier] || TELECOM_CARRIERS.Vodacom;

  const [carrierCustomLogo, setCarrierCustomLogo] = useState<string | undefined>(() => {
    return SmartIdStore.getCarrierLogo(carrier);
  });

  useEffect(() => {
    const handleUpdate = () => {
      setCarrierCustomLogo(SmartIdStore.getCarrierLogo(carrier));
    };
    window.addEventListener('smart_id_carrier_logos_changed', handleUpdate);
    return () => window.removeEventListener('smart_id_carrier_logos_changed', handleUpdate);
  }, [carrier]);

  const activeLogoUrl = customLogoUrl || carrierCustomLogo;

  // Sizing mappings
  const iconSizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }[size];

  // Render SVG icons or custom manual uploaded logo for each carrier
  const renderIcon = () => {
    if (activeLogoUrl) {
      return (
        <div className="w-full h-full bg-white flex items-center justify-center p-0.5 rounded-lg overflow-hidden shadow-2xs">
          <img
            src={activeLogoUrl}
            alt={`${carrier} Logo`}
            className="w-full h-full object-contain"
          />
        </div>
      );
    }

    switch (carrier) {
      case 'Vodacom':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#E60000" />
            <path
              d="M50 20C34.5 20 22 32.5 22 48C22 57.5 26.8 65.8 34.2 70.8C35.2 71.5 36.6 70.7 36.6 69.5V64.2C36.6 63.3 36.1 62.5 35.3 62C30.4 58.7 27.2 53.2 27.2 47C27.2 34.9 37.4 25.2 50 25.2C62.6 25.2 72.8 34.9 72.8 47C72.8 59.1 62.6 68.8 50 68.8C46.8 68.8 43.8 68.2 41 67C40 66.6 38.8 67.2 38.8 68.3V73.4C38.8 74.3 39.4 75.1 40.2 75.5C43.2 76.7 46.5 77.4 50 77.4C66.6 77.4 80 64 80 47.4C80 30.8 66.6 20 50 20Z"
              fill="white"
            />
            {/* Apostrophe / speech ball */}
            <circle cx="52" cy="46" r="10" fill="white" />
          </svg>
        );

      case 'Airtel':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="22" fill="#ED1C24" />
            {/* Airtel stylized cursive ribbon 'a' */}
            <path
              d="M52 24C36.5 24 26 35.5 26 51C26 66.5 36.5 76 50 76C63 76 72 67.5 74 54.5C74.3 52.8 72.8 51.5 71.2 51.5H41C41.8 62.5 48.5 68 56.5 68C61.5 68 65.5 65.5 67.5 62.5C68.3 61.2 69.8 60.5 71.2 61.2L73 62.2C74.2 62.8 74.8 64.2 74.2 65.5C70.5 72.2 63.8 77 53.5 77C35.5 77 24 64.8 24 49C24 33.2 36.8 23 52 23C66.5 23 76.5 33.5 76.5 48.5C76.5 50 75 51 73.5 51H38C38.5 37.5 47 30 54 30C59.5 30 64 33 66.5 37C67.2 38.2 68.8 38.8 70 38L72 36.8C73.2 36 73.5 34.5 72.8 33.2C68.8 27.2 62.5 24 52 24Z"
              fill="white"
            />
            <circle cx="68" cy="30" r="5" fill="#FFE500" />
          </svg>
        );

      case 'Tigo':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="22" fill="#00377B" />
            {/* Tigo & Yas multi-arc wave */}
            <path
              d="M24 32H76C78.2 32 80 33.8 80 36V42C80 44.2 78.2 46 76 46H56V74C56 76.2 54.2 78 52 78H44C41.8 78 40 76.2 40 74V46H24C21.8 46 20 44.2 20 42V36C20 33.8 21.8 32 24 32Z"
              fill="#00A3E0"
            />
            {/* Smile / Gold smile arc */}
            <path
              d="M30 62C38 72 62 72 70 62"
              stroke="#FFC72C"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <circle cx="70" cy="38" r="7" fill="#FFC72C" />
          </svg>
        );

      case 'Halotel':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="22" fill="#FF7900" />
            {/* Viettel / Halotel Lotus petals */}
            <circle cx="50" cy="50" r="14" fill="white" />
            <path
              d="M50 20C50 20 62 34 62 50C62 66 50 80 50 80C50 80 38 66 38 50C38 34 50 20 50 20Z"
              fill="white"
              fillOpacity="0.85"
            />
            <path
              d="M20 50C20 50 34 62 50 62C66 62 80 50 80 50C80 50 66 38 50 38C34 38 20 50 20 50Z"
              fill="white"
              fillOpacity="0.85"
            />
            <circle cx="50" cy="50" r="7" fill="#FF7900" />
          </svg>
        );

      case 'TTCL':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="22" fill="#003366" />
            {/* TTCL Dish & Green/Gold National Radiating Rings */}
            <circle cx="50" cy="50" r="38" stroke="#00843D" strokeWidth="6" />
            <circle cx="50" cy="50" r="26" stroke="#D4AF37" strokeWidth="5" />
            <circle cx="50" cy="50" r="14" fill="#00843D" />
            <path d="M50 18L50 82" stroke="white" strokeWidth="4" strokeLinecap="round" />
            <path d="M18 50L82 50" stroke="white" strokeWidth="4" strokeLinecap="round" />
            {/* Broadcast antenna apex */}
            <circle cx="50" cy="50" r="6" fill="#D4AF37" />
          </svg>
        );

      case 'Zantel':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="22" fill="#00A5B5" />
            {/* Zantel sun over ocean wave */}
            <circle cx="50" cy="38" r="14" fill="#FFE500" />
            <path
              d="M22 62C30 56 40 56 48 62C56 68 66 68 74 62C80 58 84 60 84 60V74C84 76 82 78 80 78H20C18 78 16 76 16 74V64C16 64 19 64 22 62Z"
              fill="white"
            />
            <path
              d="M20 70C30 64 42 64 50 70C58 76 70 76 80 70"
              stroke="#00688B"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        );
    }
  };

  if (variant === 'icon') {
    return (
      <div className={`${iconSizeClasses} rounded-xl shadow-xs overflow-hidden shrink-0 ${className}`}>
        {renderIcon()}
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider border shadow-2xs ${meta.lightBg} ${className}`}
      >
        <span className="w-4 h-4 shrink-0">{renderIcon()}</span>
        <span>{meta.name}</span>
      </span>
    );
  }

  // Full Variant with text and money brand
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`${iconSizeClasses} rounded-xl shadow-xs overflow-hidden shrink-0`}>
        {renderIcon()}
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <span className={`text-sm font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            {meta.name}
          </span>
          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${meta.lightBg}`}>
            {meta.moneyBrand}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium block leading-none mt-0.5">
          {meta.slogan.split('·')[0]}
        </span>
      </div>
    </div>
  );
};

export const TcraRegulatorySeal: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => {
  return (
    <div className={`${className} shrink-0`} title="Tanzania Communications Regulatory Authority (TCRA) Verified">
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="47" fill="#0F172A" stroke="#10B981" strokeWidth="4" />
        <circle cx="50" cy="50" r="39" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="3 3" />
        <path d="M50 18L58 36L78 36L62 48L68 68L50 56L32 68L38 48L22 36L42 36Z" fill="#F59E0B" opacity="0.25" />
        {/* National Flag Ribbon Stripes */}
        <path d="M22 68L78 32" stroke="#10B981" strokeWidth="7" strokeLinecap="round" />
        <path d="M20 74L80 26" stroke="#FBBF24" strokeWidth="2.5" />
        <path d="M28 72L72 28" stroke="#1E3A8A" strokeWidth="4" strokeLinecap="round" />
        <text x="50" y="54" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="900" fontFamily="sans-serif">
          TCRA
        </text>
        <text x="50" y="66" textAnchor="middle" fill="#34D399" fontSize="6.5" fontWeight="700" letterSpacing="0.5">
          COMPLIANT
        </text>
      </svg>
    </div>
  );
};
