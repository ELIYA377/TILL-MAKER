import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  Search, 
  CheckCircle2, 
  ArrowRight, 
  UserCheck, 
  KeyRound, 
  FileCheck, 
  Server, 
  Globe, 
  ChevronDown, 
  ExternalLink,
  QrCode,
  Fingerprint,
  Building2,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  HelpCircle,
  Phone
} from 'lucide-react';
import { NidaRecord } from '../../types';
import { executeSinsoftLookup } from '../../services/apiService';
import heroImage from '../../assets/images/hero_digital_id_pass_1790750456457.jpg';
import sealImage from '../../assets/images/coat_of_arms_seal_1790750477491.jpg';
import badgeImage from '../../assets/images/nida_metallic_badge_1790171872604.jpg';

interface LandingPageProps {
  onNavigateToAuth: (mode?: 'login' | 'register') => void;
  onOpenCertificateModal: (nin: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToAuth,
  onOpenCertificateModal,
}) => {
  // Public Instant Verification state
  const [quickQuery, setQuickQuery] = useState('19900315-11103-00001-21');
  const [isVerifying, setIsVerifying] = useState(false);
  const [quickResult, setQuickResult] = useState<any | null>(null);
  const [quickError, setQuickError] = useState<string | null>(null);
  const [copiedNin, setCopiedNin] = useState(false);

  // FAQ state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleQuickVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = quickQuery.trim();
    if (!clean) {
      setQuickError('Please enter a National ID number or registered mobile number.');
      return;
    }

    setIsVerifying(true);
    setQuickError(null);
    setQuickResult(null);

    setTimeout(() => {
      const response = executeSinsoftLookup({
        query: clean,
        userPhone: '0784615052',
        deductCredit: false,
      });

      setIsVerifying(false);
      if (response.success && response.data) {
        setQuickResult(response.data);
      } else {
        setQuickError(response.message || 'No record matched this identification query in the civil registry.');
      }
    }, 550);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNin(true);
    setTimeout(() => setCopiedNin(false), 2000);
  };

  const faqs = [
    {
      q: 'What is the NIDA Pass Portal?',
      a: 'The NIDA Pass Portal is the official digital identity and authentication gateway of the United Republic of Tanzania. It allows citizens and legal residents to access their cryptographic Digital Pass, verify National Identification Numbers (NIN), validate biometric links, and authenticate securely across government and private sector digital services.',
    },
    {
      q: 'How do I authenticate into the portal?',
      a: 'You can authenticate using your 20-digit National ID Number (NIN), registered civil email address, or verified mobile phone number along with your secure passkey password. Multi-factor verification ensures that your digital credential remains protected at all times.',
    },
    {
      q: 'Is the NIDA Digital Pass legally equivalent to the physical ID card?',
      a: 'Yes. In accordance with the National Identification Authority Act and digital governance regulations, the cryptographic NIDA Pass with its SHA-256 digital signature and verifiable QR code constitutes an authorized legal proof of identity for banking, travel, telecommunications, and government procedures.',
    },
    {
      q: 'How does real-time NIN verification work?',
      a: 'The portal connects directly via secured TLS 1.3 endpoints to the central NIDA civil database and TCRA telecom registry. When a verification query is initiated, biometric synchronization flags, citizenship classification, and document validity are confirmed instantaneously.',
    },
    {
      q: 'What should I do if my identity records require updating?',
      a: 'After authenticating into your User Dashboard, you can review your biographical profile, linked MSISDN telephone lines, and biometric clearance tier. For official name or biometric updates, you may initiate a renewal clearance ticket directly from the portal.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* ========================================================================= */}
      {/* TOP BAR CONTRACT: Zone 1 (Brand) — Zone 2 (4-6 Links) — Zone 3 (1-2 Actions) */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Zone 1: Single text element wordmark with official emblem */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center p-1.5 shadow-xs border border-slate-700">
              <img 
                src={sealImage} 
                alt="NIDA Seal" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <a href="/" className="text-xl font-bold tracking-tight text-slate-900 hover:text-blue-900 transition-colors">
              NIDA Pass Portal
            </a>
          </div>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#services" className="hover:text-blue-900 transition-colors">
              Services
            </a>
            <a href="#verification" className="hover:text-blue-900 transition-colors">
              Identity Verification
            </a>
            <a href="#security" className="hover:text-blue-900 transition-colors">
              Security Standards
            </a>
            <a href="#faq" className="hover:text-blue-900 transition-colors">
              Portal FAQ
            </a>
            <a href="#about" className="hover:text-blue-900 transition-colors">
              About NIDA
            </a>
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateToAuth('login')}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => onNavigateToAuth('register')}
              className="px-4.5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer whitespace-nowrap"
            >
              Register Pass
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* HERO SECTION                                                             */}
      {/* ========================================================================= */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200">
        {/* Subtle geometric background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Authoritative Government Typography & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              {/* Trust Kicker: Unboxed quiet metadata */}
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 uppercase tracking-wider">
                <span>United Republic of Tanzania</span>
                <span aria-hidden="true">·</span>
                <span>National Identification Authority (NIDA)</span>
              </div>

              {/* Display Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-950 leading-[1.15] text-balance">
                Official Digital Identification & Pass Authentication Gateway
              </h1>

              {/* Subtitle / Value Proposition */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                The centralized national credential service providing citizens, registered residents, and accredited organizations with instant digital pass issuance, cryptographic validation, and multi-factor biometric identity assurance.
              </p>

              {/* Call-to-action buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigateToAuth('login')}
                  className="px-6 py-3.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold text-sm shadow-md shadow-blue-900/15 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-blue-300" />
                  <span>Sign In to Pass Portal</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateToAuth('register')}
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-300 shadow-xs transition-all cursor-pointer flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4 text-slate-500" />
                  <span>Register for Citizen Pass</span>
                </button>

                <a
                  href="#verification"
                  className="px-4 py-3.5 text-xs font-semibold text-slate-600 hover:text-blue-900 transition-colors flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Instant Verification Check</span>
                </a>
              </div>

              {/* Trust Badges: Clean, unboxed text with typographic separators */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>ISO/IEC 27001 Certified</span>
                </div>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>ICAO 9303 PKI Compliant</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>TLS 1.3 256-Bit Encrypted</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>Civil Registry Connected</span>
              </div>
            </div>

            {/* Right Column: Hero Digital ID Pass Showcase Asset */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl shadow-slate-900/20">
                {/* Hero High-Fidelity Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                  <img 
                    src={heroImage} 
                    alt="Official NIDA Digital Identification Pass" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  
                  {/* Floating Security Chip Indicator */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-[11px] font-mono text-slate-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>PKI GATEWAY: ACTIVE</span>
                  </div>

                  <div className="absolute top-4 right-4 w-9 h-9 rounded-lg bg-slate-900/90 backdrop-blur-md p-1 border border-slate-700">
                    <img 
                      src={sealImage} 
                      alt="National Crest" 
                      className="w-full h-full object-contain" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* Card Live Metadata Panel */}
                <div className="p-5 bg-slate-900 text-white space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                        Official Identification Credential
                      </span>
                      <p className="text-sm font-bold text-white tracking-wide">
                        JAMHURI YA MUUNGANO WA TANZANIA
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">
                        Level-3 Assurance
                      </span>
                      <span className="text-xs font-mono text-slate-300">NIN-SYNC: ACTIVE</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Sample Passholder</span>
                      <p className="font-semibold text-slate-200">JUMA HAMISI BAKARI</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Civil Registry Status</span>
                      <p className="font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>VERIFIED CITIZEN</span>
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">National ID (NIN)</span>
                      <p className="font-mono font-bold text-blue-400">19900315-11103-00001-21</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Validity Horizon</span>
                      <p className="font-mono text-slate-300">2020 · 2030 (10 YRS)</p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
                    <span className="font-mono">HASH: 45524000122A-SHA256</span>
                    <button
                      type="button"
                      onClick={() => onNavigateToAuth('login')}
                      className="text-blue-400 hover:text-blue-300 font-semibold hover:underline cursor-pointer"
                    >
                      Authenticate Now &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* INTERACTIVE INSTANT CIVIL REGISTRY VERIFICATION WIDGET                    */}
      {/* ========================================================================= */}
      <section id="verification" className="py-16 bg-white border-b border-slate-200 scroll-mt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
              Live Registry Query
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Instant National Identification Verification
            </h2>
            <p className="text-sm text-slate-600">
              Verify any citizen or resident identification number or linked telecom MSISDN directly against official civil records.
            </p>
          </div>

          {/* Search Card Container */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <form onSubmit={handleQuickVerify} className="space-y-4">
              <div>
                <label 
                  htmlFor="quickQueryInput" 
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
                >
                  Enter National ID (NIN) or Registered Phone Number
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="quickQueryInput"
                      value={quickQuery}
                      onChange={(e) => setQuickQuery(e.target.value)}
                      placeholder="e.g. 19900315-11103-00001-21 or 0754112233"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-sm tracking-wide focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 whitespace-nowrap"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-blue-300" />
                        <span>Verify Record</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Sample Test Queries */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Quick Test Records:</span>
                <button
                  type="button"
                  onClick={() => setQuickQuery('19900315-11103-00001-21')}
                  className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-blue-900 text-slate-700 font-mono cursor-pointer transition-colors"
                >
                  Juma Hamisi (NIN)
                </button>
                <button
                  type="button"
                  onClick={() => setQuickQuery('19941208-14205-00129-22')}
                  className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-blue-900 text-slate-700 font-mono cursor-pointer transition-colors"
                >
                  Eliya Amos (NIN)
                </button>
                <button
                  type="button"
                  onClick={() => setQuickQuery('0754112233')}
                  className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-blue-900 text-slate-700 font-mono cursor-pointer transition-colors"
                >
                  0754112233 (Phone)
                </button>
              </div>
            </form>

            {/* Verification Result Output */}
            {quickResult && (
              <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-950 uppercase tracking-wide">
                        {quickResult.full_name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {quickResult.nationality} · {quickResult.citizenship_type}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
                      Official Record Validated
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenCertificateModal(quickResult.nin)}
                      className="px-3 py-1 text-xs font-semibold text-blue-900 hover:text-blue-800 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      Print Slip
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">National ID Number</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono font-bold text-slate-900 text-sm">{quickResult.nin}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(quickResult.nin)}
                        className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        title="Copy NIN"
                      >
                        {copiedNin ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Date of Birth & Gender</span>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {quickResult.date_of_birth} · {quickResult.gender}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Residence & Ward</span>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {quickResult.residence.region}, {quickResult.residence.district}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Biometric Clearance</span>
                    <p className="font-semibold text-emerald-700 mt-0.5 flex items-center gap-1">
                      <Fingerprint className="w-3.5 h-3.5" />
                      <span>Level-3 Enrolled</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {quickError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{quickError}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4 CORE SERVICES PILLARS                                                  */}
      {/* ========================================================================= */}
      <section id="services" className="py-20 bg-slate-50 border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
              National Infrastructure
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Comprehensive Digital Identity Management
            </h2>
            <p className="text-base text-slate-600">
              Modern digital civil registry services structured for seamless citizen interaction, institutional security compliance, and authorized identity verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center border border-blue-100">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                01. Citizen Digital Pass
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generate and carry an official cryptographic identification pass on any device. Protected by national public key infrastructure and offline verifiable QR code.
              </p>
              <div className="pt-2 text-xs font-semibold text-blue-900">
                <span>Instant Card Generation &rarr;</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-200">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                02. Real-Time NIN Registry
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct lookup against the central civil registry. Instant confirmation of citizen eligibility, birth registration, and identity synchronization status.
              </p>
              <div className="pt-2 text-xs font-semibold text-blue-900">
                <span>Direct Civil Verification &rarr;</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center border border-blue-100">
                <Fingerprint className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                03. Level-3 Biometric Assurance
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Multi-factor identification security backed by official biometric fingerprint registration and facial recognition alignment through TCRA telecom linkage.
              </p>
              <div className="pt-2 text-xs font-semibold text-blue-900">
                <span>Biometric Assurance &rarr;</span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-200">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                04. Enterprise Clearing Gateway
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dedicated high-throughput verification endpoints for banks, financial fintechs, mobile operators, and government authorities requiring Know-Your-Customer (KYC).
              </p>
              <div className="pt-2 text-xs font-semibold text-blue-900">
                <span>Institutional Protocols &rarr;</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECURITY STANDARDS & REGULATORY COMPLIANCE                                */}
      {/* ========================================================================= */}
      <section id="security" className="py-20 bg-white border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
              Governance & Compliance
            </span>
            <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">
              Government-Grade Security Architecture
            </h2>
            <p className="text-sm text-slate-600">
              The NIDA Pass Portal operates under the stringent data governance protocols mandated by the United Republic of Tanzania and international cryptographic standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-900 text-white flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                End-to-End Cryptography
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                All communications and sessions are protected by TLS 1.3 encryption with 256-bit asymmetric keys. Digital Pass QR codes are stamped with SHA-256 integrity checksums.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Data Protection Act 2022
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Citizen personal identifiable information (PII) is handled with zero unauthorized disclosure. Access audit logs track every query, timestamp, and verification actor.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-900 text-white flex items-center justify-center">
                <Server className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                High-Availability Infrastructure
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Redundant civil database cluster deployed across government data centers in Dodoma and Dar es Salaam, ensuring 99.98% operational uptime for digital identity checks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FREQUENTLY ASKED QUESTIONS (FAQ)                                         */}
      {/* ========================================================================= */}
      <section id="faq" className="py-20 bg-slate-50 border-b border-slate-200 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
              Citizen Support
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Clear answers regarding national digital pass issuance, biometric verification, and authentication procedures.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-slate-900 hover:text-blue-900 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaqIndex === idx ? 'rotate-180 text-blue-900' : ''}`} />
                </button>
                {openFaqIndex === idx && (
                  <div className="px-6 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CITIZEN PORTAL CTA SECTION                                                */}
      {/* ========================================================================= */}
      <section className="py-16 bg-blue-950 text-white relative overflow-hidden">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-700/60 text-xs text-blue-200 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Unified National Digital Pass</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-balance">
            Manage Your Verified Identification Pass Today
          </h2>

          <p className="text-sm sm:text-base text-blue-200/80 max-w-2xl mx-auto leading-relaxed">
            Access your secure profile, monitor authentication events, inspect registered mobile SIM records, and export authorized verification certificates.
          </p>

          <div className="pt-2 flex flex-wrap justify-center items-center gap-4">
            <button
              type="button"
              onClick={() => onNavigateToAuth('login')}
              className="px-6 py-3.5 rounded-xl bg-white text-blue-950 font-bold text-sm shadow-md hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Sign In to Your Pass
            </button>
            <button
              type="button"
              onClick={() => onNavigateToAuth('register')}
              className="px-6 py-3.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm border border-blue-700 transition-colors cursor-pointer"
            >
              Register New Pass Account
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FOOTER                                                                    */}
      {/* ========================================================================= */}
      <footer id="about" className="bg-slate-900 text-slate-400 text-xs py-14 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: Authority Branding */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <div className="w-7 h-7 rounded-md bg-slate-800 flex items-center justify-center p-1 border border-slate-700">
                  <img src={sealImage} alt="Seal" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
                <span>NIDA Pass Portal</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                National Identification Authority (NIDA)<br />
                United Republic of Tanzania<br />
                Makao Makuu, Dodoma
              </p>
            </div>

            {/* Col 2: Citizen Portals */}
            <div className="space-y-2">
              <span className="text-white font-bold uppercase tracking-wider text-[11px] block">
                Citizen Portals
              </span>
              <ul className="space-y-1.5">
                <li><button type="button" onClick={() => onNavigateToAuth('login')} className="hover:text-white transition-colors cursor-pointer">Citizen Login</button></li>
                <li><button type="button" onClick={() => onNavigateToAuth('register')} className="hover:text-white transition-colors cursor-pointer">Register Digital Pass</button></li>
                <li><a href="#verification" className="hover:text-white transition-colors">Civil Registry Lookup</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Biometric Clearance</a></li>
              </ul>
            </div>

            {/* Col 3: Legal & Standards */}
            <div className="space-y-2">
              <span className="text-white font-bold uppercase tracking-wider text-[11px] block">
                Legal & Compliance
              </span>
              <ul className="space-y-1.5">
                <li><span className="text-slate-400">NIDA Act Cap. 36</span></li>
                <li><span className="text-slate-400">Data Protection Act 2022</span></li>
                <li><span className="text-slate-400">Cybercrimes Act 2015</span></li>
                <li><span className="text-slate-400">ICAO Document 9303</span></li>
              </ul>
            </div>

            {/* Col 4: Help Desk */}
            <div className="space-y-2">
              <span className="text-white font-bold uppercase tracking-wider text-[11px] block">
                Citizen Helpline
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Toll-Free National Helpline: <strong>0800 110 099</strong><br />
                Dodoma HQ Desk: +255 (0) 26 296 3333<br />
                Support Email: support@nida.go.tz
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p>
              &copy; {new Date().getFullYear()} National Identification Authority (NIDA) · All Rights Reserved.
            </p>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Uhuru na Umoja</span>
              <span aria-hidden="true">·</span>
              <span>United Republic of Tanzania</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
