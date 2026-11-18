import React, { useState } from 'react';
import { 
  CreditCard, 
  RotateCw, 
  Printer, 
  Download, 
  ShieldCheck, 
  Check, 
  Copy, 
  User as UserIcon, 
  FileText,
  Building,
  QrCode,
  Share2,
  CheckCircle2,
  Upload
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useLanguage } from '../../context/LanguageContext';
import { NidaRecord } from '../../types';
import { SmartIdStore } from '../../services/smartIdStore';
import sealImage from '../../assets/images/coat_of_arms_seal_1790750477491.jpg';
import badgeImage from '../../assets/images/nida_metallic_badge_1790171872604.jpg';
import { TelecomLogo, TELECOM_CARRIERS } from './TelecomLogos';

interface DigitalIdCardProps {
  citizen: NidaRecord;
  allCitizens: NidaRecord[];
  onSelectCitizen: (citizen: NidaRecord) => void;
  onOpenCertificateModal: (nin: string) => void;
}

export const DigitalIdCard: React.FC<DigitalIdCardProps> = ({
  citizen,
  allCitizens,
  onSelectCitizen,
  onOpenCertificateModal,
}) => {
  const { t } = useLanguage();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [manualLogo, setManualLogo] = useState<string | undefined>(
    () => citizen.customLogoUrl || SmartIdStore.getDefaultCitizenLogo()
  );

  React.useEffect(() => {
    setManualLogo(citizen.customLogoUrl || SmartIdStore.getDefaultCitizenLogo());
  }, [citizen]);

  const handleUploadLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setManualLogo(url);
        SmartIdStore.updateCitizenLogo(citizen.nin, url);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogo = () => {
    setManualLogo(undefined);
    SmartIdStore.updateCitizenLogo(citizen.nin, undefined);
  };

  // QR Code Payload encoding authentic citizen identity data
  const qrPayload = JSON.stringify({
    nin: citizen.nin,
    name: citizen.fullName,
    dob: citizen.dateOfBirth,
    gender: citizen.gender,
    phone: citizen.primaryPhone,
    residence: citizen.residence.region,
    docNumber: citizen.documentNumber,
    checksum: citizen.securityChecksum,
    validThrough: citizen.expiryDate,
    status: citizen.verificationStatus,
    authority: 'MAMLAKA YA VITAMBULISHO VYA TAIFA (NIDA) - TANZANIA',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(citizen, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `NIDA_Smart_Pass_${citizen.nin}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyNin = () => {
    navigator.clipboard.writeText(citizen.nin);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Controller Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {t.generator_title}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {t.generator_subtitle}
            </p>
          </div>

          {/* Citizen Switcher Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="citizenSelect" className="text-xs font-bold text-slate-600 whitespace-nowrap">
              {t.select_citizen_label}
            </label>
            <select
              id="citizenSelect"
              value={citizen.nin}
              onChange={(e) => {
                const found = allCitizens.find((c) => c.nin === e.target.value);
                if (found) onSelectCitizen(found);
              }}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs font-bold focus:outline-none focus:border-emerald-600 cursor-pointer max-w-[200px] truncate"
            >
              {allCitizens.map((c) => (
                <option key={c.id} value={c.nin}>
                  {c.fullName} ({c.nin.slice(0, 8)}...)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => setIsFlipped(!isFlipped)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{isFlipped ? t.card_front_title : t.card_back_title} (Flip Card)</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t.btn_print_card}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadJson}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-300 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.btn_download_card}</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenCertificateModal(citizen.nin)}
              className="px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* THE SMART DIGITAL ID CARD ITSELF                                          */}
      {/* ========================================================================= */}
      <div className="flex justify-center py-4 print:py-0">
        <div className="w-full max-w-xl transition-all duration-300">
          
          {/* Official Tanzanian Smart ID Card Geometry */}
          <div className="relative aspect-[1.58/1] w-full rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-800 bg-gradient-to-br from-slate-950 via-[#0a1e38] to-slate-900 text-white p-6 flex flex-col justify-between select-none print:shadow-none print:border-black">
            
            {/* Holographic Guilloche Pattern & Green Security Stripe */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-yellow-400 to-emerald-500" />

            {!isFlipped ? (
              /* ================== FRONT SIDE ================== */
              <>
                {/* Header Lockup */}
                <div className="relative flex items-start justify-between gap-3 pb-3 border-b border-slate-700/60">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900/90 p-1.5 border border-slate-700 shadow-md shrink-0">
                      <img 
                        src={sealImage} 
                        alt="Tanzania Seal" 
                        className="w-full h-full object-contain" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-extrabold block">
                        JAMHURI YA MUUNGANO WA TANZANIA
                      </span>
                      <h3 className="text-xs sm:text-sm font-black tracking-wide text-white block">
                        NATIONAL IDENTIFICATION AUTHORITY (NIDA)
                      </h3>
                      <span className="text-[9px] text-slate-300 tracking-wider font-mono">
                        KITAMBULISHO CHA TAIFA · SMART CITIZEN PASS
                      </span>
                    </div>
                  </div>

                  {/* Metallic Smart Microchip Emblem */}
                  <div className="w-9 h-8 rounded-md bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 border border-amber-600 shadow-xs flex items-center justify-center p-0.5 shrink-0">
                    <div className="w-full h-full border border-amber-800/40 rounded-xs grid grid-cols-2 gap-0.5 p-0.5">
                      <div className="border border-amber-900/30 rounded-2xs" />
                      <div className="border border-amber-900/30 rounded-2xs" />
                      <div className="border border-amber-900/30 rounded-2xs" />
                      <div className="border border-amber-900/30 rounded-2xs" />
                    </div>
                  </div>
                </div>

                {/* Middle Body: Photo & Demographic Details */}
                <div className="relative grid grid-cols-12 gap-4 items-center my-auto">
                  {/* Photo with security frame */}
                  <div className="col-span-4 aspect-[4/5] rounded-2xl overflow-hidden border-2 border-slate-600 bg-slate-800 shadow-md relative">
                    <img 
                      src={citizen.avatarUrl} 
                      alt={citizen.fullName} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-center py-0.5 text-[8px] font-mono text-emerald-400 font-bold">
                      VERIFIED TIER-3
                    </div>
                  </div>

                  {/* Detailed citizen info */}
                  <div className="col-span-8 space-y-2 text-xs">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-medium">
                        {t.card_name}
                      </span>
                      <p className="font-black text-white text-sm tracking-wide truncate">
                        {citizen.fullName}
                      </p>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-medium">
                        {t.card_nin}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-emerald-400 text-sm sm:text-base tracking-wider">
                          {citizen.nin}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyNin}
                          className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                          title="Copy NIN"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-slate-400 block">{t.card_dob}</span>
                        <span className="font-bold text-slate-200 font-mono">{citizen.dateOfBirth}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">{t.card_gender}</span>
                        <span className="font-bold text-slate-200">{citizen.gender}</span>
                      </div>
                    </div>

                    <div className="text-[10px]">
                      <span className="text-slate-400 block">URAIA / NATIONALITY:</span>
                      <span className="font-bold text-slate-200">{citizen.nationality} ({citizen.citizenshipType})</span>
                    </div>
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="relative pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{t.card_doc_num} {citizen.documentNumber}</span>
                  <span className="text-emerald-400 font-bold">ICAO 9303 / TCRA BIOMETRICS ACTIVE</span>
                </div>
              </>
            ) : (
              /* ================== BACK SIDE ================== */
              <>
                <div className="relative flex items-center justify-between border-b border-slate-700/60 pb-2.5">
                  <div>
                    <span className="text-[9px] text-emerald-400 uppercase tracking-widest block font-bold">
                      {t.issuing_authority}
                    </span>
                    <span className="text-xs font-black text-white">OFFICIAL REPUBLIC RESIDENT PASS</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 block">VALIDITY HORIZON</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">{citizen.issueDate} · {citizen.expiryDate}</span>
                  </div>
                </div>

                <div className="relative grid grid-cols-12 gap-4 items-center my-auto">
                  {/* Left info */}
                  <div className="col-span-8 space-y-1.5 text-xs text-slate-300">
                    <p className="text-[11px]">
                      <strong className="text-slate-400">Place of Birth:</strong> {citizen.placeOfBirth.region}, {citizen.placeOfBirth.district}
                    </p>
                    <p className="text-[11px]">
                      <strong className="text-slate-400">Residential Address:</strong> {citizen.residence.street}, {citizen.residence.ward}, {citizen.residence.region}
                    </p>
                    <p className="text-[11px]">
                      <strong className="text-slate-400">Primary Phone:</strong> <span className="font-mono">{citizen.primaryPhone}</span>
                    </p>
                    <div className="pt-1 text-[9px] text-slate-400 italic">
                      Hati hii ni mali ya Serikali ya Jamhuri ya Muungano wa Tanzania. Ikiokotwa irudishwe kwenye ofisi ya NIDA iliyo karibu au kituo cha polisi.
                    </div>
                  </div>

                  {/* Scannable Real QR Code generated from citizen payload */}
                  <div className="col-span-4 flex flex-col items-center justify-center p-2 rounded-2xl bg-white text-slate-950 shadow-lg shrink-0">
                    <QRCodeSVG 
                      value={qrPayload}
                      size={105}
                      level="M"
                      includeMargin={false}
                    />
                    <span className="text-[8px] font-mono font-bold text-slate-700 tracking-wider uppercase mt-1">
                      SCAN FOR DETAILS
                    </span>
                  </div>
                </div>

                {/* Machine Readable Zone (MRZ) */}
                <div className="relative pt-2.5 border-t border-slate-700/60 font-mono text-[9px] tracking-widest text-slate-400 leading-tight">
                  <p>IDTZA{citizen.nin.replace(/\D/g, '').slice(0, 15)}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</p>
                  <p>{citizen.dateOfBirth.replace(/-/g, '').slice(2)}8M3012318TZA&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;8</p>
                </div>
              </>
            )}

          </div>

          <div className="mt-3 text-center text-xs text-slate-400">
            {t.national_motto}
          </div>
        </div>

        {/* ================================================================= */}
        {/* REGISTERED TELECOM SIMS & CARRIER LOGOS LINKED TO CITIZEN         */}
        {/* ================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Laini za Simu Zilizosajiliwa Kibiometria (TCRA / MNO SIMs)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Mitandao ya simu iliyounganishwa rasmi na Namba ya NIDA ya mwananchi huyu.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              {citizen.registeredSims.length} Laini Zipo Hai
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {citizen.registeredSims.map((sim, idx) => (
              <div 
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <TelecomLogo carrier={sim.carrier} size="md" variant="icon" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-900">{sim.carrier}</span>
                      {sim.isPrimary && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-sm bg-blue-100 text-blue-800">
                          Msingi
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-800 block">
                      {sim.msisdn}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono block">
                      Serial: {sim.simSerial.slice(0, 14)}...
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>TCRA Verified</span>
                  </span>
                  <span className="text-[9px] text-slate-400 block mt-1">
                    Tarehe: {sim.registrationDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
