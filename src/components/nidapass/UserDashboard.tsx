import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  User as UserIcon, 
  LogOut, 
  CheckCircle2, 
  Copy, 
  Check, 
  FileText, 
  Printer, 
  Search, 
  RefreshCw, 
  Fingerprint, 
  Phone, 
  Calendar, 
  MapPin, 
  Building, 
  Clock, 
  Download, 
  Key, 
  AlertCircle, 
  CheckCircle,
  QrCode,
  Sparkles,
  ExternalLink,
  Laptop,
  Smartphone,
  SlidersHorizontal,
  ChevronRight,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';
import { SystemUser, NidaRecord, UserActivityLog } from '../../types';
import { SystemStore } from '../../services/systemStore';
import { executeSinsoftLookup } from '../../services/apiService';
import sealImage from '../../assets/images/coat_of_arms_seal_1790750477491.jpg';
import defaultAvatar from '../../assets/images/avatar_citizen_verified_1790750468089.jpg';

interface UserDashboardProps {
  currentUser: SystemUser;
  onLogout: () => void;
  onOpenCertificateModal: (nin: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  onLogout,
  onOpenCertificateModal,
}) => {
  const [user, setUser] = useState<SystemUser>(currentUser);
  const [activeTab, setActiveTab] = useState<'profile' | 'verify' | 'activity' | 'security'>('profile');
  
  // Card flip state (front vs back of official ID pass)
  const [isPassFlipped, setIsPassFlipped] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Activity logs
  const [activityLogs, setActivityLogs] = useState<UserActivityLog[]>([]);
  const [activityFilter, setActivityFilter] = useState<'ALL' | 'AUTH' | 'VERIFY' | 'SECURITY'>('ALL');
  const [activitySearch, setActivitySearch] = useState('');

  // Identity Verification Tool inside Dashboard
  const [verifyQuery, setVerifyQuery] = useState('19990102455240000122');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Security tab state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [securityFeedback, setSecurityFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // Load user data and activity logs
  const refreshUser = () => {
    const updated = SystemStore.getUser(currentUser.phone) || currentUser;
    setUser(updated);
    const logs = SystemStore.getUserActivityLogs(updated.phone);
    setActivityLogs(logs);
  };

  useEffect(() => {
    refreshUser();
  }, [currentUser.phone]);

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Run live verification
  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = verifyQuery.trim();
    if (!clean) return;

    setIsVerifying(true);
    setVerifyError(null);
    setVerifyResult(null);

    setTimeout(() => {
      const res = executeSinsoftLookup({
        query: clean,
        userPhone: user.phone,
        deductCredit: false,
      });

      setIsVerifying(false);
      if (res.success && res.data) {
        setVerifyResult(res.data);

        // Add to activity logs
        SystemStore.addUserActivityLog({
          userId: user.phone,
          type: 'VERIFY',
          title: `Registry Query: ${clean}`,
          description: `Civil record verified for ${res.data.full_name} (${res.data.nin}).`,
          ipAddress: '197.250.48.112',
          device: 'Portal Dashboard Terminal',
          status: 'SUCCESS',
          timestamp: Date.now(),
        });
        refreshUser();
      } else {
        setVerifyError(res.message || 'No civil record found matching this query.');
      }
    }, 450);
  };

  // Change password
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityFeedback(null);

    if (newPass.length < 4) {
      setSecurityFeedback({ type: 'error', message: 'New password must be at least 4 characters long.' });
      return;
    }
    if (newPass !== confirmNewPass) {
      setSecurityFeedback({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    const res = SystemStore.changePassword(user.phone, newPass);
    if (res.success) {
      setSecurityFeedback({ type: 'success', message: 'Passkey password updated securely.' });
      setCurrentPass('');
      setNewPass('');
      setConfirmNewPass('');

      SystemStore.addUserActivityLog({
        userId: user.phone,
        type: 'SECURITY',
        title: 'Passkey Credential Modified',
        description: 'Citizen account password was updated from secure portal session.',
        ipAddress: '197.250.48.112',
        device: 'Dashboard Security Panel',
        status: 'SUCCESS',
        timestamp: Date.now(),
      });
      refreshUser();
    } else {
      setSecurityFeedback({ type: 'error', message: res.message });
    }
  };

  // Filtered activity logs
  const filteredLogs = activityLogs.filter((log) => {
    const matchesFilter = activityFilter === 'ALL' || log.type === activityFilter;
    const matchesSearch = !activitySearch.trim() || 
      log.title.toLowerCase().includes(activitySearch.toLowerCase()) ||
      log.description.toLowerCase().includes(activitySearch.toLowerCase()) ||
      log.ipAddress.includes(activitySearch);
    return matchesFilter && matchesSearch;
  });

  // Export activity log helper
  const handleExportLogs = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(activityLogs, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `NIDA_Activity_Audit_${user.phone}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    SystemStore.addUserActivityLog({
      userId: user.phone,
      type: 'EXPORT',
      title: 'Activity Audit Log Exported',
      description: 'Audit records downloaded for citizen compliance documentation.',
      ipAddress: '197.250.48.112',
      device: 'User Device Export',
      status: 'SUCCESS',
      timestamp: Date.now(),
    });
    refreshUser();
  };

  const ninValue = user.nin || '19900315-11103-00001-21';
  const fullNameValue = user.fullName || 'JUMA HAMISI BAKARI';
  const avatarSrc = user.avatarUrl || defaultAvatar;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-blue-900 selection:text-white">
      {/* ========================================================================= */}
      {/* TOP BAR CONTRACT: Zone 1 (Brand) — Zone 2 (Navigation) — Zone 3 (Profile & Logout) */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Zone 1: Brand title & Official Clearance Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center p-1.5 shadow-xs border border-slate-700">
              <img src={sealImage} alt="NIDA Crest" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 block leading-none">
                NIDA Pass Portal
              </span>
              <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase mt-1 block">
                Secure Government Intranet
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation views */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-white text-blue-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Digital Pass Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('verify')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'verify'
                  ? 'bg-white text-blue-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Civil Verification Tool
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('activity')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'activity'
                  ? 'bg-white text-blue-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Activity & Audit Logs
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-white text-blue-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Security Settings
            </button>
          </nav>

          {/* Zone 3: Citizen profile & functional Logout Button */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-200 text-left">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-300 bg-slate-200">
                <img src={avatarSrc} alt={fullNameValue} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[140px]">
                  {fullNameValue}
                </p>
                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified Citizen</span>
                </span>
              </div>
            </div>

            {/* Functional Logout button that returns the user to the home screen */}
            <button
              type="button"
              onClick={onLogout}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Sign out and return to portal home screen"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center overflow-x-auto px-4 py-2 bg-slate-50 border-t border-slate-200 gap-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap font-semibold ${activeTab === 'profile' ? 'bg-blue-900 text-white' : 'text-slate-600'}`}
          >
            Digital Pass
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('verify')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap font-semibold ${activeTab === 'verify' ? 'bg-blue-900 text-white' : 'text-slate-600'}`}
          >
            Verification Tool
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap font-semibold ${activeTab === 'activity' ? 'bg-blue-900 text-white' : 'text-slate-600'}`}
          >
            Activity Logs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap font-semibold ${activeTab === 'security' ? 'bg-blue-900 text-white' : 'text-slate-600'}`}
          >
            Security
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* DASHBOARD CONTENT BODY                                                   */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* ========================================================================= */}
        {/* TAB 1: DIGITAL PASS & CITIZEN PROFILE OVERVIEW                            */}
        {/* ========================================================================= */}
        {activeTab === 'profile' && (
          <div className="space-y-8">
            
            {/* Account Verification Status Badges Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Identity Status</span>
                  <p className="text-xs font-extrabold text-slate-900">VERIFIED (TIER 3)</p>
                </div>
              </div>

              <div className="p-4.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Biometrics Sync</span>
                  <p className="text-xs font-extrabold text-slate-900">LEVEL-3 MATCHED</p>
                </div>
              </div>

              <div className="p-4.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Civil Registry</span>
                  <p className="text-xs font-extrabold text-slate-900">NIDA DODOMA ACTIVE</p>
                </div>
              </div>

              <div className="p-4.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Pass Validity</span>
                  <p className="text-xs font-extrabold text-slate-900">ACTIVE THRU 2030</p>
                </div>
              </div>
            </div>

            {/* Profile Overview Grid: Left (Interactive Digital Pass) & Right (Profile Metadata) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Interactive Digital Smart Pass Card (Front & Back) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-900" />
                    <span>Official NIDA Digital Smart Pass</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsPassFlipped(!isPassFlipped)}
                    className="text-xs font-semibold text-blue-900 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{isPassFlipped ? 'View Front Side' : 'Flip to Back Side'}</span>
                  </button>
                </div>

                {/* The Smart Pass Card Container */}
                <div className="relative aspect-[1.58/1] w-full rounded-2xl overflow-hidden shadow-xl border border-slate-800 bg-gradient-to-br from-slate-950 via-[#0B1E36] to-slate-900 text-white p-5 flex flex-col justify-between select-none">
                  {/* Holographic guilloche pattern overlay */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

                  {!isPassFlipped ? (
                    /* FRONT SIDE OF PASS */
                    <>
                      {/* Top Header of Smart Pass */}
                      <div className="relative flex items-start justify-between gap-3 border-b border-slate-700/60 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-lg bg-slate-900/80 p-1 border border-slate-700 shadow-xs shrink-0">
                            <img src={sealImage} alt="National Crest" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-mono tracking-widest text-slate-300 block">
                              JAMHURI YA MUUNGANO WA TANZANIA
                            </span>
                            <span className="text-xs font-black tracking-wide text-white block">
                              NATIONAL IDENTITY PASS
                            </span>
                          </div>
                        </div>

                        {/* Gold Microchip icon */}
                        <div className="w-8 h-7 rounded bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-500 border border-amber-600/60 flex items-center justify-center p-0.5 shadow-xs">
                          <div className="w-full h-full border border-amber-800/40 rounded-xs grid grid-cols-2 gap-0.5 p-0.5">
                            <div className="border border-amber-900/30 rounded-2xs" />
                            <div className="border border-amber-900/30 rounded-2xs" />
                            <div className="border border-amber-900/30 rounded-2xs" />
                            <div className="border border-amber-900/30 rounded-2xs" />
                          </div>
                        </div>
                      </div>

                      {/* Middle Body of Pass */}
                      <div className="relative grid grid-cols-12 gap-3 items-center my-auto">
                        {/* Citizen Photo */}
                        <div className="col-span-4 aspect-[4/5] rounded-xl overflow-hidden border border-slate-600 bg-slate-800 shadow-xs relative">
                          <img src={avatarSrc} alt={fullNameValue} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute bottom-0 inset-x-0 bg-slate-950/70 text-center py-0.5 text-[8px] font-mono text-emerald-400">
                            LEVEL-3
                          </div>
                        </div>

                        {/* Citizen Details */}
                        <div className="col-span-8 space-y-1.5 text-xs">
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Full Legal Name</span>
                            <p className="font-bold text-white tracking-wide truncate">{fullNameValue}</p>
                          </div>

                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-slate-400 block">National ID Number (NIN)</span>
                            <p className="font-mono font-extrabold text-blue-300 tracking-wider text-xs sm:text-sm">
                              {ninValue}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div>
                              <span className="text-slate-400 block">DOB / Gender</span>
                              <span className="font-semibold text-slate-200">
                                {user.dateOfBirth || '1990-03-15'} · {user.gender || 'MALE'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Nationality</span>
                              <span className="font-semibold text-slate-200">
                                {user.nationality || 'TANZANIAN'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer Bar of Smart Pass */}
                      <div className="relative pt-2 border-t border-slate-700/60 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                        <span>DOC: {user.documentNumber || 'TZ-NID-19900315-A1'}</span>
                        <span className="text-emerald-400">ICAO 9303 COMPLIANT</span>
                      </div>
                    </>
                  ) : (
                    /* BACK SIDE OF PASS */
                    <>
                      <div className="relative flex items-center justify-between border-b border-slate-700/60 pb-2">
                        <div>
                          <span className="text-[9px] text-slate-400 block">ISSUING AUTHORITY</span>
                          <span className="text-xs font-bold text-white">NIDA DODOMA, TANZANIA</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 block">VALIDITY</span>
                          <span className="text-xs font-mono font-bold text-emerald-400">2020-04 · 2030-04</span>
                        </div>
                      </div>

                      <div className="relative flex items-center justify-between gap-4 my-auto">
                        <div className="space-y-1 text-xs">
                          <p className="text-[10px] text-slate-300">
                            <strong>Place of Birth:</strong> {user.district || 'Ilala'}, Dar es Salaam
                          </p>
                          <p className="text-[10px] text-slate-300">
                            <strong>Civil Residence:</strong> {user.residence || 'Ilala, Dar es Salaam'}
                          </p>
                          <p className="text-[10px] text-slate-300">
                            <strong>Security Fingerprint:</strong> Enrolled & Verified
                          </p>
                        </div>

                        {/* Pass QR Code */}
                        <div className="w-16 h-16 rounded-xl bg-white p-1 shadow-md shrink-0 flex items-center justify-center">
                          <QrCode className="w-14 h-14 text-slate-900" />
                        </div>
                      </div>

                      {/* Machine Readable Zone (MRZ) */}
                      <div className="relative pt-2 border-t border-slate-700/60 font-mono text-[9px] tracking-widest text-slate-400 leading-tight">
                        <p>IDTZA{ninValue.replace(/\D/g, '').slice(0, 15)}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</p>
                        <p>9003158M3004124TZA&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;8</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Pass Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => onOpenCertificateModal(ninValue)}
                    className="py-2.5 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Official NIDA Slip</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(ninValue, 'nin-copy')}
                    className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedField === 'nin-copy' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'nin-copy' ? 'NIN Copied!' : 'Copy NIN Number'}</span>
                  </button>
                </div>
              </div>

              {/* Right Column: User Profile Overview Cards */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Profile Overview Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                        <img src={avatarSrc} alt={fullNameValue} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                          {fullNameValue}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">
                          Registered Citizen Identity · {user.role.toUpperCase()} Clearance
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
                        Active Civil Status
                      </span>
                    </div>
                  </div>

                  {/* Comprehensive Profile Data Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        National ID Number (NIN)
                      </span>
                      <p className="font-mono font-bold text-blue-900 text-sm">{ninValue}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Registered Mobile Line
                      </span>
                      <p className="font-mono font-bold text-slate-800 text-sm">{user.phone}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Civil Email Address
                      </span>
                      <p className="font-semibold text-slate-800 truncate">{user.email || 'juma@nidapass.go.tz'}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Date of Birth & Gender
                      </span>
                      <p className="font-semibold text-slate-800">
                        {user.dateOfBirth || '1990-03-15'} · {user.gender || 'MALE'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Civil Residence & District
                      </span>
                      <p className="font-semibold text-slate-800">
                        {user.residence || 'Ilala, Dar es Salaam'} ({user.district || 'Ilala'})
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Document Number & Issue Date
                      </span>
                      <p className="font-semibold text-slate-800 font-mono">
                        {user.documentNumber || 'TZ-NID-19900315-A1'} · {user.issueDate || '2020-04-12'}
                      </p>
                    </div>
                  </div>

                  {/* Registered SIMs TCRA Cross-Reference */}
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Linked Mobile Telecom MSISDNs (TCRA Linked)
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">2 Registered Lines</span>
                    </div>

                    <div className="space-y-2">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-[10px]">
                            VODA
                          </div>
                          <div>
                            <span className="font-mono font-bold text-slate-900">{user.phone}</span>
                            <span className="text-[10px] text-slate-400 block">Primary SIM · Biometrics Verified</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          Active & Matched
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[10px]">
                            TIGO
                          </div>
                          <div>
                            <span className="font-mono font-bold text-slate-900">0713445566</span>
                            <span className="text-[10px] text-slate-400 block">Secondary SIM · Biometrics Verified</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          Active & Matched
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CIVIL VERIFICATION TOOL                                            */}
        {/* ========================================================================= */}
        {activeTab === 'verify' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Internal Verification Matrix
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  National Civil Registry Verification Tool
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Query the central civil database for instant citizen verification, demographic validation, and official print certificate issuance.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleVerifySubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={verifyQuery}
                      onChange={(e) => setVerifyQuery(e.target.value)}
                      placeholder="Enter 20-digit NIN or 10-digit mobile number"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-mono text-sm focus:outline-none focus:border-blue-900"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 whitespace-nowrap"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Querying Registry...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-blue-300" />
                        <span>Run Verification</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Quick Test Cases:</span>
                  <button
                    type="button"
                    onClick={() => setVerifyQuery('19990102455240000122')}
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono cursor-pointer"
                  >
                    Pasikari (19990102...)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerifyQuery('19900315-11103-00001-21')}
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono cursor-pointer"
                  >
                    Juma Hamisi (NIN)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerifyQuery('0623033377')}
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono cursor-pointer"
                  >
                    0623033377 (Halotel)
                  </button>
                </div>
              </form>

              {/* Result Container */}
              {verifyResult && (
                <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
                    <div>
                      <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                        Authenticated Civil Record
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900 uppercase">
                        {verifyResult.full_name}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenCertificateModal(verifyResult.nin)}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Verification Slip</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block">National ID (NIN)</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">{verifyResult.nin}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Date of Birth & Age</span>
                      <span className="font-semibold text-slate-800">{verifyResult.date_of_birth} ({verifyResult.age} yrs)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Primary MSISDN</span>
                      <span className="font-mono font-bold text-slate-800">{verifyResult.phone} ({verifyResult.carrier})</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Biometric Fingerprints</span>
                      <span className="font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Biometrics Verified</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {verifyError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{verifyError}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ACTIVITY & AUDIT LOGS                                             */}
        {/* ========================================================================= */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                    Audit Trail & Logs
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                    Citizen Security & Authentication Activity Logs
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Immutable security log of all authentication events, verification checks, and pass issuances.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleExportLogs}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-center"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Activity Log (JSON)</span>
                </button>
              </div>

              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
                {/* Filter tabs */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-full sm:w-auto overflow-x-auto text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActivityFilter('ALL')}
                    className={`px-3 py-1.5 rounded-md transition-colors ${activityFilter === 'ALL' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-950'}`}
                  >
                    All Events ({activityLogs.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivityFilter('AUTH')}
                    className={`px-3 py-1.5 rounded-md transition-colors ${activityFilter === 'AUTH' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-950'}`}
                  >
                    Authentication
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivityFilter('VERIFY')}
                    className={`px-3 py-1.5 rounded-md transition-colors ${activityFilter === 'VERIFY' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-950'}`}
                  >
                    Verification
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivityFilter('SECURITY')}
                    className={`px-3 py-1.5 rounded-md transition-colors ${activityFilter === 'SECURITY' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-950'}`}
                  >
                    Security
                  </button>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    placeholder="Search logs by keyword..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-blue-900 bg-slate-50"
                  />
                </div>
              </div>

              {/* Activity Logs Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] text-slate-400 font-bold uppercase">
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Event Type</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Device / Terminal</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.type === 'AUTH'
                              ? 'bg-blue-100 text-blue-800'
                              : log.type === 'VERIFY'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-800'
                          }`}>
                            {log.type}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-bold text-slate-900">{log.title}</p>
                          <p className="text-[11px] text-slate-500">{log.description}</p>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          {log.device}
                          <span className="text-[10px] text-slate-400 block">{log.ipAddress}</span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{log.status}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SECURITY SETTINGS                                                 */}
        {/* ========================================================================= */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Password Management */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Key className="w-4 h-4 text-blue-900" />
                  <span>Update Passkey Password</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Ensure your account uses a resilient passkey with alphanumeric characters.
                </p>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label htmlFor="newPass" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    New Passkey Password
                  </label>
                  <input
                    type="password"
                    id="newPass"
                    required
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Enter at least 4 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:border-blue-900"
                  />
                </div>

                <div>
                  <label htmlFor="confirmNewPass" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Confirm New Passkey
                  </label>
                  <input
                    type="password"
                    id="confirmNewPass"
                    required
                    value={confirmNewPass}
                    onChange={(e) => setConfirmNewPass(e.target.value)}
                    placeholder="Re-enter new passkey"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:border-blue-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Save New Password
                </button>

                {securityFeedback && (
                  <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    securityFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {securityFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span>{securityFeedback.message}</span>
                  </div>
                )}
              </form>
            </div>

            {/* Multi-Factor Authentication & Devices */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* 2FA Toggle */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Two-Factor Authentication (2FA)
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Verify logins with SMS OTP to registered line <strong>{user.phone}</strong>.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                      twoFactorEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      twoFactorEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Enforces biometric TCRA linkage for every new terminal login.</span>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-slate-900">
                  Active Authenticated Terminals
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Laptop className="w-4 h-4 text-blue-900" />
                      <div>
                        <span className="font-bold text-slate-900 block">Current Browser Session</span>
                        <span className="text-[10px] text-slate-400 font-mono">197.250.48.112 · Dodoma Intranet</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Active Now
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-4 h-4 text-slate-600" />
                      <div>
                        <span className="font-bold text-slate-900 block">NIDA Pass Mobile Wallet</span>
                        <span className="text-[10px] text-slate-400 font-mono">102.164.88.24 · Dar es Salaam</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500">2 hrs ago</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => alert('All other terminal sessions have been successfully terminated.')}
                  className="w-full py-2.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer"
                >
                  Terminate Other Terminal Sessions
                </button>
              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
};
