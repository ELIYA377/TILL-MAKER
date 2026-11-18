import React, { useState } from 'react';
import { NidaRecord } from '../types';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  Printer, 
  ShieldCheck, 
  User, 
  Calendar, 
  MapPin, 
  Fingerprint, 
  FileText,
  RotateCw,
  Clock,
  Phone,
  Radio,
  Smartphone,
  MessageSquare
} from 'lucide-react';
import badgeImage from '../assets/images/nida_metallic_badge_1790171872604.jpg';
import { detectCarrier } from '../data/mockRecords';

interface ResultCardProps {
  record: NidaRecord;
  onPrint: () => void;
  onNewSearch: () => void;
  isGenerated?: boolean;
  matchedBy?: 'phone' | 'nin' | 'name' | null;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  record,
  onPrint,
  onNewSearch,
  isGenerated = false,
  matchedBy = null,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'sims' | 'details' | 'back' | 'json_api'>('card');

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const primaryCarrier = detectCarrier(record.primaryPhone);

  const getStatusBadge = () => {
    switch (record.verificationStatus) {
      case 'VERIFIED':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-xs font-mono font-bold tracking-wider shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>VERIFIED & ACTIVE</span>
          </div>
        );
      case 'PENDING_UPDATE':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold tracking-wider">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>PENDING BIOMETRIC UPDATE</span>
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/40 text-blue-300 text-xs font-mono font-bold tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>STANDARD REGISTRY</span>
          </div>
        );
    }
  };

  const formatPhoneDisplay = (phone: string) => {
    if (phone.length === 10) {
      return `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`;
    }
    return phone;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Banner Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs">
        <div className="flex items-center gap-2 text-neutral-300 flex-wrap">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Taarifa zimehakikiwa kutoka <strong>Kanzidata ya NIDA & TCRA</strong></span>
          {matchedBy === 'phone' && (
            <span className="text-[10px] text-emerald-400 font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-1">
              <Phone className="w-2.5 h-2.5" /> IMEPATIKANA KWA NAMBA YA SIMU
            </span>
          )}
          {isGenerated && (
            <span className="text-[10px] text-amber-400 font-mono px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
              SYNTHESIZED LOOKUP
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Card View Switchers */}
          <div className="p-1 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setViewMode('card')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                viewMode === 'card'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Kitambulisho (Front)
            </button>
            <button
              onClick={() => setViewMode('sims')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                viewMode === 'sims'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Smartphone className="w-3 h-3 text-emerald-400" />
              <span>Laini za Simu ({record.registeredSims?.length || 1})</span>
            </button>
            <button
              onClick={() => setViewMode('back')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                viewMode === 'back'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Card Back
            </button>
            <button
              onClick={() => setViewMode('details')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                viewMode === 'details'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Data Ledger
            </button>
            <button
              onClick={() => setViewMode('json_api')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1 font-mono ${
                viewMode === 'json_api'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span>lookup.php (JSON)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Card View: Front of National ID Card */}
      {viewMode === 'card' && (
        <div className="relative rounded-2xl bg-gradient-to-br from-[#111622] via-[#0E131C] to-[#080B10] p-6 md:p-8 border border-amber-500/30 shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.15)] overflow-hidden">
          {/* Holographic Guilloche Pattern & Watermark Background */}
          <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-amber-500/20 gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl p-[1px] bg-gradient-to-tr from-amber-300 via-amber-600 to-yellow-500 overflow-hidden shadow-md shrink-0">
                <img
                  src={badgeImage}
                  alt="NIDA Crest"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-widest text-amber-300 font-mono font-bold">
                  JAMHURI YA MUUNGANO WA TANZANIA
                </h3>
                <h2 className="text-base sm:text-lg font-bold text-neutral-100 tracking-wide font-sans">
                  NATIONAL IDENTIFICATION AUTHORITY (NIDA)
                </h2>
                <p className="text-[11px] text-neutral-400 font-mono">
                  CITIZEN IDENTITY CARD · KITAMBULISHO CHA TAIFA
                </p>
              </div>
            </div>

            <div className="flex items-center sm:self-start">
              {getStatusBadge()}
            </div>
          </div>

          {/* Card Body: Biometric Photo + Core ID Fields */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Photo & Biometric Security Area */}
            <div className="md:col-span-4 flex flex-col items-center sm:items-start space-y-4">
              <div className="relative w-40 h-48 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 border-2 border-amber-500/40 p-1 shadow-lg overflow-hidden group">
                {/* Photo frame */}
                <div className={`w-full h-full rounded-lg bg-gradient-to-br ${record.avatarPlaceholderColor || 'from-neutral-700 to-neutral-900'} flex flex-col items-center justify-center relative overflow-hidden`}>
                  <User className="w-20 h-20 text-neutral-300/80 drop-shadow-md" />
                  
                  {/* Holographic Watermark across photo */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2.5">
                    <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider">
                      {record.nationality}
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                      <Fingerprint className="w-3 h-3" /> CHIP ENCRYPTED
                    </span>
                  </div>

                  {/* Corner security notch */}
                  <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-neutral-950/80 text-[8px] font-mono text-amber-400 border border-amber-500/30">
                    BIO-PASSED
                  </div>
                </div>

                {/* Shimmer line */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform pointer-events-none" />
              </div>

              {/* Digital Smart Chip Graphic */}
              <div className="w-40 flex items-center justify-between px-3 py-2 rounded-lg bg-neutral-950 border border-amber-500/20 text-[10px] font-mono text-neutral-300">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-3 rounded-[2px] bg-gradient-to-r from-yellow-400 to-amber-600 border border-amber-300" />
                  <span>NIDA-SECURE</span>
                </div>
                <span className="text-emerald-400 font-bold">256-BIT</span>
              </div>
            </div>

            {/* Right Fields Grid */}
            <div className="md:col-span-8 space-y-4">
              {/* Full Name Field */}
              <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800">
                <div className="flex items-center justify-between text-xs text-neutral-400 font-mono mb-1">
                  <span>FULL NAME / MAJINA KAMILI</span>
                  <button
                    onClick={() => copyToClipboard(record.fullName, 'name')}
                    className="hover:text-amber-400 transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    {copiedField === 'name' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="text-lg md:text-xl font-extrabold text-neutral-100 tracking-wide font-sans">
                  {record.fullName}
                </div>
              </div>

              {/* ID Number (NIN) Field - Prominent */}
              <div className="p-3.5 rounded-xl bg-neutral-950/90 border border-amber-500/40 relative overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-emerald-400" />
                <div className="flex items-center justify-between text-xs text-amber-400 font-mono mb-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
                    NATIONAL IDENTIFICATION NUMBER (NIN)
                  </span>
                  <button
                    onClick={() => copyToClipboard(record.nin, 'nin')}
                    className="hover:text-amber-300 transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    {copiedField === 'nin' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy NIN</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="text-base sm:text-2xl font-mono font-bold tracking-wider text-emerald-300 tabular-nums">
                  {record.nin}
                </div>
              </div>

              {/* NEW: Prominent Registered Phone Number Field */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-neutral-950 via-[#0B1416] to-neutral-950 border border-emerald-500/35 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-neutral-400 font-mono mb-1">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    NAMBA YA SIMU ILIYOSAJILIWA (TCRA BIOMETRIC LINK)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {primaryCarrier}
                    </span>
                    <button
                      onClick={() => copyToClipboard(record.primaryPhone, 'phone')}
                      className="hover:text-emerald-300 transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      {copiedField === 'phone' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2 mt-1">
                  <div className="text-lg sm:text-xl font-mono font-extrabold text-neutral-100 tracking-wider flex items-center gap-2">
                    <span>{formatPhoneDisplay(record.primaryPhone)}</span>
                    <span className="text-xs font-sans text-neutral-400">({record.nationality})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${record.primaryPhone}`}
                      className="px-2.5 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <span>Piga</span>
                    </a>
                    <a
                      href={`https://wa.me/255${record.primaryPhone.replace(/^0/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-md bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <MessageSquare className="w-3 h-3 text-emerald-400" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

                <div className="mt-2 text-[10px] text-neutral-400 font-mono flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Laini imethibitishwa kwa alama za vidole kupitia mfumo wa NIDA & Kampuni ya Mawasiliano.</span>
                </div>
              </div>

              {/* Grid of Key Info: Gender, DOB, Nationality, Citizenship */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
                  <span className="block text-[10px] font-mono text-neutral-400 uppercase">
                    Gender / Jinsia
                  </span>
                  <span className="text-sm font-bold text-neutral-100 uppercase mt-0.5 block">
                    {record.gender}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
                  <span className="block text-[10px] font-mono text-neutral-400 uppercase">
                    Date of Birth
                  </span>
                  <span className="text-sm font-mono font-bold text-amber-200 mt-0.5 block">
                    {record.dateOfBirth}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">({record.age} yrs)</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
                  <span className="block text-[10px] font-mono text-neutral-400 uppercase">
                    Nationality
                  </span>
                  <span className="text-sm font-bold text-emerald-400 mt-0.5 block">
                    {record.nationality}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
                  <span className="block text-[10px] font-mono text-neutral-400 uppercase">
                    Status
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-300 mt-0.5 block truncate">
                    {record.verificationStatus}
                  </span>
                </div>
              </div>

              {/* Geographic Birth & Residence Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="text-[10px] font-mono text-neutral-400 block uppercase">
                      Place of Birth
                    </span>
                    <span className="font-semibold text-neutral-200">
                      {record.placeOfBirth.region} · {record.placeOfBirth.district}
                    </span>
                    <p className="text-[11px] text-neutral-400">Ward: {record.placeOfBirth.ward}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="text-[10px] font-mono text-neutral-400 block uppercase">
                      Validity Period
                    </span>
                    <span className="font-semibold text-neutral-200">
                      Issued: {record.issueDate}
                    </span>
                    <p className="text-[11px] text-emerald-400 font-mono">Expires: {record.expiryDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Card Footer: Barcode Visualization & Security Hash */}
          <div className="mt-6 pt-4 border-t border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col items-center sm:items-start">
              <div className="h-7 flex items-center gap-[2px] bg-white p-1 rounded">
                {[2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 1, 2, 3, 2, 1, 3, 1, 2, 4, 2, 1, 3, 2, 1, 2].map((w, i) => (
                  <div
                    key={i}
                    className="bg-black h-full"
                    style={{ width: `${w}px` }}
                  />
                ))}
              </div>
              <span className="text-[9px] font-mono text-neutral-400 tracking-widest mt-1">
                {record.documentNumber}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 font-mono">
              <span className="text-neutral-400">Checksum:</span>
              <span className="text-amber-400">{record.securityChecksum}</span>
              <div className="flex items-center gap-1 text-emerald-400 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>NIDA & TCRA VERIFIED</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Dedicated SIM Cards & Mobile Subscriptions View */}
      {viewMode === 'sims' && (
        <div className="rounded-2xl bg-neutral-950/90 border border-neutral-800 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-800 gap-2">
            <div>
              <h3 className="text-sm font-mono font-bold text-amber-400 uppercase flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Laini za Simu Zilizosajiliwa na NIDA hii (TCRA Biometric Registry)</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Orodha ya laini zote za simu zilizothibitishwa kwa alama za vidole vya {record.fullName}.
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
              Jumla: {record.registeredSims.length} Laini
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {record.registeredSims.map((sim, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-emerald-500/40 transition-all space-y-3 relative overflow-hidden"
              >
                {sim.isPrimary && (
                  <span className="absolute top-2 right-2 text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    LAINI KUU (PRIMARY)
                  </span>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-neutral-950 border border-neutral-700 flex items-center justify-center text-emerald-400">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-200 block">
                      Mtandao: {sim.carrier}
                    </span>
                    <span className="text-base font-mono font-bold text-emerald-300">
                      {formatPhoneDisplay(sim.msisdn)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-800/80 grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div>
                    <span className="text-neutral-500 block">Hali ya Usajili</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Biometric OK
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Tarehe ya Usajili</span>
                    <span className="text-neutral-300">{sim.registrationDate}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-neutral-500 block">SIM Card Serial</span>
                    <span className="text-neutral-400">{sim.simSerial}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => copyToClipboard(sim.msisdn, `sim-${index}`)}
                    className="flex-1 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedField === `sim-${index}` ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Imenakiliwa</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Nakili Namba</span>
                      </>
                    )}
                  </button>
                  <a
                    href={`tel:${sim.msisdn}`}
                    className="px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Piga</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Back View of Card */}
      {viewMode === 'back' && (
        <div className="relative rounded-2xl bg-gradient-to-br from-[#111622] via-[#0E131C] to-[#080B10] p-6 md:p-8 border border-neutral-800 shadow-2xl overflow-hidden space-y-6">
          {/* Magnetic Stripe */}
          <div className="w-full h-12 bg-neutral-950 rounded border-y border-neutral-800 shadow-inner flex items-center px-4">
            <span className="text-[9px] font-mono text-neutral-700 tracking-[0.3em]">
              ISO/IEC 7810 ID-1 STANDARDS · ENCRYPTED TRACK 1 & 2
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-neutral-300">
            <div className="space-y-3 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800">
              <h4 className="font-mono text-amber-400 font-bold uppercase text-[11px]">
                Residential Address & Location
              </h4>
              <p><strong>Region:</strong> {record.residence.region}</p>
              <p><strong>District:</strong> {record.residence.district}</p>
              <p><strong>Ward:</strong> {record.residence.ward}</p>
              <p><strong>Street:</strong> {record.residence.street}</p>
              <p><strong>Primary Phone:</strong> {record.primaryPhone}</p>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800">
              <h4 className="font-mono text-emerald-400 font-bold uppercase text-[11px]">
                Biometric Enrollment Verification
              </h4>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ten Fingerprints Enrolled in Database</span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Facial Geometric Recognition Active</span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Citizenship: {record.citizenshipType}</span>
              </p>
            </div>
          </div>

          {/* Machine Readable Zone (MRZ) */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-[11px] text-amber-400/90 tracking-widest leading-relaxed overflow-x-auto">
            <p>I&lt;TZA{record.nin.replace(/[-–\s]/g, '').padEnd(25, '<')}&lt;&lt;&lt;&lt;&lt;&lt;</p>
            <p>{record.dateOfBirth.replace(/-/g, '').slice(2)}0{record.gender.charAt(0)}{record.expiryDate.replace(/-/g, '').slice(2)}8TZA&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;8</p>
            <p>{record.lastName}&lt;&lt;{record.firstName}&lt;{record.middleName || ''}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</p>
          </div>
        </div>
      )}

      {/* Ledger Table View */}
      {viewMode === 'details' && (
        <div className="rounded-2xl bg-neutral-950/80 border border-neutral-800 overflow-hidden">
          <div className="p-4 bg-neutral-900/60 border-b border-neutral-800 flex items-center justify-between">
            <span className="font-mono text-xs text-amber-400 uppercase font-bold">
              Raw National Registry Ledger
            </span>
            <span className="text-xs text-neutral-400 font-mono">RECORD ID: {record.id}</span>
          </div>

          <div className="divide-y divide-neutral-900 text-xs">
            <div className="grid grid-cols-3 p-3 hover:bg-neutral-900/30">
              <span className="text-neutral-400">Full Name</span>
              <span className="col-span-2 font-semibold text-neutral-200">{record.fullName}</span>
            </div>
            <div className="grid grid-cols-3 p-3 hover:bg-neutral-900/30">
              <span className="text-neutral-400">National ID (NIN)</span>
              <span className="col-span-2 font-mono text-emerald-300">{record.nin}</span>
            </div>
            <div className="grid grid-cols-3 p-3 hover:bg-neutral-900/30">
              <span className="text-neutral-400">Primary Phone (Simu)</span>
              <span className="col-span-2 font-mono text-emerald-400 font-semibold">{record.primaryPhone} ({primaryCarrier})</span>
            </div>
            <div className="grid grid-cols-3 p-3 hover:bg-neutral-900/30">
              <span className="text-neutral-400">Total Registered SIMs</span>
              <span className="col-span-2 font-mono text-neutral-200">{record.registeredSims.length} SIM Card(s)</span>
            </div>
            <div className="grid grid-cols-3 p-3 hover:bg-neutral-900/30">
              <span className="text-neutral-400">Gender</span>
              <span className="col-span-2 text-neutral-200">{record.gender}</span>
            </div>
            <div className="grid grid-cols-3 p-3 hover:bg-neutral-900/30">
              <span className="text-neutral-400">Date of Birth</span>
              <span className="col-span-2 font-mono text-neutral-200">{record.dateOfBirth} ({record.age} years)</span>
            </div>
            <div className="grid grid-cols-3 p-3 hover:bg-neutral-900/30">
              <span className="text-neutral-400">Place of Birth</span>
              <span className="col-span-2 text-neutral-200">{record.placeOfBirth.region}, {record.placeOfBirth.district}, {record.placeOfBirth.ward}</span>
            </div>
            <div className="grid grid-cols-3 p-3 hover:bg-neutral-900/30">
              <span className="text-neutral-400">Citizenship Type</span>
              <span className="col-span-2 text-neutral-200">{record.citizenshipType}</span>
            </div>
            <div className="grid grid-cols-3 p-3 hover:bg-neutral-900/30">
              <span className="text-neutral-400">Verification Status</span>
              <span className="col-span-2 font-mono text-emerald-400 font-bold">{record.verificationStatus}</span>
            </div>
            <div className="grid grid-cols-3 p-3 hover:bg-neutral-900/30">
              <span className="text-neutral-400">Cryptographic Checksum</span>
              <span className="col-span-2 font-mono text-amber-400">{record.securityChecksum}</span>
            </div>
            <div className="grid grid-cols-3 p-3 hover:bg-neutral-900/30">
              <span className="text-neutral-400">Status Notes</span>
              <span className="col-span-2 text-neutral-400">{record.statusNotes}</span>
            </div>
          </div>
        </div>
      )}

      {/* Sinsoft lookup.php JSON API View */}
      {viewMode === 'json_api' && (
        <div className="rounded-2xl bg-neutral-950 border border-blue-500/30 overflow-hidden shadow-xl">
          <div className="px-5 py-3 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs text-blue-400">
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">200 OK</span>
              <span className="text-neutral-300">application/json · /id/lookup.php</span>
            </div>
            <button
              onClick={() => copyToClipboard(JSON.stringify({
                status: 200,
                success: true,
                message: "NIDA Record retrieved successfully from Central Identification Registry",
                query: record.nin,
                query_type: "nin",
                charge: 40.0,
                remaining_balance: 440.0,
                timestamp: new Date().toISOString(),
                data: {
                  nin: record.nin,
                  first_name: record.firstName,
                  middle_name: record.middleName,
                  last_name: record.lastName,
                  full_name: record.fullName,
                  gender: record.gender,
                  date_of_birth: record.dateOfBirth,
                  age: record.age,
                  nationality: record.nationality,
                  phone: record.primaryPhone,
                  carrier: primaryCarrier,
                  registered_sims: record.registeredSims,
                  place_of_birth: record.placeOfBirth,
                  residence: record.residence,
                  verification_status: record.verificationStatus,
                  checksum: record.securityChecksum,
                }
              }, null, 2), 'sinsoft_json')}
              className="text-xs font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              {copiedField === 'sinsoft_json' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy JSON Payload</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-5 text-xs font-mono text-emerald-400 leading-relaxed overflow-x-auto max-h-96">
            <code>
              {JSON.stringify({
                status: 200,
                success: true,
                message: "NIDA Record retrieved successfully from Central Identification Registry",
                query: record.nin,
                query_type: "nin",
                charge: 40.0,
                remaining_balance: 440.0,
                timestamp: new Date().toISOString(),
                data: {
                  nin: record.nin,
                  nin_raw: record.nin.replace(/\D/g, ''),
                  first_name: record.firstName,
                  middle_name: record.middleName || '',
                  last_name: record.lastName,
                  full_name: record.fullName,
                  gender: record.gender,
                  date_of_birth: record.dateOfBirth,
                  age: record.age,
                  nationality: record.nationality || 'TANZANIAN',
                  citizenship_type: record.citizenshipType,
                  phone: record.primaryPhone,
                  carrier: primaryCarrier,
                  registered_sims: record.registeredSims,
                  place_of_birth: record.placeOfBirth,
                  residence: record.residence,
                  biometrics: {
                    fingerprint_enrolled: record.fingerprintEnrolled,
                    facial_matched: record.facialRecognitionMatched,
                    status: 'VERIFIED_OK'
                  },
                  verification_status: record.verificationStatus,
                  document_number: record.documentNumber,
                  issue_date: record.issueDate,
                  expiry_date: record.expiryDate,
                  photo_url: record.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
                  security_checksum: record.securityChecksum,
                }
              }, null, 2)}
            </code>
          </pre>
        </div>
      )}

      {/* Action Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          onClick={onNewSearch}
          className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5 text-neutral-400" />
          <span>Utafutaji Mpya / New Query</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => copyToClipboard(JSON.stringify(record, null, 2), 'all')}
            className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            {copiedField === 'all' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Imenakiliwa!</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Copy JSON</span>
              </>
            )}
          </button>

          <button
            onClick={onPrint}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-emerald-400 hover:to-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Chapisha Cheti (Print Slip)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
