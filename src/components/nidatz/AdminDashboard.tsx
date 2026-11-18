import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Users, 
  Wallet, 
  Calendar, 
  Sun, 
  Moon, 
  LogOut, 
  X, 
  Copy, 
  Check, 
  Send, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  Loader2, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  RefreshCw,
  Phone,
  Lock,
  ArrowRight,
  FileText,
  Receipt,
  Ban,
  UserCheck,
  UserX,
  AlertTriangle,
  Inbox,
  History,
  Activity,
  Filter
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { SystemStore } from '../../services/systemStore';
import { SystemUser, NidaServiceRequest, DepositRecord, CreditRequest, AuditLogEntry } from '../../types';
import { generateRealisticRecord } from '../../data/mockRecords';

interface AdminDashboardProps {
  currentUser: SystemUser;
  onLogout: () => void;
  onOpenCertificateModal: (nin: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onLogout,
  onOpenCertificateModal,
}) => {
  const { theme, toggleTheme } = useTheme();

  // Active open modal: 'nida' | 'users' | 'deposits' | 'history' | 'credit_requests' | 'audit_log' | null
  const [activeModal, setActiveModal] = useState<'nida' | 'users' | 'deposits' | 'history' | 'credit_requests' | 'audit_log' | null>(null);

  // Stats
  const [stats, setStats] = useState(SystemStore.getStats());

  // Copied helper
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Data lists
  const [requests, setRequests] = useState<NidaServiceRequest[]>([]);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [creditRequests, setCreditRequests] = useState<CreditRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Audit Logs State
  const [auditFilterAction, setAuditFilterAction] = useState<string>('all');
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>('');

  // Confirmation Modal state for Block and Delete User
  const [confirmUserAction, setConfirmUserAction] = useState<{
    type: 'block' | 'unblock' | 'delete';
    userPhone: string;
    userName?: string;
  } | null>(null);

  // Credit Requests Portal State
  const [creditReqFilter, setCreditReqFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [creditReqSearch, setCreditReqSearch] = useState('');
  const [creditReqFeedback, setCreditReqFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [rejectingReqId, setRejectingReqId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [isProcessingCreditReq, setIsProcessingCreditReq] = useState<string | null>(null);

  // Modal 1: Processing Queue State
  const [ninInputs, setNinInputs] = useState<Record<string, string>>({});
  const [fulfillingId, setFulfillingId] = useState<string | null>(null);
  const [queueFeedback, setQueueFeedback] = useState<string | null>(null);

  // Modal 2: User Base Manager State
  const [userTab, setUserTab] = useState<'add' | 'view'>('view');
  const [userSearch, setUserSearch] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserCredit, setNewUserCredit] = useState('240');
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin' | 'feeder'>('user');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'blocked' | 'staff'>('all');
  const [userManageFeedback, setUserManageFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  // User credit edit
  const [editingUserPhone, setEditingUserPhone] = useState<string | null>(null);
  const [editCreditAmount, setEditCreditAmount] = useState('');

  // Modal 3: Deposits Portal State
  const [depPhone, setDepPhone] = useState('');
  const [depAmount, setDepAmount] = useState('1000');
  const [depSuggestions, setDepSuggestions] = useState<SystemUser[]>([]);
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositFeedback, setDepositFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal 4: Daily History Search
  const [dailySearch, setDailySearch] = useState('');

  // Refresh all system state
  const refreshAll = () => {
    setRequests(SystemStore.getRequests());
    setUsers(SystemStore.getUsers());
    setDeposits(SystemStore.getDeposits());
    setCreditRequests(SystemStore.getCreditRequests());
    setAuditLogs(SystemStore.getAuditLogs());
    setStats(SystemStore.getStats());
  };

  useEffect(() => {
    refreshAll();

    const handleReqChanged = () => refreshAll();
    const handleUsersChanged = () => refreshAll();
    const handleDepositsChanged = () => refreshAll();
    const handleCreditReqChanged = () => refreshAll();
    const handleAuditLogsChanged = () => refreshAll();

    window.addEventListener('nidatz_requests_changed', handleReqChanged);
    window.addEventListener('nidatz_users_changed', handleUsersChanged);
    window.addEventListener('nidatz_deposits_changed', handleDepositsChanged);
    window.addEventListener('nidatz_credit_requests_changed', handleCreditReqChanged);
    window.addEventListener('nidatz_audit_logs_changed', handleAuditLogsChanged);

    return () => {
      window.removeEventListener('nidatz_requests_changed', handleReqChanged);
      window.removeEventListener('nidatz_users_changed', handleUsersChanged);
      window.removeEventListener('nidatz_deposits_changed', handleDepositsChanged);
      window.removeEventListener('nidatz_credit_requests_changed', handleCreditReqChanged);
      window.removeEventListener('nidatz_audit_logs_changed', handleAuditLogsChanged);
    };
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1600);
  };

  // Helper to generate a valid formatted NIN for test dispatch
  const handleAutoSuggestNin = (reqId: string, phone: string) => {
    const mockRec = generateRealisticRecord(phone);
    setNinInputs((prev) => ({
      ...prev,
      [reqId]: mockRec.nin,
    }));
  };

  // Dispatch NIN
  const handleDispatchNin = (reqId: string) => {
    const enteredNin = ninInputs[reqId];
    if (!enteredNin || enteredNin.trim().length < 8) {
      setQueueFeedback('Tafadhali ingiza au bonyeza "Auto-Generate" kupata namba ya NIDA kabla ya kutuma.');
      return;
    }

    setFulfillingId(reqId);
    setQueueFeedback(null);

    setTimeout(() => {
      const res = SystemStore.fulfillRequest(reqId, enteredNin.trim());
      setFulfillingId(null);
      if (res.success) {
        setQueueFeedback(`✅ NIDA ${enteredNin.trim()} imetumwa kikamilifu kwa mteja!`);
        refreshAll();
      } else {
        setQueueFeedback(res.message);
      }
    }, 600);
  };

  // Autocomplete phone for deposits
  const handleDepPhoneChange = (val: string) => {
    setDepPhone(val);
    if (val.trim().length >= 2) {
      const matches = SystemStore.searchUsers(val);
      setDepSuggestions(matches.slice(0, 5));
    } else {
      setDepSuggestions([]);
    }
  };

  // Submit Deposit
  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depAmount);
    if (isNaN(amt) || amt < 100) {
      setDepositFeedback({ type: 'error', message: 'Kiwango cha chini cha deposit ni TSh 100.' });
      return;
    }

    setIsDepositing(true);
    setDepositFeedback(null);

    setTimeout(() => {
      const res = SystemStore.addDeposit(depPhone, amt, currentUser.phone);
      setIsDepositing(false);
      if (res.success) {
        setDepositFeedback({ type: 'success', message: res.message });
        setDepPhone('');
        refreshAll();
      } else {
        setDepositFeedback({ type: 'error', message: res.message });
      }
    }, 600);
  };

  // Add User submit
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserManageFeedback(null);

    const creditVal = parseFloat(newUserCredit) || 0;
    const res = SystemStore.addUser({
      phone: newUserPhone,
      password: newUserPassword,
      role: newUserRole,
      credit: creditVal,
    });

    if (res.success) {
      setUserManageFeedback({ type: 'success', message: res.message });
      setNewUserPhone('');
      setNewUserPassword('');
      setNewUserCredit('240');
      refreshAll();
    } else {
      setUserManageFeedback({ type: 'error', message: res.message });
    }
  };

  // Save updated credit
  const handleSaveCredit = (phone: string) => {
    const val = parseFloat(editCreditAmount);
    if (isNaN(val)) return;
    SystemStore.updateUserCredit(phone, val);
    setEditingUserPhone(null);
    setEditCreditAmount('');
    refreshAll();
  };

  // Block / Unblock user confirmation & execution
  const executeBlockToggle = (phone: string, currentBlocked: boolean) => {
    if (phone === '0784615052' || phone === currentUser.phone) {
      setUserManageFeedback({ type: 'error', message: 'Huwezi kumfungia Super Admin wa mfumo!' });
      setConfirmUserAction(null);
      return;
    }
    const res = SystemStore.blockUser(phone, !currentBlocked);
    setConfirmUserAction(null);
    if (res.success) {
      setUserManageFeedback({ type: 'success', message: res.message });
    } else {
      setUserManageFeedback({ type: 'error', message: res.message });
    }
    refreshAll();
  };

  // Delete user execution
  const executeDeleteUser = (phone: string) => {
    if (phone === '0784615052' || phone === currentUser.phone) {
      setUserManageFeedback({ type: 'error', message: 'Huwezi kumfuta Super Admin wa mfumo!' });
      setConfirmUserAction(null);
      return;
    }
    const res = SystemStore.deleteUser(phone);
    setConfirmUserAction(null);
    if (res.success) {
      setUserManageFeedback({ type: 'success', message: res.message });
    } else {
      setUserManageFeedback({ type: 'error', message: res.message });
    }
    refreshAll();
  };

  // Credit Request Approval & Rejection
  const handleApproveCreditReq = (requestId: string) => {
    setIsProcessingCreditReq(requestId);
    setCreditReqFeedback(null);
    setTimeout(() => {
      const res = SystemStore.approveCreditRequest(requestId, currentUser.phone);
      setIsProcessingCreditReq(null);
      if (res.success) {
        setCreditReqFeedback({ type: 'success', message: res.message });
        refreshAll();
      } else {
        setCreditReqFeedback({ type: 'error', message: res.message });
      }
    }, 500);
  };

  const handleRejectCreditReq = (requestId: string) => {
    setIsProcessingCreditReq(requestId);
    setCreditReqFeedback(null);
    setTimeout(() => {
      const reason = rejectionReasonInput.trim() || 'Uhakiki wa muamala haukukamilika / Malipo hayakuonekana';
      const res = SystemStore.rejectCreditRequest(requestId, reason, currentUser.phone);
      setIsProcessingCreditReq(null);
      setRejectingReqId(null);
      setRejectionReasonInput('');
      if (res.success) {
        setCreditReqFeedback({ type: 'success', message: res.message });
        refreshAll();
      } else {
        setCreditReqFeedback({ type: 'error', message: res.message });
      }
    }, 500);
  };

  const pendingRequests = requests.filter((r) => r.status === 'Pending');

  // Daily requests (today)
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const dailyRequests = requests.filter((r) => r.timestamp >= startOfToday);
  const filteredDaily = dailyRequests.filter((r) => {
    const q = dailySearch.toLowerCase().trim();
    if (!q) return true;
    return (
      r.targetPhone.includes(q) ||
      r.userPhone.includes(q) ||
      (r.nidaNumber && r.nidaNumber.toLowerCase().includes(q))
    );
  });

  // Filtered Credit Requests
  const filteredCreditRequests = creditRequests.filter((cr) => {
    if (creditReqFilter !== 'all' && cr.status.toLowerCase() !== creditReqFilter) {
      return false;
    }
    if (creditReqSearch.trim()) {
      const q = creditReqSearch.toLowerCase().trim();
      const matchPhone = cr.userPhone.toLowerCase().includes(q);
      const matchName = cr.userName ? cr.userName.toLowerCase().includes(q) : false;
      const matchRef = cr.transactionRef ? cr.transactionRef.toLowerCase().includes(q) : false;
      const matchProv = cr.paymentMethod ? cr.paymentMethod.toLowerCase().includes(q) : false;
      return matchPhone || matchName || matchRef || matchProv;
    }
    return true;
  });

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white antialiased transition-colors duration-300 min-h-screen flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-3">
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center font-bold shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r bg-clip-text text-transparent from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
                NIN Admin Portal
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-red-600 dark:text-red-400 font-mono flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Admin Control Matrix
                </span>
                <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                <span className="text-xs text-slate-400 font-mono">{currentUser.phone}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Today Badge */}
            <span
              id="lblCurrentDateBadge"
              className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold font-mono border border-slate-200 dark:border-slate-700"
            >
              {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>

            {/* Dark/Light Mode */}
            <button
              id="theme-toggle"
              type="button"
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Toggle Dark/Light Mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Logout */}
            <button
              id="btnLogout"
              type="button"
              onClick={onLogout}
              className="p-2 sm:p-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-900/40 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Operations Matrix (The 4 iconic cards from nidatz.wuaze.com) */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Operations Overview
            </h2>
            <p className="text-xs text-slate-400">
              Manage live NIDA queues, accounts, deposits, and daily activity logs.
            </p>
          </div>
          <button
            type="button"
            onClick={refreshAll}
            className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-red-600 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Realtime Data</span>
          </button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: NIDA Requests Portal */}
          <div
            id="cardNidaRequests"
            onClick={() => setActiveModal('nida')}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-red-500/40 dark:hover:border-red-500/30 cursor-pointer transition-all duration-300 flex flex-col justify-between group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 shadow-sm group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6" />
              </div>
              <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Live Queue
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                NIDA Requests Portal
              </h3>
              <p className="text-xs text-slate-400 mt-1 mb-4 font-medium">
                Review pending user submissions and dispatch generated NIN responses.
              </p>
              <div className="flex items-baseline gap-1.5">
                <span id="lblPendingCount" className="text-3xl font-black text-red-600 dark:text-red-500">
                  {stats.pendingCount}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Pending Tasks
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Credit Requests Portal (Maombi ya Salio) */}
          <div
            id="cardCreditRequests"
            onClick={() => setActiveModal('credit_requests')}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-500/40 dark:hover:border-amber-500/30 cursor-pointer transition-all duration-300 flex flex-col justify-between group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm group-hover:scale-110 transition-transform">
                <Receipt className="w-6 h-6" />
              </div>
              {(stats.pendingCreditRequestsCount || 0) > 0 ? (
                <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> {stats.pendingCreditRequestsCount} Mpya
                </span>
              ) : (
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold px-2.5 py-1 rounded-full">
                  Imekamilika
                </span>
              )}
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                Maombi ya Salio (Credit Requests)
              </h3>
              <p className="text-xs text-slate-400 mt-1 mb-4 font-medium">
                Kagua na idhinisha au kataa maombi ya salio yaliyowasilishwa na watumiaji baada ya kulipia.
              </p>
              <div className="flex items-baseline gap-1.5">
                <span id="lblPendingCreditRequestsCount" className="text-3xl font-black text-amber-600 dark:text-amber-500">
                  {stats.pendingCreditRequestsCount || 0}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Yanayosubiri
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: User Base Manager */}
          <div
            id="cardManageUsers"
            onClick={() => setActiveModal('users')}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-red-500/40 dark:hover:border-red-500/30 cursor-pointer transition-all duration-300 flex flex-col justify-between group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-sm group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold px-2.5 py-1 rounded-full">
                Database System
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                User Base Manager
              </h3>
              <p className="text-xs text-slate-400 mt-1 mb-4 font-medium">
                Dhibiti watumiaji, fungia au fungulia, ongeza salio, au futa mtumiaji kwenye mfumo.
              </p>
              <div className="flex items-baseline gap-1.5">
                <span id="lblTotalUsersCount" className="text-3xl font-black text-slate-800 dark:text-slate-200">
                  {stats.totalUsersCount}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Registered Profiles
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Deposits Portal */}
          <div
            id="cardDeposits"
            onClick={() => setActiveModal('deposits')}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-red-500/40 dark:hover:border-red-500/30 cursor-pointer transition-all duration-300 flex flex-col justify-between group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center text-green-600 dark:text-green-400 shadow-sm group-hover:scale-110 transition-transform">
                <Wallet className="w-6 h-6" />
              </div>
              <span className="bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-400 text-xs font-bold px-2.5 py-1 rounded-full">
                Wallet Refill
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                Deposits Portal
              </h3>
              <p className="text-xs text-slate-400 mt-1 mb-4 font-medium">
                Add floating credit directly to any customer's account instantly.
              </p>
              <div className="flex items-baseline gap-1.5">
                <span id="lblDepositsCount" className="text-3xl font-black text-green-600 dark:text-green-500">
                  {stats.depositsCount}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Total Topups
                </span>
              </div>
            </div>
          </div>

          {/* Card 5: Daily History */}
          <div
            id="cardDailyHistory"
            onClick={() => setActiveModal('history')}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-red-500/40 dark:hover:border-red-500/30 cursor-pointer transition-all duration-300 flex flex-col justify-between group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-400 text-xs font-bold px-2.5 py-1 rounded-full">
                Today
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                Daily History
              </h3>
              <p className="text-xs text-slate-400 mt-1 mb-4 font-medium">
                Monitor all incoming NIDA tasks executed or requested within the current date parameters.
              </p>
              <div className="flex items-baseline gap-1.5">
                <span id="lblTodayCount" className="text-3xl font-black text-blue-600 dark:text-blue-500">
                  {stats.todayCount}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Requests Today
                </span>
              </div>
            </div>
          </div>

          {/* Card 6: Admin Audit Log (Security Oversight) */}
          <div
            id="cardAuditLogs"
            onClick={() => setActiveModal('audit_log')}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-500/40 dark:hover:border-indigo-500/30 cursor-pointer transition-all duration-300 flex flex-col justify-between group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <span className="bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-400 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" /> Live Audit
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                Admin Audit Log
              </h3>
              <p className="text-xs text-slate-400 mt-1 mb-4 font-medium">
                Kumbukumbu ya usalama kufuatilia kuongezwa kwa salio, kufuta, kufungia watumiaji, na matukio ya login.
              </p>
              <div className="flex items-baseline gap-1.5">
                <span id="lblAuditLogsCount" className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                  {auditLogs.length}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Security Events
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ===================== MODAL 1: NIDA REQUESTS QUEUE ===================== */}
      {activeModal === 'nida' && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-red-600 dark:text-red-500 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>Incoming Processing Queue ({pendingRequests.length} Pending)</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {queueFeedback && (
              <div className="mb-3 p-2.5 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 text-xs font-bold">
                {queueFeedback}
              </div>
            )}

            <div className="space-y-3 overflow-y-auto pr-1 flex-1 min-h-[300px]">
              {pendingRequests.length === 0 ? (
                <p className="text-center text-slate-400 italic py-16 text-sm">
                  🎉 Hakuna maombi yanayosubiri kwa sasa. Kila kitu kimekamilika!
                </p>
              ) : (
                pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-bold text-slate-400 text-[10px] uppercase block">
                          Customer Target:
                        </span>
                        <div className="font-mono font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                          <span>{req.targetPhone}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(req.targetPhone, req.id)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            title="Copy customer phone"
                          >
                            {copiedId === req.id ? (
                              <Check className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="text-left sm:text-right text-[11px] text-slate-400">
                        <div>Mtumaji: <strong className="text-slate-700 dark:text-slate-300 font-mono">{req.userPhone}</strong></div>
                        <div className="font-mono">{new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>

                    {/* Dispatch NIN Controls */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={ninInputs[req.id] || ''}
                          onChange={(e) => setNinInputs({ ...ninInputs, [req.id]: e.target.value })}
                          placeholder="Ingiza NIN (mf. 19941208-14205-00129-22)"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleAutoSuggestNin(req.id, req.targetPhone)}
                          className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          title="Generate/Fetch Valid NIN automatically"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Auto-Generate</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDispatchNin(req.id)}
                          disabled={fulfillingId === req.id}
                          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                        >
                          {fulfillingId === req.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          <span>Dispatch NIN</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL 2: USER BASE MANAGER ===================== */}
      {activeModal === 'users' && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-red-500" />
                <span>Account Control Matrix ({users.length} Users)</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-100 dark:border-slate-800 mb-4 mt-2">
              <button
                type="button"
                onClick={() => setUserTab('view')}
                className={`py-2 px-4 font-bold text-xs uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                  userTab === 'view'
                    ? 'border-red-600 text-red-600 dark:text-red-400'
                    : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                View All Users ({users.length})
              </button>
              <button
                type="button"
                onClick={() => setUserTab('add')}
                className={`py-2 px-4 font-bold text-xs uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                  userTab === 'add'
                    ? 'border-red-600 text-red-600 dark:text-red-400'
                    : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                + Add New User
              </button>
            </div>

            {userManageFeedback && (
              <div
                className={`mb-3 p-2.5 rounded-xl text-xs font-bold text-center ${
                  userManageFeedback.type === 'success'
                    ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300'
                    : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300'
                }`}
              >
                {userManageFeedback.message}
              </div>
            )}

            {/* Content: View Users */}
            {userTab === 'view' && (
              <div className="space-y-3 flex-1 overflow-y-auto">
                {/* Real-time server sync banner */}
                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Real-time Sync Active: Usajili na Salio hufika moja kwa moja kwa mtumiaji popote alipo.</span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">Online DB</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Tafuta mtumiaji kwa namba au jina..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>

                  {/* Filter tabs */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setUserStatusFilter('all')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                        userStatusFilter === 'all'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      Wote ({users.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserStatusFilter('active')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                        userStatusFilter === 'active'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                      }`}
                    >
                      Hai ({users.filter((u) => !u.isBlocked).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserStatusFilter('blocked')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                        userStatusFilter === 'blocked'
                          ? 'bg-red-600 text-white shadow-2xs'
                          : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30'
                      }`}
                    >
                      Wamefungwa ({users.filter((u) => u.isBlocked).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserStatusFilter('staff')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                        userStatusFilter === 'staff'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                      }`}
                    >
                      Staff ({users.filter((u) => u.role === 'admin' || u.role === 'feeder').length})
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase">
                        <th className="py-2.5 px-3">Mtumiaji (Phone)</th>
                        <th className="py-2.5 px-3">Nafasi (Role)</th>
                        <th className="py-2.5 px-3">Hali (Status)</th>
                        <th className="py-2.5 px-3">Salio (Credit)</th>
                        <th className="py-2.5 px-3 text-right">Vitendo (Actions)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                      {users
                        .filter((u) => {
                          const matchesQuery = u.phone.includes(userSearch) || (u.fullName && u.fullName.toLowerCase().includes(userSearch.toLowerCase()));
                          if (!matchesQuery) return false;
                          if (userStatusFilter === 'active') return !u.isBlocked;
                          if (userStatusFilter === 'blocked') return Boolean(u.isBlocked);
                          if (userStatusFilter === 'staff') return u.role === 'admin' || u.role === 'feeder';
                          return true;
                        })
                        .map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="py-3 px-3">
                              <span className="font-mono font-bold text-slate-900 dark:text-white block">{u.phone}</span>
                              {u.fullName && (
                                <span className="text-[10px] text-slate-400 block">{u.fullName}</span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                u.role === 'admin'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400'
                                  : u.role === 'feeder'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              {u.isBlocked ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 inline-flex items-center gap-1">
                                  <Ban className="w-3 h-3" /> Imefungwa
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 inline-flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Hai
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                              {editingUserPhone === u.phone ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    value={editCreditAmount}
                                    onChange={(e) => setEditCreditAmount(e.target.value)}
                                    placeholder={u.credit.toString()}
                                    className="w-20 px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSaveCredit(u.phone)}
                                    className="px-2 py-1 rounded bg-green-600 text-white text-[10px] font-bold"
                                  >
                                    Save
                                  </button>
                                </div>
                              ) : (
                                <span>TSh {u.credit.toFixed(2)}</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingUserPhone(u.phone);
                                    setEditCreditAmount(u.credit.toString());
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                                  title="Badili Salio"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                 {u.phone !== '0784615052' && u.phone !== currentUser.phone ? (
                                  <>
                                    {u.isBlocked ? (
                                      <button
                                        type="button"
                                        onClick={() => setConfirmUserAction({
                                          type: 'unblock',
                                          userPhone: u.phone,
                                          userName: u.fullName || u.phone
                                        })}
                                        className="px-2.5 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300 font-bold text-[10px] inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                        title="Fungulia mtumiaji huyu"
                                      >
                                        <UserCheck className="w-3.5 h-3.5" />
                                        <span>Fungulia</span>
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => setConfirmUserAction({
                                          type: 'block',
                                          userPhone: u.phone,
                                          userName: u.fullName || u.phone
                                        })}
                                        className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 font-bold text-[10px] inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                        title="Mfungie mtumiaji ashindwe kuingia"
                                      >
                                        <Ban className="w-3.5 h-3.5" />
                                        <span>Mfungie</span>
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => setConfirmUserAction({
                                        type: 'delete',
                                        userPhone: u.phone,
                                        userName: u.fullName || u.phone
                                      })}
                                      className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 font-bold text-[10px] inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                      title="Futa mtumiaji kabisa kwenye mfumo"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Futa</span>
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                                    Msimamizi Mkuu
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Content: Add User */}
            {userTab === 'add' && (
              <form onSubmit={handleAddUserSubmit} className="space-y-4 max-w-md mx-auto w-full py-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Namba ya Simu (Phone)
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="e.g. 0784615052"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Min 4 characters"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Initial Credit (TSh)
                  </label>
                  <input
                    type="number"
                    value={newUserCredit}
                    onChange={(e) => setNewUserCredit(e.target.value)}
                    placeholder="240"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Role (Nafasi)
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                  >
                    <option value="user">User (Normal Customer)</option>
                    <option value="feeder">Feeder (Field Agent)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs transition-colors shadow-md shadow-red-500/20 cursor-pointer"
                >
                  Create User Account
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ===================== MODAL 3: DEPOSITS PORTAL ===================== */}
      {activeModal === 'deposits' && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-green-600 dark:text-green-500 flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                <span>New Deposit Float (Ongeza Salio kwa Mtumiaji)</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              {/* Autocomplete User Phone */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Mtumiaji (User Phone Number)
                </label>
                <input
                  type="text"
                  required
                  value={depPhone}
                  onChange={(e) => handleDepPhoneChange(e.target.value)}
                  placeholder="e.g. 0784615052"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-xs font-bold font-mono focus:outline-none focus:border-green-600"
                />

                {/* Suggestions dropdown */}
                {depSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-20 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700/50">
                    {depSuggestions.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => {
                          setDepPhone(u.phone);
                          setDepSuggestions([]);
                        }}
                        className="p-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer flex justify-between items-center"
                      >
                        <span className="font-mono">{u.phone}</span>
                        <span className="text-[10px] text-slate-400">Salio: TSh {u.credit.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Deposit Amount */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Kiasi cha Deposit (TSh)
                </label>
                <input
                  type="number"
                  required
                  min="100"
                  value={depAmount}
                  onChange={(e) => setDepAmount(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-sm font-bold font-mono focus:outline-none focus:border-green-600"
                />
              </div>

              {/* Quick Shortcuts */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Viwango vya Haraka:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {[500, 1000, 2000, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepAmount(amt.toString())}
                      className="py-1.5 rounded-xl bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 text-xs font-bold border border-green-200 dark:border-green-900/40 hover:bg-green-100 transition-colors"
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
              </div>

              {depositFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold text-center ${
                    depositFeedback.type === 'success'
                      ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300'
                      : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300'
                  }`}
                >
                  {depositFeedback.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isDepositing}
                className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs transition-colors shadow-md shadow-green-500/20 flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isDepositing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Processing Deposit...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Deposit</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL 4: DAILY HISTORY ===================== */}
      {activeModal === 'history' && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-blue-600 dark:text-blue-500 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>Today's Requests Log ({filteredDaily.length} Today)</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={dailySearch}
                  onChange={(e) => setDailySearch(e.target.value)}
                  placeholder="Tafuta ombi la leo..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase">
                    <th className="py-2.5 px-2">Customer Target</th>
                    <th className="py-2.5 px-2">Requester</th>
                    <th className="py-2.5 px-2">NIN Status / Result</th>
                    <th className="py-2.5 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredDaily.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-slate-400 italic">
                        No tasks submitted today.
                      </td>
                    </tr>
                  ) : (
                    filteredDaily.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-2 font-mono font-bold text-slate-900 dark:text-white">
                          {row.targetPhone}
                          <button
                            type="button"
                            onClick={() => handleCopy(row.targetPhone, `cust-${row.id}`)}
                            className="ml-1 text-slate-400 hover:text-slate-600 p-1 text-[10px]"
                          >
                            {copiedId === `cust-${row.id}` ? (
                              <Check className="w-3 h-3 text-green-500 inline" />
                            ) : (
                              <Copy className="w-3 h-3 inline" />
                            )}
                          </button>
                        </td>

                        <td className="py-3 px-2 font-mono text-slate-400">
                          {row.userPhone}
                        </td>

                        <td className="py-3 px-2">
                          {row.nidaNumber ? (
                            <span className="text-green-600 dark:text-green-400 font-black tracking-wider select-all font-mono">
                              {row.nidaNumber}
                            </span>
                          ) : (
                            <span className="bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold">
                              Pending
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-2 text-right">
                          {row.nidaNumber && (
                            <button
                              type="button"
                              onClick={() => onOpenCertificateModal(row.nidaNumber!)}
                              className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] font-bold inline-flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3" />
                              <span>Slip</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL 5: CREDIT REQUESTS QUEUE ===================== */}
      {activeModal === 'credit_requests' && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-amber-600 dark:text-amber-500 flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                <span>Maombi ya Salio (Credit Requests Queue)</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  setRejectingReqId(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-slate-100 dark:border-slate-800 mb-4 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setCreditReqFilter('all')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  creditReqFilter === 'all'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Zote ({creditRequests.length})
              </button>
              <button
                type="button"
                onClick={() => setCreditReqFilter('pending')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  creditReqFilter === 'pending'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Zinazosubiri ({creditRequests.filter((c) => c.status === 'Pending').length})
              </button>
              <button
                type="button"
                onClick={() => setCreditReqFilter('approved')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  creditReqFilter === 'approved'
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 hover:bg-green-100'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                Zilizoidhinishwa ({creditRequests.filter((c) => c.status === 'Approved').length})
              </button>
              <button
                type="button"
                onClick={() => setCreditReqFilter('rejected')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  creditReqFilter === 'rejected'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 hover:bg-red-100'
                }`}
              >
                <X className="w-3.5 h-3.5" />
                Zilizokataliwa ({creditRequests.filter((c) => c.status === 'Rejected').length})
              </button>
            </div>

            {/* Search */}
            <div className="mb-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={creditReqSearch}
                  onChange={(e) => setCreditReqSearch(e.target.value)}
                  placeholder="Tafuta kwa namba ya simu, jina, namba ya muamala (ref)..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Feedback Alert */}
            {creditReqFeedback && (
              <div
                className={`mb-3 p-3 rounded-xl text-xs font-bold text-center ${
                  creditReqFeedback.type === 'success'
                    ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300 border border-red-200 dark:border-red-800'
                }`}
              >
                {creditReqFeedback.message}
              </div>
            )}

            {/* List */}
            <div className="space-y-3 overflow-y-auto pr-1 flex-1 min-h-[300px]">
              {filteredCreditRequests.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <Inbox className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="text-slate-400 font-bold text-sm">Hakuna maombi ya salio yaliyopatikana</p>
                  <p className="text-slate-400 text-xs mt-1">Watumiaji wakituma maombi ya salio baada ya kulipia, yataonekana hapa papo hapo.</p>
                </div>
              ) : (
                filteredCreditRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 transition-all"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-700/60 pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                            {req.userPhone}
                          </span>
                          {req.userName && (
                            <span className="text-xs text-slate-500 font-medium">({req.userName})</span>
                          )}
                          <span className="text-[10px] font-mono text-slate-400">#{req.id.slice(0, 8)}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(req.timestamp).toLocaleString('sw-TZ', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">
                          TSh {req.amount.toLocaleString()}
                        </span>
                        {req.status === 'Pending' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Inasubiri Uhakiki
                          </span>
                        )}
                        {req.status === 'Approved' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-400 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Imeidhinishwa
                          </span>
                        )}
                        {req.status === 'Rejected' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-400 flex items-center gap-1">
                            <X className="w-3 h-3" />
                            Imekataliwa
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Transaction Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Mtandao na Ref:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {req.paymentMethod || 'Mtandao'} • <span className="font-mono text-blue-600 dark:text-blue-400">{req.transactionRef}</span>
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(req.transactionRef, req.id)}
                          className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          title="Copy Transaction Ref"
                        >
                          {copiedId === req.id ? (
                            <Check className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {req.notes && (
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Ujumbe wa Mteja:</span>
                          <span className="text-slate-700 dark:text-slate-300 italic">{req.notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Area for Pending Requests */}
                    {req.status === 'Pending' && (
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                        {rejectingReqId === req.id ? (
                          <div className="space-y-2 p-3 rounded-xl bg-red-50/70 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
                            <span className="text-xs font-bold text-red-700 dark:text-red-300 block">
                              Chagua au andika sababu ya kukataa ombi hili:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {['Muamala haukukamilika', 'Namba ya muamala (ref) siyo sahihi', 'Kiasi hakilingani na muamala'].map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => setRejectionReasonInput(preset)}
                                  className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-red-100 cursor-pointer"
                                >
                                  {preset}
                                </button>
                              ))}
                            </div>
                            <input
                              type="text"
                              value={rejectionReasonInput}
                              onChange={(e) => setRejectionReasonInput(e.target.value)}
                              placeholder="Sababu nyingine..."
                              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 text-xs font-medium focus:outline-none"
                            />
                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectingReqId(null);
                                  setRejectionReasonInput('');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
                              >
                                Ghairi
                              </button>
                              <button
                                type="button"
                                disabled={isProcessingCreditReq === req.id}
                                onClick={() => handleRejectCreditReq(req.id)}
                                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                {isProcessingCreditReq === req.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                Thibitisha Kukataa
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => {
                                setRejectingReqId(req.id);
                                setRejectionReasonInput('');
                              }}
                              className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Kataa Ombi</span>
                            </button>

                            <button
                              type="button"
                              disabled={isProcessingCreditReq === req.id}
                              onClick={() => handleApproveCreditReq(req.id)}
                              className="px-4 py-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm disabled:opacity-50"
                            >
                              {isProcessingCreditReq === req.id ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                                  <span>Inaidhinisha...</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                  <span>Idhinisha (Ongeza TSh {req.amount.toLocaleString()})</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Approved Info */}
                    {req.status === 'Approved' && (
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-green-700 dark:text-green-400 font-bold bg-green-50/50 dark:bg-green-950/20 px-3 py-1.5 rounded-xl">
                        <span>Imeidhinishwa na {req.reviewedBy || 'Admin'}</span>
                        {req.reviewedAt && (
                          <span>
                            {new Date(req.reviewedAt).toLocaleString('sw-TZ', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Rejected Info */}
                    {req.status === 'Rejected' && (
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-red-700 dark:text-red-400 font-bold bg-red-50/50 dark:bg-red-950/20 px-3 py-1.5 rounded-xl">
                        <span>Sababu: {req.rejectionReason || 'Ilikataliwa na msimamizi'}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL 6: ADMIN AUDIT LOG ===================== */}
      {activeModal === 'audit_log' && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[88vh]">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Admin Audit Log (Mfumo wa Usalama & Ufuatiliaji)</span>
                    <span className="text-xs font-mono font-bold bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                      {auditLogs.length} Matukio
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Rekodi zote za kuongeza salio, kufuta, kufungia watumiaji, maombi ya credit na kuingia (login).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={refreshAll}
                  className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
                  title="Sasisha (Refresh)"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="py-3 flex flex-col sm:flex-row gap-3 border-b border-slate-100 dark:border-slate-800">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={auditSearchQuery}
                  onChange={(e) => setAuditSearchQuery(e.target.value)}
                  placeholder="Tafuta kwa namba ya simu, jina, au maelezo..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {[
                  { id: 'all', label: 'Yote' },
                  { id: 'CREDIT', label: 'Credit / Salio' },
                  { id: 'USER', label: 'Watumiaji' },
                  { id: 'LOGIN', label: 'Logins' },
                  { id: 'BLOCKED', label: 'Blocked' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setAuditFilterAction(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      auditFilterAction === tab.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Audit Logs List */}
            <div className="flex-1 overflow-y-auto pt-3 space-y-2.5 pr-1">
              {auditLogs
                .filter((log) => {
                  // Filter by action group
                  if (auditFilterAction === 'CREDIT' && !log.action.includes('CREDIT')) return false;
                  if (auditFilterAction === 'USER' && !log.action.includes('USER')) return false;
                  if (auditFilterAction === 'LOGIN' && !log.action.includes('LOGIN')) return false;
                  if (auditFilterAction === 'BLOCKED' && !log.action.includes('BLOCK')) return false;

                  // Filter by search query
                  if (auditSearchQuery.trim()) {
                    const q = auditSearchQuery.toLowerCase().trim();
                    const matchPhone = (log.targetPhone || '').toLowerCase().includes(q);
                    const matchActor = (log.actorPhone || '').toLowerCase().includes(q);
                    const matchName = (log.targetName || '').toLowerCase().includes(q);
                    const matchDetails = log.details.toLowerCase().includes(q);
                    return matchPhone || matchActor || matchName || matchDetails;
                  }
                  return true;
                })
                .map((log) => {
                  const isBlocked = log.action.includes('BLOCKED');
                  const isDeleted = log.action === 'USER_DELETED';
                  const isCreated = log.action === 'USER_CREATED';
                  const isCredit = log.action.includes('CREDIT');
                  const isLogin = log.action.includes('LOGIN');

                  return (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-black uppercase ${
                              isDeleted
                                ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                                : isBlocked
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                                : isCreated
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                                : isCredit
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                : 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300'
                            }`}
                          >
                            {log.action.replace(/_/g, ' ')}
                          </span>

                          <span className="text-[11px] text-slate-400 font-mono">
                            {new Date(log.timestamp).toLocaleString('sw-TZ', {
                              dateStyle: 'short',
                              timeStyle: 'medium',
                            })}
                          </span>

                          {log.actorPhone && (
                            <span className="text-[11px] text-slate-500 font-medium">
                              Kufanywa na: <strong className="font-mono text-slate-800 dark:text-slate-200">{log.actorPhone}</strong> ({log.actorRole})
                            </span>
                          )}
                        </div>

                        <p className="text-slate-700 dark:text-slate-200 font-medium text-xs leading-relaxed">
                          {log.details}
                        </p>

                        {(log.targetPhone || log.targetName) && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <span>Mlengwa:</span>
                            <span className="font-bold text-slate-900 dark:text-white font-mono">{log.targetPhone}</span>
                            {log.targetName && <span>({log.targetName})</span>}
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 self-start sm:self-center">
                        <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[10px] text-slate-400">
                          {log.id}
                        </span>
                      </div>
                    </div>
                  );
                })}

              {auditLogs.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <Activity className="w-10 h-10 mx-auto mb-2 opacity-30 text-indigo-500" />
                  <p className="font-bold">Hakuna kumbukumbu za audit bado</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================== CONFIRMATION DIALOG (BLOCK / DELETE) ===================== */}
      {confirmUserAction && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  confirmUserAction.type === 'delete'
                    ? 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400'
                    : confirmUserAction.type === 'block'
                    ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
                    : 'bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400'
                }`}
              >
                {confirmUserAction.type === 'delete' ? (
                  <Trash2 className="w-6 h-6" />
                ) : confirmUserAction.type === 'block' ? (
                  <Ban className="w-6 h-6" />
                ) : (
                  <UserCheck className="w-6 h-6" />
                )}
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {confirmUserAction.type === 'delete'
                    ? 'Thibitisha Kufuta Mtumiaji'
                    : confirmUserAction.type === 'block'
                    ? 'Thibitisha Kumfungia Mtumiaji'
                    : 'Thibitisha Kumfungulia Mtumiaji'}
                </h4>
                <p className="text-xs text-slate-500 font-mono">
                  {confirmUserAction.userPhone} {confirmUserAction.userName ? `(${confirmUserAction.userName})` : ''}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
              {confirmUserAction.type === 'delete' ? (
                <p>
                  ⚠️ <strong>Tahadhari:</strong> Mtumiaji huyu ataondolewa kabisa kwenye mfumo mara moja. Hataweza kuingia wala kufanya lolote. Hatua hii hairejesheki kirahisi.
                </p>
              ) : confirmUserAction.type === 'block' ? (
                <p>
                  Akaunti ya mtumiaji itafungwa (Blocked) mara moja. Mtumiaji akijaribu kuingia atakataliwa na salio lake litasitishwa hadi utakapomfungulia.
                </p>
              ) : (
                <p>
                  Akaunti ya mtumiaji itafunguliwa mara moja na ataruhusiwa kuingia na kuendelea kutumia mfumo kama kawaida.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmUserAction(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Ghairi (Cancel)
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirmUserAction.type === 'delete') {
                    executeDeleteUser(confirmUserAction.userPhone);
                  } else if (confirmUserAction.type === 'block') {
                    executeBlockToggle(confirmUserAction.userPhone, false);
                  } else {
                    executeBlockToggle(confirmUserAction.userPhone, true);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold shadow-md cursor-pointer transition-all ${
                  confirmUserAction.type === 'delete'
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                    : confirmUserAction.type === 'block'
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                    : 'bg-green-600 hover:bg-green-700 shadow-green-500/20'
                }`}
              >
                {confirmUserAction.type === 'delete'
                  ? 'Ndio, Futa Kabisa'
                  : confirmUserAction.type === 'block'
                  ? 'Ndio, Mfungie Sasa'
                  : 'Ndio, Mfungulie Sasa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer credit */}
      <footer className="w-full py-6 text-center text-xs text-slate-500 dark:text-slate-400 font-medium border-t border-slate-200/60 dark:border-slate-800/60 mt-12">
        Developed by Digital sales &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};
