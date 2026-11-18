import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Phone, 
  Wallet, 
  Key, 
  LogOut, 
  Sun, 
  Moon, 
  Check, 
  Copy, 
  RotateCw, 
  Search, 
  Loader2, 
  Send, 
  X, 
  MessageSquare, 
  FileText, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Radio,
  Receipt,
  History,
  AlertCircle,
  XCircle,
  HelpCircle,
  Menu,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { SystemStore, REQUEST_COST_TSH } from '../../services/systemStore';
import { SystemUser, NidaServiceRequest, CreditRequest } from '../../types';
import { detectCarrier } from '../../data/mockRecords';
import { executeSinsoftLookup } from '../../services/apiService';
import { DirectLookupView } from './DirectLookupView';
import { BulkLookupPortal } from './BulkLookupPortal';
import { ApiDeveloperPortal } from './ApiDeveloperPortal';
import { Layers, Code2 } from 'lucide-react';

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
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<SystemUser>(currentUser);
  
  // View mode: 'simple' (exactly like user screenshot: Phone Info Lookup) vs 'advanced' (full agent matrix)
  const [viewMode, setViewMode] = useState<'simple' | 'advanced'>('simple');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Simple "Phone Info Lookup" state (matching the screenshot exactly)
  const [simplePhoneInput, setSimplePhoneInput] = useState('0623033377');
  const [simpleIsLoading, setSimpleIsLoading] = useState(false);
  const [simpleResult, setSimpleResult] = useState<{
    fullName: string;
    nin: string;
  } | null>({
    fullName: 'PASIKARI JACKOBO PASIKARI',
    nin: '19990102455240000122',
  });
  const [simpleError, setSimpleError] = useState<string | null>(null);

  // Tabs for advanced mode
  const [activeTab, setActiveTab] = useState<'lookup' | 'bulk' | 'api' | 'request' | 'wallet'>('lookup');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestFeedback, setRequestFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [historySearch, setHistorySearch] = useState('');
  
  // Modals
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  // Credit Request state (Replaces direct topup)
  const [creditModalTab, setCreditModalTab] = useState<'request' | 'history'>('request');
  const [creditReqAmount, setCreditReqAmount] = useState('1000');
  const [creditReqProvider, setCreditReqProvider] = useState<'YAS (Tigo Pesa)' | 'Vodacom M-Pesa' | 'Airtel Money' | 'Halopesa'>('YAS (Tigo Pesa)');
  const [creditReqRef, setCreditReqRef] = useState('');
  const [creditReqNotes, setCreditReqNotes] = useState('');
  const [isSubmittingCreditReq, setIsSubmittingCreditReq] = useState(false);
  const [creditReqFeedback, setCreditReqFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [myCreditRequests, setMyCreditRequests] = useState<CreditRequest[]>([]);

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // All user requests
  const [userRequests, setUserRequests] = useState<NidaServiceRequest[]>([]);

  // Refresh user data & requests
  const refreshData = () => {
    const updatedUser = SystemStore.getUser(currentUser.phone) || currentUser;
    if (updatedUser.isBlocked) {
      onLogout();
      return;
    }
    setUser(updatedUser);
    const all = SystemStore.getRequests();
    const myReqs = all.filter((r) => r.userPhone === updatedUser.phone);
    setUserRequests(myReqs);

    const allCreditReqs = SystemStore.getCreditRequests();
    setMyCreditRequests(allCreditReqs.filter((r) => r.userPhone === updatedUser.phone));
  };

  useEffect(() => {
    refreshData();

    const handleReqChanged = () => refreshData();
    const handleUsersChanged = () => refreshData();
    const handleCreditReqChanged = () => refreshData();
    const handleStorage = (e: StorageEvent) => {
      if (
        !e.key || 
        e.key.includes('nidatz_users') || 
        e.key.includes('currentUser') || 
        e.key.includes('nidatz_credit_requests') || 
        e.key.includes('nidatz_requests')
      ) {
        refreshData();
      }
    };

    window.addEventListener('nidatz_requests_changed', handleReqChanged);
    window.addEventListener('nidatz_users_changed', handleUsersChanged);
    window.addEventListener('nidatz_credit_requests_changed', handleCreditReqChanged);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('nidatz_requests_changed', handleReqChanged);
      window.removeEventListener('nidatz_users_changed', handleUsersChanged);
      window.removeEventListener('nidatz_credit_requests_changed', handleCreditReqChanged);
      window.removeEventListener('storage', handleStorage);
    };
  }, [currentUser.phone]);

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Simple "Get Info" handler for the screenshot view
  const handleSimpleGetInfo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = simplePhoneInput.trim();
    if (!clean) {
      setSimpleError('Tafadhali weka namba ya simu.');
      return;
    }

    if ((user?.credit ?? 0) < REQUEST_COST_TSH) {
      setSimpleError(`Salio halitoshi! Gharama ni TSh ${REQUEST_COST_TSH.toFixed(2)}, lakini salio lako ni TSh ${(user?.credit ?? 0).toFixed(2)}. Tafadhali ongeza salio.`);
      return;
    }

    setSimpleIsLoading(true);
    setSimpleError(null);

    setTimeout(() => {
      const response = executeSinsoftLookup({
        query: clean,
        userPhone: user.phone,
        deductCredit: true,
      });

      setSimpleIsLoading(false);
      refreshData();

      if (response.success && response.data) {
        const rawNin = response.data.nin_raw || response.data.nin.replace(/\D/g, '');
        setSimpleResult({
          fullName: response.data.full_name,
          nin: rawNin || response.data.nin,
        });
      } else {
        setSimpleResult(null);
        setSimpleError(response.message || 'Namba hii haijapatikana kwenye mfumo.');
      }
    }, 450);
  };

  // Submit new request in advanced mode
  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestFeedback(null);

    const cleanCust = customerPhone.replace(/\D/g, '');
    if (cleanCust.length !== 10 || (!cleanCust.startsWith('06') && !cleanCust.startsWith('07'))) {
      setRequestFeedback({
        type: 'error',
        message: 'Namba ya simu ya mteja lazima ianze na 07 au 06 na iwe na tarakimu 10!',
      });
      return;
    }

    if (user.credit < REQUEST_COST_TSH) {
      setRequestFeedback({
        type: 'error',
        message: `Salio halitoshi! Kila ombi linagharimu TSh ${REQUEST_COST_TSH.toFixed(2)}. Tafadhali omba kuongezewa salio kwenye pochi yako.`,
      });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const res = SystemStore.submitRequest(user.phone, cleanCust);
      setIsSubmitting(false);

      if (res.success) {
        setRequestFeedback({
          type: 'success',
          message: res.message,
        });
        setCustomerPhone('');
        refreshData();
      } else {
        setRequestFeedback({
          type: 'error',
          message: res.message,
        });
      }
    }, 600);
  };

  // Submit Credit Request
  const handleCreditRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreditReqFeedback(null);

    const amt = parseFloat(creditReqAmount);
    if (isNaN(amt) || amt < 100) {
      setCreditReqFeedback({
        type: 'error',
        message: 'Kiwango cha chini cha kuongeza salio ni TSh 100.',
      });
      return;
    }

    if (!creditReqRef || creditReqRef.trim().length < 3) {
      setCreditReqFeedback({
        type: 'error',
        message: 'Tafadhali ingiza Transaction ID / Namba ya kumbukumbu kutoka kwenye SMS ya mtandao wako.',
      });
      return;
    }

    setIsSubmittingCreditReq(true);

    setTimeout(() => {
      const res = SystemStore.submitCreditRequest({
        userPhone: user.phone,
        amount: amt,
        paymentMethod: creditReqProvider,
        transactionRef: creditReqRef,
        notes: creditReqNotes,
      });

      setIsSubmittingCreditReq(false);
      if (res.success) {
        setCreditReqFeedback({
          type: 'success',
          message: res.message,
        });
        setCreditReqRef('');
        setCreditReqNotes('');
        refreshData();
      } else {
        setCreditReqFeedback({
          type: 'error',
          message: res.message,
        });
      }
    }, 600);
  };

  // Change password
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({
        type: 'error',
        message: '❌ Password hazifanani! Tafadhali angalia tena.',
      });
      return;
    }

    if (newPassword.length < 4) {
      setPasswordFeedback({
        type: 'error',
        message: '❌ Password lazima iwe na angalau herufi au tarakimu 4!',
      });
      return;
    }

    setIsSavingPassword(true);
    setPasswordFeedback(null);

    setTimeout(() => {
      const res = SystemStore.changePassword(user.phone, newPassword);
      setIsSavingPassword(false);
      if (res.success) {
        setPasswordFeedback({ type: 'success', message: res.message });
        setTimeout(() => {
          setIsPasswordModalOpen(false);
          setNewPassword('');
          setConfirmPassword('');
          setPasswordFeedback(null);
        }, 1200);
      } else {
        setPasswordFeedback({ type: 'error', message: res.message });
      }
    }, 600);
  };

  const detectedCarrier = customerPhone.length >= 3 ? detectCarrier(customerPhone) : null;

  // Filter requests by search query
  const filteredRequests = userRequests.filter((r) => {
    const q = historySearch.toLowerCase().trim();
    if (!q) return true;
    return (
      r.targetPhone.includes(q) ||
      (r.nidaNumber && r.nidaNumber.toLowerCase().includes(q)) ||
      (r.applicantName && r.applicantName.toLowerCase().includes(q))
    );
  });

  const completedCount = userRequests.filter((r) => r.status === 'Completed').length;

  return (
    <div className="bg-[#f0f4f9] dark:bg-slate-950 text-slate-900 dark:text-white antialiased transition-colors duration-300 min-h-screen flex flex-col font-sans">
      {/* Top Mobile Bar matching screenshot: [Hamburger] Phone Info Lookup */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 -ml-1 rounded-xl text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Phone Info Lookup
            </h1>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Toggle view mode between Screenshot simple & Advanced agent tabs */}
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'simple' ? 'advanced' : 'simple')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-all cursor-pointer flex items-center gap-1"
              title="Badilisha muonekano"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">{viewMode === 'simple' ? 'Advanced Mode' : 'Simple View'}</span>
            </button>

            {/* Dark/Light mode */}
            <button
              id="theme-toggle"
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>
        </div>
      </header>

      {/* ======================= SIMPLE VIEW MODE (MATCHING USER SCREENSHOT) ======================= */}
      {viewMode === 'simple' ? (
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-16">
          {/* Central White Card matching screenshot */}
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 sm:p-7 space-y-4 text-center">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Phone Info Lookup
            </h2>

            <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Credits: <span className="font-bold text-slate-800 dark:text-slate-200">{Math.floor((user?.credit ?? 0) / REQUEST_COST_TSH)}</span>{' '}
              <span className="text-[11px] text-slate-400 font-mono">(TSh {(user?.credit ?? 0).toFixed(2)})</span>
            </div>

            {/* Input with Clear (X) button */}
            <form onSubmit={handleSimpleGetInfo} className="space-y-3 pt-1">
              <div className="relative">
                <input
                  type="text"
                  value={simplePhoneInput}
                  onChange={(e) => setSimplePhoneInput(e.target.value)}
                  placeholder="0623033377"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-sm tracking-wide focus:outline-none focus:border-blue-500 pr-9"
                />
                {simplePhoneInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSimplePhoneInput('');
                      setSimpleResult(null);
                      setSimpleError(null);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Blue "Get Info" Button */}
              <button
                type="submit"
                disabled={simpleIsLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#2e72c8] hover:bg-[#2560aa] text-white font-bold text-sm shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {simpleIsLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Inatafuta...</span>
                  </>
                ) : (
                  <span>Get Info</span>
                )}
              </button>
            </form>

            {/* Result Box matching screenshot: Fullname: ... NIN: ... */}
            {simpleResult && (
              <div className="mt-4 p-3.5 rounded-xl bg-[#eef3fa] dark:bg-slate-800/80 text-left space-y-1 text-xs text-slate-800 dark:text-slate-200 border border-blue-100 dark:border-slate-700">
                <p className="leading-snug">
                  <span className="font-extrabold text-slate-900 dark:text-white">Fullname: </span>
                  <span className="font-bold uppercase tracking-wide">{simpleResult.fullName}</span>
                </p>
                <div className="flex items-center justify-between gap-1">
                  <p className="leading-snug font-mono">
                    <span className="font-extrabold text-slate-900 dark:text-white font-sans">NIN: </span>
                    <span className="font-black text-blue-700 dark:text-blue-400">{simpleResult.nin}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopy(simpleResult.nin, 'simple-nin')}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    title="Nakili NIN"
                  >
                    {copiedId === 'simple-nin' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Error feedback */}
            {simpleError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-xs font-semibold text-left">
                {simpleError}
              </div>
            )}

            {/* Quick action bar */}
            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setCreditModalTab('request');
                  setIsTopupModalOpen(true);
                }}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
              >
                + Ongeza Salio
              </button>

              {simpleResult && (
                <button
                  type="button"
                  onClick={() => onOpenCertificateModal(simpleResult.nin)}
                  className="text-slate-600 dark:text-slate-300 font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <FileText className="w-3 h-3" />
                  <span>Print Slip</span>
                </button>
              )}
            </div>
          </div>
        </main>
      ) : (
        /* ======================= ADVANCED VIEW MODE (FULL AGENT MATRIX) ======================= */
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Top 3 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Float Credit (Salio) */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Wallet Balance (Salio)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCreditModalTab('request');
                    setIsTopupModalOpen(true);
                  }}
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Omba Salio
                </button>
              </div>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-black text-blue-600 dark:text-blue-500">
                  <span id="userCredits">{(user?.credit ?? 0).toFixed(2)}</span>{' '}
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Tsh</span>
                </h2>
              </div>
              <div className="mt-2 text-[11px] text-slate-400 font-medium">
                Inatosha maombi{' '}
                <strong className="text-slate-700 dark:text-slate-200">
                  {Math.floor((user?.credit ?? 0) / REQUEST_COST_TSH)}
                </strong>{' '}
                (TSh {REQUEST_COST_TSH.toFixed(2)} kwa ombi)
              </div>
            </div>

            {/* Card 2: Total Tasks */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 block">
                Total Requests (Jumla)
              </span>
              <div className="flex items-baseline gap-2">
                <h3 id="totalRequests" className="text-3xl font-black text-slate-800 dark:text-slate-100">
                  {userRequests.length}
                </h3>
                <span className="text-xs font-bold text-slate-400">Tasks</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400 font-medium">
                Maombi yote uliyowahi kutuma
              </div>
            </div>

            {/* Card 3: Completed Tasks */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-500 mb-2 block">
                Completed (Yaliyopatiwa NIN)
              </span>
              <div className="flex items-baseline gap-2">
                <h3 id="completedRequests" className="text-3xl font-black text-green-600 dark:text-green-500">
                  {completedCount}
                </h3>
                <span className="text-xs font-bold text-slate-400">Success</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400 font-medium">
                NIN zilizohakikiwa na kupokelewa
              </div>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab('lookup')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'lookup'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>NIDA Lookup (lookup.php)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('bulk')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'bulk'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Batch & Bulk Lookup</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('api')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'api'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>API & Developer Docs</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('request')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'request'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Manual Request Desk</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('wallet')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'wallet'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Wallet & Lipa Namba</span>
            </button>
          </div>

          {/* TAB 1: Instant NIDA Lookup (lookup.php) */}
          {activeTab === 'lookup' && (
            <DirectLookupView
              currentUser={user}
              onOpenCertificateModal={onOpenCertificateModal}
              onOpenTopupModal={() => {
                setCreditModalTab('request');
                setIsTopupModalOpen(true);
              }}
              onBalanceUpdated={refreshData}
            />
          )}

          {/* TAB 2: Batch & Bulk Lookup */}
          {activeTab === 'bulk' && (
            <BulkLookupPortal
              currentUser={user}
              onOpenCertificateModal={onOpenCertificateModal}
              onBalanceUpdated={refreshData}
            />
          )}

          {/* TAB 3: API & Developer Portal */}
          {activeTab === 'api' && (
            <ApiDeveloperPortal
              currentUser={user}
              onBalanceUpdated={refreshData}
            />
          )}

          {/* TAB 4: Manual NIN Request Desk */}
          {activeTab === 'request' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <div>
                  <h2 className="text-lg font-extrabold mb-1 flex items-center gap-2 text-slate-900 dark:text-white">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span>Request NIN Number</span>
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Ingiza namba ya simu ya mteja ili kuvuta NIN yake rasmi kutoka kanzidata ya NIDA.
                  </p>
                </div>

                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label 
                        htmlFor="customer"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                      >
                        Customer Phone Number
                      </label>
                      {detectedCarrier && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-900/40">
                          {detectedCarrier}
                        </span>
                      )}
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        id="customer"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="e.g. 0784615052"
                        className="w-full pl-11 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-950 dark:text-white rounded-xl px-4 py-3 font-bold text-sm focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Inatuma ombi...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Tuma Ombi la NIDA (TSh {REQUEST_COST_TSH.toFixed(2)})</span>
                      </>
                    )}
                  </button>

                  {requestFeedback && (
                    <div className={`p-3 rounded-xl text-xs font-bold ${
                      requestFeedback.type === 'success'
                        ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300'
                        : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                    }`}>
                      {requestFeedback.message}
                    </div>
                  )}
                </form>
              </div>

              {/* History Table */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Historia ya Maombi Yako
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {filteredRequests.length} maombi
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-bold uppercase">
                        <th className="py-2">Simu ya Mteja</th>
                        <th className="py-2">NIDA (NIN)</th>
                        <th className="py-2">Hali</th>
                        <th className="py-2 text-right">Vitendo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredRequests.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-2.5 font-mono font-bold text-slate-900 dark:text-white">
                            {r.targetPhone}
                          </td>
                          <td className="py-2.5 font-mono text-blue-600 dark:text-blue-400 font-bold">
                            {r.nidaNumber || 'Inasubiri...'}
                          </td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.status === 'Completed'
                                ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="py-2.5 text-right">
                            {r.nidaNumber && (
                              <button
                                type="button"
                                onClick={() => onOpenCertificateModal(r.nidaNumber!)}
                                className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                              >
                                Tazama Slip
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Wallet & Lipa Namba */}
          {activeTab === 'wallet' && (
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Pochi ya Salio (Wallet)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Lipa kwa Lipa Namba ya YAS (Tigo Pesa) kupokea salio moja kwa moja.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCreditModalTab('request');
                    setIsTopupModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  + Ongeza Salio Sasa
                </button>
              </div>

              {/* Master Lipa Namba Display */}
              <div className="p-5 rounded-2xl border-2 border-blue-500/50 bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 dark:from-blue-950/40 dark:via-slate-900 dark:to-indigo-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-blue-600 text-white">
                    YAS (TIGO PESA) LIPA NAMBA
                  </span>
                  <p className="text-3xl font-black font-mono text-blue-600 dark:text-blue-400 mt-1">
                    45506361
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Jina la Usajili: <strong>ELINA WILLSON MUHOZA</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy('45506361', 'yas-main-lipa')}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shrink-0"
                >
                  {copiedId === 'yas-main-lipa' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>Nakili 45506361</span>
                </button>
              </div>
            </div>
          )}
        </main>
      )}

      {/* Side Drawer for Navigation */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex">
          <div className="w-72 bg-white dark:bg-slate-900 h-full p-6 flex flex-col justify-between shadow-2xl border-r border-slate-200 dark:border-slate-800 animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white leading-tight">
                      Sinsoft Registry
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">{user.phone}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Wallet Summary */}
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 space-y-1">
                <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400">Salio Lako:</span>
                <p className="text-xl font-black font-mono text-slate-900 dark:text-white">
                  TSh {(user?.credit ?? 0).toFixed(2)}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setCreditModalTab('request');
                    setIsTopupModalOpen(true);
                  }}
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline pt-1 block cursor-pointer"
                >
                  + Ongeza Salio (Top-up)
                </button>
              </div>

              {/* View mode switcher */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Muonekano:</span>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('simple');
                    setIsDrawerOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                    viewMode === 'simple'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>Phone Info Lookup (Simple)</span>
                  </div>
                  {viewMode === 'simple' && <Check className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setViewMode('advanced');
                    setIsDrawerOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                    viewMode === 'advanced'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>Advanced Portal Mode</span>
                  </div>
                  {viewMode === 'advanced' && <Check className="w-4 h-4" />}
                </button>
              </div>

              {/* Quick Actions */}
              <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Akaunti:</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setIsPasswordModalOpen(true);
                  }}
                  className="w-full p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <Key className="w-4 h-4 text-blue-500" />
                  <span>Badili Password</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setActiveTab('wallet');
                    setViewMode('advanced');
                  }}
                  className="w-full p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <Receipt className="w-4 h-4 text-emerald-500" />
                  <span>Maelezo ya Lipa Namba</span>
                </button>
              </div>
            </div>

            {/* Logout button */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  onLogout();
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Ondoka Kwenye Akaunti</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Up / Credit Request Modal */}
      {isTopupModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 font-black text-base text-slate-900 dark:text-white">
                <Wallet className="w-5 h-5 text-blue-600" />
                <span>Omba Salio (Pochi)</span>
              </div>
              <button
                type="button"
                onClick={() => setIsTopupModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Master Lipa Info */}
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-blue-700 dark:text-blue-400">YAS LIPA NAMBA (TIGO PESA)</span>
                <span className="font-mono font-bold text-blue-600">45506361</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Jina la Usajili: <strong>ELINA WILLSON MUHOZA</strong>
              </p>
              <p className="text-[10px] text-slate-500">
                Lipa kupitia mtandao wowote kwa kuchagua <em>Kwenda YAS/Tigo</em> kisha jaza fomu hii chini kuthibitisha muamala.
              </p>
            </div>

            <form onSubmit={handleCreditRequestSubmit} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Kiasi Ulicholipa (TSh)
                </label>
                <input
                  type="number"
                  required
                  value={creditReqAmount}
                  onChange={(e) => setCreditReqAmount(e.target.value)}
                  placeholder="1000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Mtandao Uliotumia
                </label>
                <select
                  value={creditReqProvider}
                  onChange={(e) => setCreditReqProvider(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                >
                  <option value="YAS (Tigo Pesa)">YAS (Tigo Pesa)</option>
                  <option value="Vodacom M-Pesa">Vodacom M-Pesa</option>
                  <option value="Airtel Money">Airtel Money</option>
                  <option value="Halopesa">Halopesa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Transaction ID / Kumbukumbu ya Muamala
                </label>
                <input
                  type="text"
                  required
                  value={creditReqRef}
                  onChange={(e) => setCreditReqRef(e.target.value)}
                  placeholder="mfano: 7819284812 au QA71289P"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold uppercase font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingCreditReq}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmittingCreditReq ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Inatuma kwa Admin...</span>
                  </>
                ) : (
                  <span>Tuma Ombi la Kuthibitishiwa Salio</span>
                )}
              </button>

              {creditReqFeedback && (
                <div className={`p-2.5 rounded-xl text-xs font-bold ${
                  creditReqFeedback.type === 'success'
                    ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300'
                    : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                }`}>
                  {creditReqFeedback.message}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 font-black text-base text-slate-900 dark:text-white">
                <Key className="w-5 h-5 text-blue-600" />
                <span>Badili Password</span>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Password Mpya
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Angalau tarakimu 4"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Thibitisha Password Mpya
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Rudia password mpya"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingPassword}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                {isSavingPassword ? 'Inahifadhi...' : 'Hifadhi Password Mpya'}
              </button>

              {passwordFeedback && (
                <div className={`p-2.5 rounded-xl text-xs font-bold ${
                  passwordFeedback.type === 'success'
                    ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300'
                    : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                }`}>
                  {passwordFeedback.message}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
