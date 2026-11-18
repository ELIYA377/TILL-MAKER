import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  RotateCw, 
  Printer, 
  Download, 
  Search, 
  Plus, 
  ShieldCheck, 
  Check, 
  Copy, 
  Phone, 
  MapPin, 
  Building, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  UserPlus, 
  X,
  Filter,
  Sparkles,
  Layers,
  ArrowRight,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useLanguage } from '../../context/LanguageContext';
import { TelecomCarrier, TelecomIdType, TelecomAgentProfile } from '../../types';
import { SmartIdStore } from '../../services/smartIdStore';
import { 
  TelecomLogo, 
  TcraRegulatorySeal, 
  TELECOM_CARRIERS, 
  detectCarrierFromPhone 
} from './TelecomLogos';
import { ManualLogoModal } from './ManualLogoModal';
import samplePhoto from '../../assets/images/avatar_citizen_verified_1790750468089.jpg';

interface TelecomIdPortalProps {
  onOpenCertificateModal?: (nin: string) => void;
}

export const TelecomIdPortal: React.FC<TelecomIdPortalProps> = () => {
  const { language, t } = useLanguage();

  const [agents, setAgents] = useState<TelecomAgentProfile[]>(() => SmartIdStore.getTelecomAgents());
  const [selectedCarrier, setSelectedCarrier] = useState<TelecomCarrier | 'ALL'>('ALL');
  const [selectedType, setSelectedType] = useState<TelecomIdType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Active inspected agent for the card generator
  const [activeAgent, setActiveAgent] = useState<TelecomAgentProfile>(() => {
    const list = SmartIdStore.getTelecomAgents();
    return list[0];
  });

  const [isFlipped, setIsFlipped] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // New registration modal state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [newCarrier, setNewCarrier] = useState<TelecomCarrier>('Vodacom');
  const [newIdType, setNewIdType] = useState<TelecomIdType>('WAKALA');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newNin, setNewNin] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [newRegion, setNewRegion] = useState('DAR ES SALAAM');
  const [newTillNumber, setNewTillNumber] = useState('');
  const [newCustomLogo, setNewCustomLogo] = useState('');
  const [regFeedback, setRegFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = () => {
    const list = SmartIdStore.getTelecomAgents();
    setAgents(list);
    if (!activeAgent || !list.some((a) => a.id === activeAgent.id)) {
      if (list.length > 0) setActiveAgent(list[0]);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('smart_id_telecom_agents_changed', handleUpdate);
    return () => window.removeEventListener('smart_id_telecom_agents_changed', handleUpdate);
  }, []);

  // Filtered agents list
  const filteredAgents = SmartIdStore.searchTelecomAgents(searchQuery, selectedCarrier, selectedType);

  // When phone changes in register form, auto-detect carrier
  const handlePhoneInputChange = (val: string) => {
    setNewPhone(val);
    const clean = val.replace(/\D/g, '');
    if (clean.length >= 3) {
      const detected = detectCarrierFromPhone(clean);
      setNewCarrier(detected);
    }
  };

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    setRegFeedback(null);

    if (!newOwnerName.trim() || newOwnerName.trim().split(' ').length < 2) {
      setRegFeedback({
        type: 'error',
        message: language === 'sw' ? 'Weka jina kamili lenye angalau majina mawili.' : 'Please enter full legal name (at least 2 words).',
      });
      return;
    }

    const cleanPhone = newPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setRegFeedback({
        type: 'error',
        message: language === 'sw' ? 'Namba ya simu inapaswa kuwa na tarakimu 10 (mf. 0754112233).' : 'Phone must be 10 digits (e.g. 0754112233).',
      });
      return;
    }

    const result = SmartIdStore.registerTelecomAgent({
      carrier: newCarrier,
      idType: newIdType,
      ownerName: newOwnerName.trim(),
      nin: newNin.trim() || '19900315-11103-00001-21',
      assignedPhone: cleanPhone,
      branchName: newBranchName.trim() || `${newRegion} Telecom Agency`,
      operatingRegion: newRegion,
      tillNumber: newTillNumber.trim() || undefined,
      customLogoUrl: newCustomLogo.trim() || undefined,
    });

    if (result.success && result.record) {
      setActiveAgent(result.record);
      setSelectedCarrier(result.record.carrier);
      setRegFeedback({
        type: 'success',
        message: result.message,
      });
      setTimeout(() => {
        setIsRegisterModalOpen(false);
        setRegFeedback(null);
        // Reset form
        setNewOwnerName('');
        setNewPhone('');
        setNewBranchName('');
        setNewTillNumber('');
        setNewCustomLogo('');
      }, 1200);
    }
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const carrierMeta = TELECOM_CARRIERS[activeAgent?.carrier || 'Vodacom'];

  // QR Code verification payload for telecom card
  const qrTelecomPayload = JSON.stringify({
    carrier: activeAgent?.carrier,
    idType: activeAgent?.idType,
    agentCode: activeAgent?.agentCode,
    tillNumber: activeAgent?.tillNumber || 'N/A',
    ownerName: activeAgent?.ownerName,
    nin: activeAgent?.nin,
    phone: activeAgent?.assignedPhone,
    branch: activeAgent?.branchName,
    region: activeAgent?.operatingRegion,
    tcraLicense: activeAgent?.tcraLicenseNumber,
    validThrough: activeAgent?.expiryDate,
    status: activeAgent?.status,
    system: 'TCRA TELECOM OPERATOR PASS REGISTER',
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* ========================================================================= */}
      {/* 1. HERO & BANNER WITH ALL TANZANIAN TELECOM CARRIERS LOGOS                */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-[#0a192f] to-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>TCRA & ALL TANZANIA MOBILE NETWORK OPERATORS (MNOs)</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsLogoModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-white font-extrabold text-xs border border-slate-700 shadow-md transition-all flex items-center gap-2 cursor-pointer hover:border-emerald-500/50"
                title={t.telecom_manual_logo_title}
              >
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>{t.telecom_manual_logo_btn}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.telecom_register_btn}</span>
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {t.telecom_portal_title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed mt-1">
              {t.telecom_portal_subtitle}
            </p>
          </div>

          {/* Quick Carrier Selection Strip with Official Logos */}
          <div className="pt-3 border-t border-slate-800 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCarrier('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                selectedCarrier === 'ALL'
                  ? 'bg-white text-slate-900 border-white shadow-sm font-extrabold'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              {t.telecom_all_carriers} ({agents.length})
            </button>

            {(['Vodacom', 'Airtel', 'Tigo', 'Halotel', 'TTCL', 'Zantel'] as TelecomCarrier[]).map((c) => {
              const count = agents.filter((a) => a.carrier === c).length;
              const isSelected = selectedCarrier === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setSelectedCarrier(c);
                    const match = agents.find((a) => a.carrier === c);
                    if (match) setActiveAgent(match);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer border ${
                    isSelected
                      ? 'bg-slate-800 text-white border-emerald-400 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-slate-900/80 text-slate-300 border-slate-700/80 hover:bg-slate-800'
                  }`}
                >
                  <TelecomLogo carrier={c} size="sm" variant="icon" />
                  <span>{c}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN TELECOM SMART ID CARD GENERATOR & INSPECTOR                       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Interactive Smart Card Viewport (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <TelecomLogo carrier={activeAgent.carrier} size="sm" variant="icon" customLogoUrl={activeAgent.customLogoUrl} />
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    {activeAgent.carrier} · {activeAgent.idType.replace('_', ' ')} ID CARD
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  License: <strong className="text-slate-600 font-mono">{activeAgent.tcraLicenseNumber}</strong>
                </span>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsLogoModalOpen(true)}
                  className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 border border-amber-300 font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Weka au Badilisha Nembo kwa Mkono (Manual Logo Upload)"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-600" />
                  <span>Weka Nembo (Set Logo)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{isFlipped ? 'Mbele (Front)' : 'Nyuma (Back)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t.telecom_print_btn}</span>
                </button>
              </div>
            </div>

            {/* =================================================================== */}
            {/* 3D SMART TELECOM ID CARD CONTAINER                                  */}
            {/* =================================================================== */}
            <div className="perspective-1000 py-3 flex justify-center">
              <div 
                className={`
                  relative w-full max-w-[530px] aspect-[1.586/1] rounded-2xl transition-all duration-700 transform-style-3d shadow-2xl overflow-hidden
                  ${isFlipped ? 'rotate-y-180' : ''}
                `}
                style={{
                  background: activeAgent.carrier === 'Vodacom'
                    ? 'linear-gradient(135deg, #b30000 0%, #E60000 45%, #8a0000 100%)'
                    : activeAgent.carrier === 'Airtel'
                    ? 'linear-gradient(135deg, #a80006 0%, #ED1C24 50%, #7a0004 100%)'
                    : activeAgent.carrier === 'Tigo'
                    ? 'linear-gradient(135deg, #00224d 0%, #00377B 45%, #00609C 100%)'
                    : activeAgent.carrier === 'Halotel'
                    ? 'linear-gradient(135deg, #c24d00 0%, #FF7900 50%, #943500 100%)'
                    : activeAgent.carrier === 'TTCL'
                    ? 'linear-gradient(135deg, #002b14 0%, #00843D 45%, #003366 100%)'
                    : 'linear-gradient(135deg, #004d55 0%, #00A5B5 50%, #002f35 100%)',
                }}
              >
                {/* Guilloche / Holographic security line overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-black/30 pointer-events-none" />
                <div className="absolute inset-0 opacity-15 bg-[repeating-linear-gradient(45deg,#fff,#fff_1px,transparent_1px,transparent_8px)] pointer-events-none" />

                {/* ------------------------------------------------------------- */}
                {/* CARD FRONT SIDE                                               */}
                {/* ------------------------------------------------------------- */}
                <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-between text-white backface-hidden">
                  
                  {/* Top Header: Telecom Brand Logo, Badge & TCRA Regulatory Seal */}
                  <div className="flex items-start justify-between gap-3 border-b border-white/25 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <TelecomLogo 
                        carrier={activeAgent.carrier} 
                        size="md" 
                        variant="icon" 
                        customLogoUrl={activeAgent.customLogoUrl} 
                      />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm sm:text-base font-black tracking-tight leading-none text-white drop-shadow-xs">
                            {carrierMeta.name}
                          </span>
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm bg-white text-slate-900 tracking-wider">
                            {carrierMeta.moneyBrand}
                          </span>
                          {activeAgent.customLogoUrl && (
                            <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-sm bg-amber-400 text-slate-900 tracking-wider">
                              ★ Nembo ya Mkono
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-white/85 font-bold tracking-wider uppercase block mt-1">
                          {activeAgent.idType === 'WAKALA' 
                            ? 'OFFICIAL AUTHORIZED AGENT ID' 
                            : activeAgent.idType === 'SIM_REGISTRAR'
                            ? 'BIOMETRIC SIM REGISTRATION OFFICER'
                            : activeAgent.idType === 'STAFF'
                            ? 'TELECOMMUNICATIONS FIELD STAFF'
                            : 'SUBSCRIBER SIM PASS'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <TcraRegulatorySeal className="w-8 h-8 sm:w-9 sm:h-9" />
                    </div>
                  </div>

                  {/* Middle Zone: Photo, Smart Chip, and Credential Details */}
                  <div className="grid grid-cols-12 gap-3 items-center my-auto">
                    
                    {/* Left: Citizen Photo & Security Chip (4 cols) */}
                    <div className="col-span-4 flex flex-col items-center gap-2">
                      <div className="relative w-20 sm:w-24 aspect-[3/4] rounded-xl overflow-hidden border-2 border-white/80 shadow-md bg-slate-800">
                        <img 
                          src={activeAgent.avatarUrl || samplePhoto} 
                          alt={activeAgent.ownerName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {/* Biometric verification checkmark badge */}
                        <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold shadow-xs">
                          ✓
                        </div>
                      </div>

                      {/* Embedded Microchip Graphic */}
                      <div className="w-9 h-6 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-300 shadow-inner flex flex-col justify-center px-1">
                        <div className="h-0.5 bg-amber-800/40 w-full mb-0.5" />
                        <div className="h-0.5 bg-amber-800/40 w-full" />
                      </div>
                    </div>

                    {/* Right: Agent Credential Attributes (8 cols) */}
                    <div className="col-span-8 space-y-1.5 text-left text-white">
                      <div>
                        <span className="text-[9px] text-white/70 font-semibold block uppercase">
                          Jina Kamili / Full Name
                        </span>
                        <span className="text-xs sm:text-sm font-black tracking-tight block uppercase truncate drop-shadow-xs">
                          {activeAgent.ownerName}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {activeAgent.tillNumber && (
                          <div className="bg-black/25 px-2 py-1 rounded-lg border border-white/15">
                            <span className="text-[8px] text-white/70 font-bold block uppercase">
                              Till / Wakala No.
                            </span>
                            <span className="text-xs sm:text-sm font-mono font-black text-amber-300 tracking-wider">
                              {activeAgent.tillNumber}
                            </span>
                          </div>
                        )}

                        <div className="bg-black/25 px-2 py-1 rounded-lg border border-white/15">
                          <span className="text-[8px] text-white/70 font-bold block uppercase">
                            Agent / Staff Code
                          </span>
                          <span className="text-[11px] sm:text-xs font-mono font-bold text-white tracking-wider truncate block">
                            {activeAgent.agentCode}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                          <span className="text-[8px] text-white/70 block uppercase">NIDA NIN</span>
                          <span className="font-mono font-semibold text-white/95 text-[10px] truncate block">
                            {activeAgent.nin}
                          </span>
                        </div>

                        <div>
                          <span className="text-[8px] text-white/70 block uppercase">Namba ya Simu</span>
                          <span className="font-mono font-bold text-white text-[11px]">
                            {activeAgent.assignedPhone}
                          </span>
                        </div>
                      </div>

                      <div className="text-[9px] text-white/80 pt-0.5">
                        <span>Tawi / Branch: </span>
                        <strong className="text-white font-bold">{activeAgent.branchName}</strong>
                        <span> · {activeAgent.operatingRegion}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Strip: QR Code, Validity, and TCRA Security String */}
                  <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[9px] text-white/80">
                    <div>
                      <span className="font-mono font-bold tracking-wider text-white">
                        EXP: {activeAgent.expiryDate}
                      </span>
                      <span className="mx-1.5 opacity-60">|</span>
                      <span>TCRA COMPLIANT ID</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[8px] text-white/70">
                        BARCODE: {activeAgent.securityBarcode}
                      </span>
                      {/* Compact QR in front */}
                      <div className="p-0.5 rounded-sm bg-white shrink-0">
                        <QRCodeSVG value={qrTelecomPayload} size={28} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* CARD BACK SIDE (Rotated 180deg)                               */}
                {/* ------------------------------------------------------------- */}
                <div 
                  className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-between text-white backface-hidden rotate-y-180"
                  style={{
                    background: activeAgent.carrier === 'Vodacom'
                      ? 'linear-gradient(135deg, #1c0000 0%, #8a0000 50%, #400000 100%)'
                      : activeAgent.carrier === 'Airtel'
                      ? 'linear-gradient(135deg, #1c0001 0%, #7a0004 50%, #3a0002 100%)'
                      : activeAgent.carrier === 'Tigo'
                      ? 'linear-gradient(135deg, #001229 0%, #00285a 50%, #001530 100%)'
                      : activeAgent.carrier === 'Halotel'
                      ? 'linear-gradient(135deg, #2e1000 0%, #782800 50%, #3d1500 100%)'
                      : activeAgent.carrier === 'TTCL'
                      ? 'linear-gradient(135deg, #001f0c 0%, #004d24 50%, #001830 100%)'
                      : 'linear-gradient(135deg, #002226 0%, #005a63 50%, #001f24 100%)',
                  }}
                >
                  {/* Black Magnetic Stripe */}
                  <div className="w-full h-8 sm:h-9 bg-slate-950 -mx-5 px-5 flex items-center justify-end">
                    <span className="text-[8px] font-mono text-slate-500 tracking-widest mr-4">
                      TZ-TCRA-TEL-ENCRYPTED-TRACK-01
                    </span>
                  </div>

                  {/* Middle: Scannable Large QR Code + Official Rules */}
                  <div className="grid grid-cols-12 gap-3 items-center py-2">
                    <div className="col-span-8 space-y-1 text-[9px] text-white/80 leading-relaxed text-left">
                      <div className="font-bold text-white uppercase text-[10px]">
                        Masharti ya Utambulisho wa {carrierMeta.fullName}:
                      </div>
                      <p className="text-[8px] text-white/70">
                        1. Kitambulisho hiki ni mali ya {carrierMeta.fullName} na kimetolewa kwa mujibu wa Kanuni za Mawasiliano za TCRA (Electronic & Postal Communications Act).
                      </p>
                      <p className="text-[8px] text-white/70">
                        2. Ni marufuku kutoa huduma za kifedha ({carrierMeta.moneyBrand}) au usajili wa laini bila kitambulisho hiki rasmi.
                      </p>
                      <p className="text-[8px] text-white/70">
                        3. Kikitokea kimepotea, toa taarifa kituo cha polisi na piga huduma kwa wateja <strong>{carrierMeta.customerCare}</strong> au tembelea ofisi ya {carrierMeta.name}.
                      </p>
                    </div>

                    <div className="col-span-4 flex flex-col items-center gap-1">
                      <div className="p-1.5 rounded-xl bg-white shadow-md">
                        <QRCodeSVG value={qrTelecomPayload} size={64} />
                      </div>
                      <span className="text-[8px] font-mono font-bold text-white/90">
                        SCAN TO VERIFY
                      </span>
                    </div>
                  </div>

                  {/* Bottom: Signature Line & Helpline */}
                  <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[9px]">
                    <div className="text-left">
                      <span className="text-[8px] text-white/60 block">Huduma kwa Wateja</span>
                      <strong className="text-amber-300 font-mono text-xs">{carrierMeta.customerCare}</strong>
                      <span className="text-[8px] text-white/80 ml-2">USSD: {carrierMeta.ussd}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[8px] text-white/60 block">Sahihi ya Mamlaka</span>
                      <span className="font-serif italic text-white/90 text-xs">
                        Director of Regulatory & Compliance
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Details Below Card */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Agent Code:</span>
                <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {activeAgent.agentCode}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(activeAgent.agentCode)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                  title="Copy Code"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="text-slate-500 text-[11px]">
                Mtandao Rasmi: <strong className="text-slate-900">{activeAgent.carrier} Tanzania</strong>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Telecom Breakdown & Fast Switcher (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Card: Telecom Carriers Network Status */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                {t.telecom_stats_title}
              </h3>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                6/6 MNOs Active
              </span>
            </div>

            <div className="space-y-2.5">
              {(['Vodacom', 'Airtel', 'Tigo', 'Halotel', 'TTCL', 'Zantel'] as TelecomCarrier[]).map((c) => {
                const count = agents.filter((a) => a.carrier === c).length;
                const meta = TELECOM_CARRIERS[c];
                const isCurrentActive = activeAgent.carrier === c;
                return (
                  <div
                    key={c}
                    onClick={() => {
                      setSelectedCarrier(c);
                      const match = agents.find((a) => a.carrier === c);
                      if (match) setActiveAgent(match);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isCurrentActive
                        ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <TelecomLogo carrier={c} size="md" variant="icon" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-900">{meta.name}</span>
                          <span className="text-[10px] font-bold text-slate-500">({meta.moneyBrand})</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          Prefixes: {meta.prefixes.join(', ')} · USSD: {meta.ussd}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-slate-800 font-mono block">
                        {count} Vitambulisho
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold">TCRA Sync ✓</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Registration CTA Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-[#0c2340] text-white border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Usajili wa Kitambulisho cha Wakala / Mfanyakazi</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tengeneza kitambulisho rasmi cha Wakala wa M-Pesa, Airtel Money, Tigo Pesa, HaloPesa, T-Pesa, au Ezypesa chenye nembo ya kampuni na barcode ya TCRA papo hapo.
            </p>
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <UserPlus className="w-4 h-4" />
              <span>Sajili Wakala Mpya wa Mtandao</span>
            </button>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TELECOM AGENTS DIRECTORY TABLE                                         */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Orodha ya Vitambulisho vya Mawakala na Wafanyakazi wa Simu
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Chagua mwanachama yeyote hapa chini ili kumtengenezea na kumchapishia kadi ya kampuni husika.
            </p>
          </div>

          {/* Search Input Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tafuta Wakala, Namba ya Till, au Simu..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-3">Kampuni ya Simu</th>
                <th className="py-3 px-3">Mwanachama / Jina</th>
                <th className="py-3 px-3">Aina ya Kadi</th>
                <th className="py-3 px-3">Till / Agent Code</th>
                <th className="py-3 px-3">Simu / Eneo</th>
                <th className="py-3 px-3">Hali</th>
                <th className="py-3 px-3 text-right">Vitendo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredAgents.map((agent) => {
                const isSelected = activeAgent.id === agent.id;
                return (
                  <tr
                    key={agent.id}
                    onClick={() => setActiveAgent(agent)}
                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                      isSelected ? 'bg-emerald-50/30 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3.5 px-3">
                      <TelecomLogo carrier={agent.carrier} size="sm" variant="badge" />
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={agent.avatarUrl || samplePhoto} 
                          alt="" 
                          className="w-7 h-7 rounded-lg object-cover border border-slate-200"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{agent.ownerName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{agent.nin}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                        {agent.idType === 'WAKALA' ? 'WAKALA (M-PESA / AGENT)' : agent.idType === 'SIM_REGISTRAR' ? 'USAJILI WA LAINI' : 'STAFF / MHANDISI'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-mono">
                      {agent.tillNumber ? (
                        <div>
                          <span className="font-bold text-emerald-700">Till: {agent.tillNumber}</span>
                          <span className="text-[10px] text-slate-400 block">{agent.agentCode}</span>
                        </div>
                      ) : (
                        <span className="font-bold text-slate-800">{agent.agentCode}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-mono text-slate-900 font-bold block">{agent.assignedPhone}</span>
                      <span className="text-[10px] text-slate-400">{agent.branchName} · {agent.operatingRegion}</span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveAgent(agent);
                          window.scrollTo({ top: 120, behavior: 'smooth' });
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        Tengeneza Kadi &rarr;
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredAgents.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">
              Hakuna kitambulisho cha mtandao kinacholingana na utafutaji wako.
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL: REGISTER NEW TELECOM AGENT / STAFF ID                           */}
      {/* ========================================================================= */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 my-8 animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <TelecomLogo carrier={newCarrier} size="md" variant="icon" />
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Usajili wa Kitambulisho cha Mtandao
                </h3>
                <span className="text-xs text-slate-500 font-medium block">
                  {TELECOM_CARRIERS[newCarrier].fullName}
                </span>
              </div>
            </div>

            {regFeedback && (
              <div className={`p-3 rounded-xl mb-4 text-xs font-bold flex items-center gap-2 ${
                regFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {regFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{regFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleCreateAgent} className="space-y-4 text-xs">
              
              {/* Carrier Selection Radio Strip */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5 uppercase text-[10px]">
                  1. Chagua Kampuni ya Simu (MNO):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Vodacom', 'Airtel', 'Tigo', 'Halotel', 'TTCL', 'Zantel'] as TelecomCarrier[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewCarrier(c)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        newCarrier === c 
                          ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20 font-bold' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <TelecomLogo carrier={c} size="sm" variant="icon" />
                      <span className="text-[11px] font-bold text-slate-800">{c}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ID Type Selection */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5 uppercase text-[10px]">
                  2. Aina ya Kitambulisho:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'WAKALA', label: 'Wakala / Pesa' },
                    { id: 'SIM_REGISTRAR', label: 'Msajili wa Laini' },
                    { id: 'STAFF', label: 'Mfanyakazi' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNewIdType(t.id as TelecomIdType)}
                      className={`py-2 px-2.5 rounded-xl border text-center transition-all cursor-pointer text-xs font-bold ${
                        newIdType === t.id 
                          ? 'bg-slate-900 text-white border-slate-900' 
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Owner Name */}
              <div>
                <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                  Jina Kamili la Mwanachama (Full Legal Name):
                </label>
                <input
                  type="text"
                  required
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
                  placeholder="mf. Juma Hamisi Bakari"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Phone & Carrier Auto-Detection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                    Namba ya Simu ya Mtandao:
                  </label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => handlePhoneInputChange(e.target.value)}
                    placeholder="mf. 0754112233"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-mono font-bold focus:outline-none focus:border-emerald-600"
                  />
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                    Mtandao: {newCarrier}
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                    Namba ya Till (Kama ni Wakala):
                  </label>
                  <input
                    type="text"
                    value={newTillNumber}
                    onChange={(e) => setNewTillNumber(e.target.value)}
                    placeholder="mf. 584201"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-mono font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* NIDA NIN & Region */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                    Namba ya NIDA (NIN):
                  </label>
                  <input
                    type="text"
                    value={newNin}
                    onChange={(e) => setNewNin(e.target.value)}
                    placeholder="19900315-11103-00001-21"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-mono text-[11px] focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                    Mkoa wa Kazi:
                  </label>
                  <select
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold focus:outline-none focus:border-emerald-600"
                  >
                    <option value="DAR ES SALAAM">DAR ES SALAAM</option>
                    <option value="DODOMA">DODOMA</option>
                    <option value="ARUSHA">ARUSHA</option>
                    <option value="MWANZA">MWANZA</option>
                    <option value="KIGOMA">KIGOMA</option>
                    <option value="MBEYA">MBEYA</option>
                    <option value="TANGA">TANGA</option>
                    <option value="ZANZIBAR">ZANZIBAR</option>
                  </select>
                </div>
              </div>

              {/* Branch / Location */}
              <div>
                <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                  Jina la Kituo / Tawi (Branch / Agency Location):
                </label>
                <input
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="mf. Kariakoo Congo St. Telecom Desk"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-medium focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Manual Logo Upload Section */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-800 text-[11px] flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Weka Nembo kwa Mkono (Manual Logo Upload) - Hiari:</span>
                  </label>
                  {newCustomLogo && (
                    <button
                      type="button"
                      onClick={() => setNewCustomLogo('')}
                      className="text-[10px] text-rose-600 hover:underline font-bold cursor-pointer"
                    >
                      Ondoa Nembo
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-300 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                    {newCustomLogo ? (
                      <img src={newCustomLogo} alt="Custom Logo" className="w-full h-full object-contain" />
                    ) : (
                      <TelecomLogo carrier={newCarrier} size="sm" variant="icon" />
                    )}
                  </div>

                  <div className="flex-1">
                    <input
                      type="file"
                      id="reg-logo-file-input"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => setNewCustomLogo(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="reg-logo-file-input"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer shadow-2xs transition-colors"
                    >
                      <Upload className="w-3 h-3 text-slate-500" />
                      <span>{newCustomLogo ? 'Badilisha Picha ya Nembo' : 'Chagua Nembo (PNG, JPG, SVG)'}</span>
                    </label>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Kama ukiacha wazi, nembo asilia ya {newCarrier} itatumika.
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Ghairi (Cancel)
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-colors cursor-pointer"
                >
                  Sajili na Tengeneza Kadi
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Manual Logo Manager Modal */}
      <ManualLogoModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        activeAgent={activeAgent}
        defaultCarrier={selectedCarrier === 'ALL' ? 'Vodacom' : selectedCarrier}
        onLogoUpdated={() => loadData()}
      />

    </div>
  );
};
