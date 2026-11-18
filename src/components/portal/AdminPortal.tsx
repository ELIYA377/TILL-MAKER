import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Briefcase,
  CreditCard,
  Wallet,
  ArrowDownToLine,
  FileSpreadsheet,
  Settings,
  LogOut,
  RefreshCw,
  Download,
  Plus,
  Search,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  Shield,
  Upload,
  Menu,
  X,
  Eye,
} from 'lucide-react';
import {
  AdminAccount,
  MerchantBalanceData,
  PaymentRecord,
  ServiceCategory,
  ServiceItem,
  ServiceRequestItem,
  ServiceRequirement,
  UserAccount,
  WithdrawalRecord,
} from '../../types/app';
import { apiRequest, formatDateTime, formatTzs, formatBytes, setAdminToken, withAdminDownloadToken } from '../../lib/api';
import { BrandFooter } from './BrandFooter';
import { StatusBadge } from './StatusBadge';
import { LanguageToggleButton, usePortalCopy } from '../../lib/i18n';
import { PWAInstallButton } from './PWAComponents';

type AdminTab =
  | 'overview'
  | 'requests'
  | 'users'
  | 'services'
  | 'payments'
  | 'merchant'
  | 'withdrawals'
  | 'logs'
  | 'settings';

interface AdminPortalProps {
  onNavigateUserPortal: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onNavigateUserPortal }) => {
  const { language, copy } = usePortalCopy();
  const [admin, setAdmin] = useState<AdminAccount | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Overview state
  const [stats, setStats] = useState<any>({});
  const [adminNotifs, setAdminNotifs] = useState<any[]>([]);

  // Requests state
  const [requests, setRequests] = useState<ServiceRequestItem[]>([]);
  const [reqFilter, setReqFilter] = useState<string>('ALL');
  const [processingReq, setProcessingReq] = useState<ServiceRequestItem | null>(null);
  const [processAction, setProcessAction] = useState<'complete' | 'reject'>('complete');
  const [resultSummary, setResultSummary] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [refundCredits, setRefundCredits] = useState(false);
  const [completedFile, setCompletedFile] = useState<File | null>(null);
  const [submittingProcess, setSubmittingProcess] = useState(false);

  // Users state
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [creditModalUser, setCreditModalUser] = useState<UserAccount | null>(null);
  const [creditAmount, setCreditAmount] = useState('2');
  const [creditReason, setCreditReason] = useState('Manual credit addition');
  const [historyModalUser, setHistoryModalUser] = useState<{ user: UserAccount; requests: any[]; credits: any[] } | null>(null);

  // Services state
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [editingService, setEditingService] = useState<Partial<ServiceItem> | null>(null);

  // Payments state
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [payFilter, setPayFilter] = useState('ALL');
  const [paySummary, setPaySummary] = useState<any>({});

  // Merchant Balance state
  const [merchantData, setMerchantData] = useState<MerchantBalanceData | null>(null);
  const [merchantHistory, setMerchantHistory] = useState<any[]>([]);
  const [loadingMerchant, setLoadingMerchant] = useState(false);

  // Withdrawals state
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [wdApiActive, setWdApiActive] = useState(false);
  const [wdAmount, setWdAmount] = useState('');
  const [wdNetwork, setWdNetwork] = useState<'Airtel Money' | 'Yas Pesa' | 'M-Pesa' | 'HaloPesa'>('M-Pesa');
  const [wdPhone, setWdPhone] = useState('');
  const [wdName, setWdName] = useState('');
  const [wdNotes, setWdNotes] = useState('');
  const [wdReviewing, setWdReviewing] = useState(false);

  // Logs & Reports state
  const [logsData, setLogsData] = useState<any>(null);

  // Settings state
  const [sysSettings, setSysSettings] = useState<Record<string, string>>({});
  const [dsnConfigured, setDsnConfigured] = useState(false);
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const checkAdminAuth = useCallback(async () => {
    try {
      const res = await apiRequest<{ authenticated: boolean; admin: AdminAccount | null }>('/api/admin/me');
      setAdmin(res.admin);
    } catch {
      setAdmin(null);
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    checkAdminAuth();
  }, [checkAdminAuth]);

  const loadTabData = useCallback(async (tab: AdminTab) => {
    if (!admin) return;
    try {
      if (tab === 'overview') {
        const res = await apiRequest('/api/admin/overview');
        setStats(res.stats || {});
        setAdminNotifs(res.notifications || []);
      } else if (tab === 'requests') {
        const q = reqFilter !== 'ALL' ? `?status=${encodeURIComponent(reqFilter)}` : '';
        const res = await apiRequest(`/api/admin/requests${q}`);
        setRequests(res.requests || []);
      } else if (tab === 'users') {
        const q = userSearch ? `?q=${encodeURIComponent(userSearch)}` : '';
        const res = await apiRequest(`/api/admin/users${q}`);
        setUsers(res.users || []);
      } else if (tab === 'services') {
        const res = await apiRequest('/api/admin/services');
        setServices(res.services || []);
      } else if (tab === 'payments') {
        const q = payFilter !== 'ALL' ? `?status=${encodeURIComponent(payFilter)}` : '';
        const res = await apiRequest(`/api/admin/payments${q}`);
        setPayments(res.payments || []);
        setPaySummary(res.summary || {});
      } else if (tab === 'merchant') {
        setLoadingMerchant(true);
        const res = await apiRequest('/api/admin/merchant-balance');
        setMerchantData(res.balance);
        setMerchantHistory(res.history || []);
        setLoadingMerchant(false);
      } else if (tab === 'withdrawals') {
        const res = await apiRequest('/api/admin/withdrawals');
        setWithdrawals(res.withdrawals || []);
        setWdApiActive(Boolean(res.withdrawalApiActive));
      } else if (tab === 'logs') {
        const res = await apiRequest('/api/admin/logs');
        setLogsData(res);
      } else if (tab === 'settings') {
        const res = await apiRequest('/api/admin/settings');
        setSysSettings(res.settings || {});
        setDsnConfigured(Boolean(res.dsnApiKeyConfigured));
      }
    } catch (err: any) {
      setLoadingMerchant(false);
      setBanner({ type: 'error', text: err.message || 'Failed to load admin data.' });
    }
  }, [admin, reqFilter, userSearch, payFilter]);

  useEffect(() => {
    if (admin) {
      loadTabData(activeTab);
    }
  }, [admin, activeTab, loadTabData]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const res = await apiRequest<{ admin: AdminAccount; token?: string }>('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });
      if (res.token) setAdminToken(res.token);
      setAdmin(res.admin);
    } catch (err: any) {
      setLoginError(err.message || 'Admin login failed.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await apiRequest('/api/admin/logout', { method: 'POST' });
    } catch {
      /* ignore */
    }
    setAdminToken(null);
    setAdmin(null);
  };

  // Request processing handler
  const handleProcessRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!processingReq) return;
    setSubmittingProcess(true);
    setBanner(null);
    try {
      const fd = new FormData();
      fd.append('action', processAction);
      fd.append('resultSummary', resultSummary);
      fd.append('rejectionReason', rejectionReason);
      fd.append('internalNotes', internalNotes);
      fd.append('refundCredits', String(refundCredits));
      if (completedFile && processAction === 'complete') {
        fd.append('completedFile', completedFile);
      }

      const res = await apiRequest<{ message: string }>(`/api/admin/requests/${processingReq.id}/process`, {
        method: 'POST',
        body: fd,
      });
      setBanner({ type: 'success', text: res.message });
      setProcessingReq(null);
      setCompletedFile(null);
      setResultSummary('');
      setRejectionReason('');
      setInternalNotes('');
      setRefundCredits(false);
      loadTabData('requests');
    } catch (err: any) {
      setBanner({ type: 'error', text: err.message || 'Failed to process request.' });
    } finally {
      setSubmittingProcess(false);
    }
  };

  // User actions
  const toggleUserStatus = async (u: UserAccount) => {
    const nextStatus = u.status === 'active' ? 'suspended' : 'active';
    const res = await apiRequest<{ message: string }>(`/api/admin/users/${u.id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status: nextStatus }),
    });
    setBanner({ type: 'success', text: res.message });
    loadTabData('users');
  };

  const deleteUser = async (u: UserAccount) => {
    const res = await apiRequest<{ message: string }>(`/api/admin/users/${u.id}`, {
      method: 'DELETE',
    });
    setBanner({ type: 'success', text: res.message });
    loadTabData('users');
  };

  const handleAddCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditModalUser) return;
    try {
      const res = await apiRequest<{ message: string }>(`/api/admin/users/${creditModalUser.id}/credits`, {
        method: 'POST',
        body: JSON.stringify({ credits: Number(creditAmount), reason: creditReason }),
      });
      setBanner({ type: 'success', text: res.message });
      setCreditModalUser(null);
      loadTabData('users');
    } catch (err: any) {
      setBanner({ type: 'error', text: err.message });
    }
  };

  const openUserHistory = async (u: UserAccount) => {
    const res = await apiRequest(`/api/admin/users/${u.id}/history`);
    setHistoryModalUser({ user: u, requests: res.requests || [], credits: res.creditTransactions || [] });
  };

  // Service Save / Delete
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    try {
      if (editingService.id) {
        const res = await apiRequest<{ message: string }>(`/api/admin/services/${editingService.id}`, {
          method: 'PUT',
          body: JSON.stringify(editingService),
        });
        setBanner({ type: 'success', text: res.message });
      } else {
        const res = await apiRequest<{ message: string }>('/api/admin/services', {
          method: 'POST',
          body: JSON.stringify(editingService),
        });
        setBanner({ type: 'success', text: res.message });
      }
      setEditingService(null);
      loadTabData('services');
    } catch (err: any) {
      setBanner({ type: 'error', text: err.message });
    }
  };

  const handleDeleteService = async (svcId: number) => {
    const res = await apiRequest<{ message: string }>(`/api/admin/services/${svcId}`, { method: 'DELETE' });
    setBanner({ type: 'success', text: res.message });
    loadTabData('services');
  };

  // Withdrawal submit
  const handleConfirmWithdrawal = async () => {
    try {
      const res = await apiRequest<{ message: string }>('/api/admin/withdrawals', {
        method: 'POST',
        body: JSON.stringify({
          amount: Number(wdAmount),
          network: wdNetwork,
          recipientPhone: wdPhone,
          recipientName: wdName,
          notes: wdNotes,
        }),
      });
      setBanner({ type: 'success', text: res.message });
      setWdReviewing(false);
      setWdAmount('');
      setWdPhone('');
      setWdName('');
      setWdNotes('');
      loadTabData('withdrawals');
    } catch (err: any) {
      setBanner({ type: 'error', text: err.message });
    }
  };

  // Settings save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest<{ message: string }>('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({
          ...sysSettings,
          newAdminPassword: newAdminPassword || undefined,
        }),
      });
      setBanner({ type: 'success', text: res.message });
      setNewAdminPassword('');
    } catch (err: any) {
      setBanner({ type: 'error', text: err.message });
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest<{ message: string }>('/api/admin/notifications/broadcast', {
        method: 'POST',
        body: JSON.stringify({ title: broadcastTitle, message: broadcastMessage }),
      });
      setBanner({ type: 'success', text: res.message });
      setBroadcastTitle('');
      setBroadcastMessage('');
    } catch (err: any) {
      setBanner({ type: 'error', text: err.message });
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B162C] text-white text-sm">
        Loading Admin Portal...
      </div>
    );
  }

  // ADMIN LOGIN SCREEN
  if (!admin) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <header className="w-full bg-[#0B162C] text-white border-b border-slate-800 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/src/assets/images/brand_emblem_gold_1794977527028.jpg"
              alt="Digital Sales Pro Max"
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-lg object-cover border border-[#D4AF37]/40"
            />
            <span className="font-bold text-sm sm:text-base tracking-tight">
              DIGITAL SALES PRO MAX · Admin Control
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggleButton variant="dark" />
            <PWAInstallButton variant="dark" compact />
            <button
              type="button"
              onClick={onNavigateUserPortal}
              className="text-xs font-semibold text-[#D4AF37] hover:underline cursor-pointer"
            >
              {language === 'sw' ? 'Rudi Kwa Mtumiaji' : 'Back to User Portal'}
            </button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-7 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#0B162C] text-[#D4AF37] flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Administrator Sign In</h1>
                <p className="text-xs text-slate-500">Restricted to authorized Digital Sales administrators.</p>
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-800">
                {loginError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Admin Username or Phone
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin or 0784615052"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B162C]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Admin Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B162C]"
                />
              </div>
              <button
                type="submit"
                disabled={loggingIn}
                className="w-full py-3 rounded-lg bg-[#0B162C] hover:bg-[#132547] text-white text-xs font-bold tracking-wide cursor-pointer"
              >
                {loggingIn ? 'Authenticating...' : 'SIGN IN TO ADMIN DASHBOARD'}
              </button>
            </form>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">Default Initial Setup Credentials</p>
              <p className="font-mono">Username: admin · Phone: 0784615052</p>
              <p className="font-mono">Password: Admin@2026</p>
              <p className="text-[11px] text-slate-500">Change this password immediately in Admin Settings.</p>
            </div>
          </div>
        </main>

        <BrandFooter />
      </div>
    );
  }

  const navItems: Array<{ id: AdminTab; label: string; icon: React.ComponentType<any> }> =
    language === 'sw'
      ? [
          { id: 'overview', label: 'Muhtasari', icon: LayoutDashboard },
          { id: 'requests', label: 'Maombi', icon: ClipboardList },
          { id: 'users', label: 'Watumiaji', icon: Users },
          { id: 'services', label: 'Huduma', icon: Briefcase },
          { id: 'payments', label: 'Malipo', icon: CreditCard },
          { id: 'merchant', label: 'Salio la DSN Merchant', icon: Wallet },
          { id: 'withdrawals', label: 'Toa Pesa', icon: ArrowDownToLine },
          { id: 'logs', label: 'Ripoti & Kumbukumbu', icon: FileSpreadsheet },
          { id: 'settings', label: 'Mipangilio & InfinityFree', icon: Settings },
        ]
      : [
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'requests', label: 'Requests', icon: ClipboardList },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'services', label: 'Services', icon: Briefcase },
          { id: 'payments', label: 'Payments', icon: CreditCard },
          { id: 'merchant', label: 'DSN Merchant Balance', icon: Wallet },
          { id: 'withdrawals', label: 'Withdraw Money', icon: ArrowDownToLine },
          { id: 'logs', label: 'Reports & Logs', icon: FileSpreadsheet },
          { id: 'settings', label: 'Settings & InfinityFree', icon: Settings },
        ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
      {/* Admin Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-[#0B162C] text-white shrink-0 border-r border-slate-800">
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <img
            src="/src/assets/images/brand_emblem_gold_1794977527028.jpg"
            alt="Digital Sales Pro Max"
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-lg object-cover border border-[#D4AF37]/40 shrink-0"
          />
          <div>
            <p className="font-bold text-xs tracking-tight text-white">DIGITAL SALES PRO MAX</p>
            <p className="text-[11px] font-semibold text-[#D4AF37]">Admin Operations</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-[#162B52] text-[#D4AF37]'
                    : 'text-slate-300 hover:bg-[#10203F] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800 space-y-1">
          <button
            type="button"
            onClick={onNavigateUserPortal}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-[#10203F] cursor-pointer"
          >
            <span>Open User Portal</span>
          </button>
          <button
            type="button"
            onClick={handleAdminLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold text-red-300 hover:bg-red-950/50 cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Admin Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-700 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Admin Console</p>
              <h1 className="text-sm sm:text-base font-bold text-slate-900">
                {navItems.find((n) => n.id === activeTab)?.label}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggleButton variant="light" />
            <div className="hidden sm:inline-flex">
              <PWAInstallButton variant="light" compact />
            </div>
            <span className="hidden md:inline text-xs font-medium text-slate-600">{admin.full_name}</span>
            <button
              type="button"
              onClick={() => loadTabData(activeTab)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{copy.refreshBtn}</span>
            </button>
          </div>
        </header>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0B162C] text-white p-3 space-y-1 border-b border-slate-800">
            <div className="flex items-center justify-between gap-2 px-1 pb-2">
              <LanguageToggleButton variant="dark" />
              <PWAInstallButton variant="dark" compact />
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    activeTab === item.id ? 'bg-[#162B52] text-[#D4AF37]' : 'text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={handleAdminLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-red-300 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{copy.logoutBtn}</span>
            </button>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {banner && (
            <div
              className={`p-4 rounded-xl border text-sm font-medium flex items-center justify-between gap-3 ${
                banner.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              <span>{banner.text}</span>
              <button type="button" onClick={() => setBanner(null)} className="cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <p className="text-xs text-slate-500">Registered Users</p>
                  <p className="text-2xl font-mono font-bold text-slate-900 tabular-nums mt-1">{stats.usersTotal ?? 0}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{stats.usersActive ?? 0} active accounts</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <p className="text-xs text-slate-500">Pending Requests</p>
                  <p className="text-2xl font-mono font-bold text-amber-700 tabular-nums mt-1">{stats.reqSubmitted ?? 0}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{stats.reqCompleted ?? 0} completed · {stats.reqRejected ?? 0} rejected</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <p className="text-xs text-slate-500">Total Collected Payments</p>
                  <p className="text-2xl font-mono font-bold text-emerald-700 tabular-nums mt-1">{formatTzs(stats.totalCollectedTzs ?? 0)}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{stats.successfulPaymentsCount ?? 0} verified orders</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <p className="text-xs text-slate-500">Total User Credits Held</p>
                  <p className="text-2xl font-mono font-bold text-[#0B162C] tabular-nums mt-1">{stats.totalUserCredits ?? 0}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{stats.servicesActive ?? 0} active services</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900">Recent Admin Alerts & System Activity</h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('requests')}
                    className="text-xs font-semibold text-[#0B162C] hover:underline cursor-pointer"
                  >
                    Process Requests
                  </button>
                </div>
                {adminNotifs.length === 0 ? (
                  <p className="p-6 text-xs text-slate-500 text-center">No alerts yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {adminNotifs.map((n) => (
                      <div key={n.id} className="px-5 py-3 flex items-center justify-between gap-4 text-xs">
                        <div>
                          <p className="font-semibold text-slate-900">{n.title}</p>
                          <p className="text-slate-600">{n.message}</p>
                        </div>
                        <span className="font-mono text-slate-400 whitespace-nowrap">{formatDateTime(n.created_at)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* REQUEST MANAGEMENT */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
                  {['ALL', 'Submitted', 'Completed', 'Rejected'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setReqFilter(st)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer ${
                        reqFilter === st ? 'bg-[#0B162C] text-white' : 'text-slate-700'
                      }`}
                    >
                      {st === 'ALL' ? 'All Requests' : st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                {requests.length === 0 ? (
                  <p className="p-8 text-center text-sm text-slate-500">No requests found for this filter.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                          <th className="py-3 px-4">Request ID</th>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Service</th>
                          <th className="py-3 px-4">Docs</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Submitted</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {requests.map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-mono font-bold text-slate-900">{r.request_code}</td>
                            <td className="py-3 px-4">
                              <p className="font-semibold text-slate-900">{r.user_name}</p>
                              <p className="font-mono text-slate-500">{r.user_phone}</p>
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-800">{r.service_name}</td>
                            <td className="py-3 px-4 font-mono">{r.documents.length} file(s)</td>
                            <td className="py-3 px-4"><StatusBadge status={r.status} /></td>
                            <td className="py-3 px-4 font-mono text-slate-500">{formatDateTime(r.created_at)}</td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setProcessingReq(r);
                                  setProcessAction('complete');
                                  setResultSummary(r.result_summary || '');
                                  setRejectionReason(r.rejection_reason || '');
                                  setInternalNotes(r.admin_internal_notes || '');
                                  setCompletedFile(null);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-[#0B162C] text-white text-xs font-semibold hover:bg-[#132547] cursor-pointer"
                              >
                                Review & Process
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative max-w-sm w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search user name or phone..."
                    className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B162C]"
                  />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                {users.length === 0 ? (
                  <p className="p-8 text-center text-sm text-slate-500">No registered users found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                          <th className="py-3 px-4">Full Name</th>
                          <th className="py-3 px-4">Phone</th>
                          <th className="py-3 px-4 text-right">Credits</th>
                          <th className="py-3 px-4 text-right">Requests</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-semibold text-slate-900">{u.full_name}</td>
                            <td className="py-3 px-4 font-mono">{u.phone}</td>
                            <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">{u.credit_balance}</td>
                            <td className="py-3 px-4 text-right font-mono tabular-nums">{u.request_count ?? 0}</td>
                            <td className="py-3 px-4"><StatusBadge status={u.status} /></td>
                            <td className="py-3 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCreditModalUser(u);
                                    setCreditAmount('2');
                                  }}
                                  className="px-2.5 py-1 rounded bg-[#D4AF37] text-[#0B162C] font-bold hover:bg-[#E5C158] cursor-pointer"
                                >
                                  + Credits
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openUserHistory(u)}
                                  className="p-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
                                  title="View History"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleUserStatus(u)}
                                  className="px-2.5 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
                                >
                                  {u.status === 'active' ? 'Suspend' : 'Activate'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteUser(u)}
                                  className="p-1.5 rounded border border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SERVICE MANAGEMENT */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Manage NIDA, Document, and Till services, credit costs, and required customer fields.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setEditingService({
                      category: 'DOCUMENT SERVICES',
                      name: '',
                      description: '',
                      requirements_summary: '',
                      credit_cost: 2,
                      is_active: 1,
                      requirements: [
                        { field_label: 'Applicant Full Name', field_name: 'applicant_name', field_type: 'text', is_required: 1, placeholder: '' },
                        { field_label: 'Supporting Document (PDF/JPG/PNG)', field_name: 'supporting_doc', field_type: 'file', is_required: 1, placeholder: '' },
                      ],
                    })
                  }
                  className="px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B162C] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Service</span>
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                        <th className="py-3 px-4">Service Name</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4 text-right">Credit Cost</th>
                        <th className="py-3 px-4 text-right">Fields</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {services.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-semibold text-slate-900">{s.name}</td>
                          <td className="py-3 px-4 text-slate-600">{s.category}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">{s.credit_cost}</td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums">{s.requirements.length}</td>
                          <td className="py-3 px-4"><StatusBadge status={s.is_active ? 'Active' : 'Suspended'} /></td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingService(JSON.parse(JSON.stringify(s)))}
                                className="p-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteService(s.id)}
                                className="p-1.5 rounded border border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PAYMENTS MANAGEMENT */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <p className="text-xs text-slate-500">Total Collected</p>
                  <p className="text-xl font-mono font-bold text-emerald-700 tabular-nums mt-1">{formatTzs(paySummary.total_collected ?? 0)}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <p className="text-xs text-slate-500">Successful Payments</p>
                  <p className="text-xl font-mono font-bold text-slate-900 tabular-nums mt-1">{paySummary.count_success ?? 0}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <p className="text-xs text-slate-500">Pending Payments</p>
                  <p className="text-xl font-mono font-bold text-amber-700 tabular-nums mt-1">{paySummary.count_pending ?? 0}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <p className="text-xs text-slate-500">Failed Payments</p>
                  <p className="text-xl font-mono font-bold text-red-700 tabular-nums mt-1">{paySummary.count_failed ?? 0}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg w-fit">
                {['ALL', 'Success', 'Pending', 'Failed'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setPayFilter(st)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer ${
                      payFilter === st ? 'bg-[#0B162C] text-white' : 'text-slate-700'
                    }`}
                  >
                    {st === 'ALL' ? 'All Payments' : st}
                  </button>
                ))}
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                {payments.length === 0 ? (
                  <p className="p-8 text-center text-sm text-slate-500">No payments found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                          <th className="py-3 px-4">Order ID</th>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Pay Phone</th>
                          <th className="py-3 px-4 text-right">Amount</th>
                          <th className="py-3 px-4 text-right">Credits</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Verify</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {payments.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.order_id}</td>
                            <td className="py-3 px-4">
                              <p className="font-semibold text-slate-900">{p.user_name}</p>
                              <p className="font-mono text-slate-500">{p.user_phone}</p>
                            </td>
                            <td className="py-3 px-4 font-mono">{p.payment_phone}</td>
                            <td className="py-3 px-4 text-right font-mono tabular-nums">{formatTzs(p.amount_tzs)}</td>
                            <td className="py-3 px-4 text-right font-mono tabular-nums">{p.expected_credits}</td>
                            <td className="py-3 px-4"><StatusBadge status={p.status} /></td>
                            <td className="py-3 px-4 text-right">
                              {p.status === 'Pending' ? (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      const res = await apiRequest<{ message: string }>(`/api/admin/payments/${p.order_id}/verify`, { method: 'POST' });
                                      setBanner({ type: 'success', text: res.message });
                                      loadTabData('payments');
                                    } catch (err: any) {
                                      setBanner({ type: 'error', text: err.message });
                                    }
                                  }}
                                  className="px-2.5 py-1 rounded bg-[#0B162C] text-white font-semibold cursor-pointer"
                                >
                                  Check DSN
                                </button>
                              ) : (
                                <span className="font-mono text-slate-400">{p.dsn_reference || '—'}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DSN MERCHANT BALANCE */}
          {activeTab === 'merchant' && (
            <div className="space-y-6">
              <div className="bg-[#0B162C] text-white rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                    DSN Technology Merchant Account · DSN-0036
                  </p>
                  <h2 className="text-xl font-bold mt-1">Live Merchant Balance</h2>
                  <p className="text-xs text-slate-300 mt-1">
                    Last Updated: <span className="font-mono">{merchantData ? formatDateTime(merchantData.checkedAt) : '—'}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-lg bg-white text-slate-900">
                    <StatusBadge status={merchantData?.connectionStatus || 'Not Configured'} />
                  </div>
                  <button
                    type="button"
                    disabled={loadingMerchant}
                    onClick={() => loadTabData('merchant')}
                    className="px-4 py-2.5 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B162C] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingMerchant ? 'animate-spin' : ''}`} />
                    <span>Refresh Balance</span>
                  </button>
                </div>
              </div>

              {merchantData && !merchantData.ok && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <p className="font-bold">DSN API Connection Notice</p>
                  <p className="mt-1">{merchantData.message}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: 'Available Balance', val: merchantData?.availableBalance },
                  { label: 'Pending Funds', val: merchantData?.pendingFunds },
                  { label: 'Reserved for Withdrawals', val: merchantData?.reservedForWithdrawals },
                  { label: 'Total Collected', val: merchantData?.totalCollected },
                  { label: 'Total Collection Fees', val: merchantData?.totalCollectionFees },
                  { label: 'Total Net Earnings', val: merchantData?.totalNetEarnings },
                ].map((m) => (
                  <div key={m.label} className="bg-white border border-slate-200 rounded-xl p-5">
                    <p className="text-xs text-slate-500">{m.label}</p>
                    <p className="text-2xl font-mono font-bold text-slate-900 tabular-nums mt-1">
                      {formatTzs(m.val)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900">Merchant Balance Sync History</h3>
                </div>
                {merchantHistory.length === 0 ? (
                  <p className="p-6 text-xs text-slate-500 text-center">No balance checks logged yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                          <th className="py-2.5 px-4">Checked At</th>
                          <th className="py-2.5 px-4">API Status</th>
                          <th className="py-2.5 px-4 text-right">Available</th>
                          <th className="py-2.5 px-4 text-right">Net Earnings</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {merchantHistory.map((h) => (
                          <tr key={h.id}>
                            <td className="py-2.5 px-4 font-mono text-slate-600">{formatDateTime(h.created_at)}</td>
                            <td className="py-2.5 px-4"><StatusBadge status={h.api_status} /></td>
                            <td className="py-2.5 px-4 text-right font-mono tabular-nums">{formatTzs(h.available_balance)}</td>
                            <td className="py-2.5 px-4 text-right font-mono tabular-nums">{formatTzs(h.total_net_earnings)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* WITHDRAWAL SYSTEM */}
          {activeTab === 'withdrawals' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Admin Withdraw Money</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Supported networks: Airtel Money, Yas Pesa, M-Pesa, HaloPesa.
                  </p>
                </div>

                {!wdApiActive && (
                  <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                    Official DSN Technology payout/withdrawal API endpoint is pending integration. Confirmed withdrawals are securely queued with Pending status until official DSN withdrawal API activation.
                  </div>
                )}

                {!wdReviewing ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setWdReviewing(true);
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Withdrawal Amount (TSh)</label>
                      <input
                        type="number"
                        min={1000}
                        required
                        value={wdAmount}
                        onChange={(e) => setWdAmount(e.target.value)}
                        placeholder="e.g. 50000"
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg font-mono tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Network</label>
                      <select
                        value={wdNetwork}
                        onChange={(e) => setWdNetwork(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="Airtel Money">Airtel Money</option>
                        <option value="Yas Pesa">Yas Pesa</option>
                        <option value="M-Pesa">M-Pesa</option>
                        <option value="HaloPesa">HaloPesa</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Recipient Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={wdPhone}
                        onChange={(e) => setWdPhone(e.target.value)}
                        placeholder="07XXXXXXXX"
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Recipient Full Name</label>
                      <input
                        type="text"
                        required
                        value={wdName}
                        onChange={(e) => setWdName(e.target.value)}
                        placeholder="Registered account name"
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Notes (Optional)</label>
                      <input
                        type="text"
                        value={wdNotes}
                        onChange={(e) => setWdNotes(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-lg bg-[#0B162C] text-white text-xs font-bold cursor-pointer"
                    >
                      Review Withdrawal Details
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900">Confirm Withdrawal Details</h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Amount:</span>
                        <span className="font-mono font-bold text-slate-900">{formatTzs(Number(wdAmount))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Network:</span>
                        <span className="font-semibold text-slate-900">{wdNetwork}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Recipient Phone:</span>
                        <span className="font-mono font-semibold text-slate-900">{wdPhone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Recipient Name:</span>
                        <span className="font-semibold text-slate-900">{wdName}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setWdReviewing(false)}
                        className="flex-1 py-2 rounded-lg border border-slate-300 text-xs font-semibold cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmWithdrawal}
                        className="flex-1 py-2 rounded-lg bg-[#D4AF37] text-[#0B162C] text-xs font-bold cursor-pointer"
                      >
                        Confirm Withdrawal
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900">Withdrawal History</h3>
                </div>
                {withdrawals.length === 0 ? (
                  <p className="p-8 text-center text-sm text-slate-500">No withdrawals recorded yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                          <th className="py-3 px-4">Code</th>
                          <th className="py-3 px-4">Network</th>
                          <th className="py-3 px-4">Recipient</th>
                          <th className="py-3 px-4 text-right">Amount</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {withdrawals.map((w) => (
                          <tr key={w.id}>
                            <td className="py-3 px-4 font-mono font-bold text-slate-900">{w.withdrawal_code}</td>
                            <td className="py-3 px-4 font-semibold">{w.network}</td>
                            <td className="py-3 px-4">
                              <p className="font-semibold text-slate-800">{w.recipient_name}</p>
                              <p className="font-mono text-slate-500">{w.recipient_phone}</p>
                            </td>
                            <td className="py-3 px-4 text-right font-mono tabular-nums">{formatTzs(w.amount_tzs)}</td>
                            <td className="py-3 px-4"><StatusBadge status={w.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* REPORTS & LOGS */}
          {activeTab === 'logs' && logsData && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <p className="text-xs text-slate-500">Credits Purchased</p>
                  <p className="text-xl font-mono font-bold text-emerald-700 tabular-nums mt-1">
                    {logsData.creditReport?.total_purchased ?? 0}
                  </p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <p className="text-xs text-slate-500">Admin Credits Added</p>
                  <p className="text-xl font-mono font-bold text-[#0B162C] tabular-nums mt-1">
                    {logsData.creditReport?.total_admin_added ?? 0}
                  </p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <p className="text-xs text-slate-500">Credits Deducted</p>
                  <p className="text-xl font-mono font-bold text-amber-700 tabular-nums mt-1">
                    {logsData.creditReport?.total_deducted ?? 0}
                  </p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <p className="text-xs text-slate-500">Credits Refunded</p>
                  <p className="text-xl font-mono font-bold text-slate-700 tabular-nums mt-1">
                    {logsData.creditReport?.total_refunded ?? 0}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900">System Activity Audit Logs</h3>
                </div>
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                        <th className="py-2.5 px-4">Timestamp</th>
                        <th className="py-2.5 px-4">Actor</th>
                        <th className="py-2.5 px-4">Action</th>
                        <th className="py-2.5 px-4">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(logsData.activityLogs || []).map((log: any) => (
                        <tr key={log.id}>
                          <td className="py-2.5 px-4 font-mono text-slate-500 whitespace-nowrap">{formatDateTime(log.created_at)}</td>
                          <td className="py-2.5 px-4 font-medium text-slate-800">{log.actor_label}</td>
                          <td className="py-2.5 px-4 font-mono font-semibold text-[#0B162C]">{log.action}</td>
                          <td className="py-2.5 px-4 text-slate-600">{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS, BROADCAST, BACKUP & INFINITYFREE PHP EXPORT */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <h2 className="text-base font-bold text-slate-900">System & Credit Conversion Settings</h2>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Credit Conversion Rate (TSh per 1 Credit)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={sysSettings.credit_rate_tzs || '100'}
                    onChange={(e) => setSysSettings({ ...sysSettings, credit_rate_tzs: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Default Service Credit Cost
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    value={sysSettings.default_request_cost || '2'}
                    onChange={(e) => setSysSettings({ ...sysSettings, default_request_cost: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    DSN Merchant User ID
                  </label>
                  <input
                    type="text"
                    value={sysSettings.dsn_user_id || 'DSN-0036'}
                    onChange={(e) => setSysSettings({ ...sysSettings, dsn_user_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Server DSN_API_KEY Status: <span className="font-semibold">{dsnConfigured ? 'Configured in Server Env' : 'Not Set (Add DSN_API_KEY to server secrets)'}</span>
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Support Phone Number
                  </label>
                  <input
                    type="tel"
                    value={sysSettings.support_phone || ''}
                    onChange={(e) => setSysSettings({ ...sysSettings, support_phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Change Admin Password (Optional, Min 6 chars)
                  </label>
                  <input
                    type="password"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="Leave blank to keep current password"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-lg bg-[#0B162C] text-white text-xs font-bold cursor-pointer"
                >
                  Save System Settings
                </button>
              </form>

              <div className="space-y-6">
                <form onSubmit={handleBroadcast} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                  <h2 className="text-base font-bold text-slate-900">Send System Notification to Users</h2>
                  <input
                    type="text"
                    required
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="Notification title"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                  />
                  <textarea
                    rows={3}
                    required
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Notification message for all active users..."
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-lg bg-[#0B162C] text-white text-xs font-bold cursor-pointer"
                  >
                    Broadcast Notification
                  </button>
                </form>

                <div className="bg-[#0B162C] text-white rounded-xl p-6 space-y-4">
                  <h2 className="text-base font-bold text-white">Backup & InfinityFree PHP 8+ / MySQL Deployment</h2>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Download a full database backup or export the complete PHP 8+, MySQL (15 tables), Bootstrap 5, and `install.php` package ready for InfinityFree hosting.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href={withAdminDownloadToken('/api/admin/backup')}
                      className="flex-1 py-2.5 px-4 rounded-lg bg-white text-[#0B162C] text-xs font-bold inline-flex items-center justify-center gap-2 hover:bg-slate-100"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export JSON Backup</span>
                    </a>
                    <a
                      href={withAdminDownloadToken('/api/admin/export-php-package')}
                      className="flex-1 py-2.5 px-4 rounded-lg bg-[#D4AF37] text-[#0B162C] text-xs font-bold inline-flex items-center justify-center gap-2 hover:bg-[#E5C158]"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PHP / MySQL ZIP</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <BrandFooter />
      </div>

      {/* PROCESS REQUEST MODAL */}
      {processingReq && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-6 shadow-xl my-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <p className="text-xs font-mono text-slate-500">{processingReq.request_code}</p>
                <h3 className="text-lg font-bold text-slate-900">{processingReq.service_name}</h3>
              </div>
              <button type="button" onClick={() => setProcessingReq(null)} className="cursor-pointer text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <p className="font-bold text-slate-800">
                Customer: {processingReq.user_name} ({processingReq.user_phone})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.entries(processingReq.submitted_data || {}).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-slate-500 capitalize">{k.replace(/_/g, ' ')}:</span>
                    <p className="font-semibold text-slate-900">{String(v)}</p>
                  </div>
                ))}
              </div>
              {processingReq.documents.length > 0 && (
                <div className="pt-2 border-t border-slate-200">
                  <p className="font-semibold text-slate-700 mb-1.5">Customer Uploaded Documents:</p>
                  <div className="flex flex-wrap gap-2">
                    {processingReq.documents.map((d) => (
                      <a
                        key={d.id}
                        href={withAdminDownloadToken(`/api/files/request/${d.id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-slate-300 text-xs font-semibold text-[#0B162C] hover:border-[#0B162C]"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{d.original_filename} ({formatBytes(d.file_size)})</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleProcessRequest} className="space-y-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setProcessAction('complete')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 border cursor-pointer ${
                    processAction === 'complete'
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete & Approve</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProcessAction('reject')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 border cursor-pointer ${
                    processAction === 'reject'
                      ? 'bg-red-700 text-white border-red-700'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Request</span>
                </button>
              </div>

              {processAction === 'complete' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Upload Actual Completed Document (PDF, JPG, JPEG, PNG)
                    </label>
                    <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed border-slate-400 bg-slate-50 hover:border-[#0B162C] text-xs font-medium cursor-pointer">
                      <Upload className="w-4 h-4" />
                      <span>{completedFile ? completedFile.name : 'Select Completed Document'}</span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setCompletedFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Authorized Result Summary (Visible to User)
                    </label>
                    <textarea
                      rows={3}
                      value={resultSummary}
                      onChange={(e) => setResultSummary(e.target.value)}
                      placeholder="Enter authorized result details or document instructions..."
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Rejection Reason (Visible to User) *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Explain why the request could not be completed..."
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={refundCredits}
                      onChange={(e) => setRefundCredits(e.target.checked)}
                    />
                    <span>Refund {processingReq.credits_charged} credits back to user</span>
                  </label>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Internal Admin Notes (Hidden from User)
                </label>
                <input
                  type="text"
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Internal staff reference notes"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProcessingReq(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProcess}
                  className="px-5 py-2 rounded-lg bg-[#0B162C] text-white text-xs font-bold cursor-pointer"
                >
                  {submittingProcess ? 'Saving...' : processAction === 'complete' ? 'Approve & Deliver Result' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CREDITS MODAL */}
      {creditModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <form onSubmit={handleAddCredits} className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Credits to {creditModalUser.full_name}</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Credits to Add</label>
              <input
                type="number"
                min={0.5}
                step="0.5"
                required
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Reference</label>
              <input
                type="text"
                required
                value={creditReason}
                onChange={(e) => setCreditReason(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setCreditModalUser(null)} className="px-4 py-2 text-xs font-semibold text-slate-600 cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-[#D4AF37] text-[#0B162C] text-xs font-bold cursor-pointer">
                Add Credits
              </button>
            </div>
          </form>
        </div>
      )}

      {/* USER HISTORY MODAL */}
      {historyModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                History: {historyModalUser.user.full_name} ({historyModalUser.user.phone})
              </h3>
              <button type="button" onClick={() => setHistoryModalUser(null)} className="cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Service Requests</h4>
              {historyModalUser.requests.length === 0 ? (
                <p className="text-xs text-slate-500">No requests yet.</p>
              ) : (
                <div className="space-y-1.5 text-xs">
                  {historyModalUser.requests.map((r) => (
                    <div key={r.id} className="flex justify-between p-2 rounded bg-slate-50">
                      <span className="font-mono font-semibold">{r.request_code} · {r.service_name}</span>
                      <StatusBadge status={r.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Credit Transactions</h4>
              {historyModalUser.credits.length === 0 ? (
                <p className="text-xs text-slate-500">No credit transactions yet.</p>
              ) : (
                <div className="space-y-1.5 text-xs max-h-52 overflow-y-auto">
                  {historyModalUser.credits.map((c) => (
                    <div key={c.id} className="flex justify-between p-2 rounded bg-slate-50">
                      <span>{c.description}</span>
                      <span className="font-mono font-bold">{c.credits >= 0 ? `+${c.credits}` : c.credits}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SERVICE EDITOR MODAL */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSaveService} className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingService.id ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button type="button" onClick={() => setEditingService(null)} className="cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={editingService.category || 'DOCUMENT SERVICES'}
                  onChange={(e) => setEditingService({ ...editingService, category: e.target.value as ServiceCategory })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  <option value="NIDA SERVICES">NIDA SERVICES</option>
                  <option value="DOCUMENT SERVICES">DOCUMENT SERVICES</option>
                  <option value="TILL SERVICES">TILL SERVICES</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Credit Cost</label>
                <input
                  type="number"
                  min={0}
                  step="0.5"
                  required
                  value={editingService.credit_cost ?? 2}
                  onChange={(e) => setEditingService({ ...editingService, credit_cost: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  value={editingService.name || ''}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  value={editingService.description || ''}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Requirements Summary</label>
                <input
                  type="text"
                  value={editingService.requirements_summary || ''}
                  onChange={(e) => setEditingService({ ...editingService, requirements_summary: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(editingService.is_active)}
                  onChange={(e) => setEditingService({ ...editingService, is_active: e.target.checked ? 1 : 0 })}
                />
                <span>Service Active</span>
              </label>
            </div>

            <div className="border-t border-slate-200 pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Required Document & Input Fields</span>
                <button
                  type="button"
                  onClick={() =>
                    setEditingService({
                      ...editingService,
                      requirements: [
                        ...(editingService.requirements || []),
                        { field_label: 'New Field', field_name: `field_${Date.now()}`, field_type: 'text', is_required: 1, placeholder: '' },
                      ],
                    })
                  }
                  className="text-xs font-semibold text-[#0B162C] hover:underline cursor-pointer"
                >
                  + Add Field
                </button>
              </div>
              {(editingService.requirements || []).map((req: ServiceRequirement, idx: number) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded border border-slate-200">
                  <input
                    type="text"
                    value={req.field_label}
                    onChange={(e) => {
                      const next = [...(editingService.requirements || [])];
                      next[idx] = { ...req, field_label: e.target.value };
                      setEditingService({ ...editingService, requirements: next });
                    }}
                    placeholder="Field label"
                    className="col-span-5 px-2 py-1.5 text-xs border border-slate-300 rounded bg-white"
                  />
                  <select
                    value={req.field_type}
                    onChange={(e) => {
                      const next = [...(editingService.requirements || [])];
                      next[idx] = { ...req, field_type: e.target.value as any };
                      setEditingService({ ...editingService, requirements: next });
                    }}
                    className="col-span-3 px-2 py-1.5 text-xs border border-slate-300 rounded bg-white"
                  >
                    <option value="text">Text</option>
                    <option value="phone">Phone</option>
                    <option value="number">Number</option>
                    <option value="textarea">Textarea</option>
                    <option value="file">Document Upload</option>
                  </select>
                  <label className="col-span-3 flex items-center gap-1 text-[11px] font-medium">
                    <input
                      type="checkbox"
                      checked={Boolean(req.is_required)}
                      onChange={(e) => {
                        const next = [...(editingService.requirements || [])];
                        next[idx] = { ...req, is_required: e.target.checked ? 1 : 0 };
                        setEditingService({ ...editingService, requirements: next });
                      }}
                    />
                    Required
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const next = (editingService.requirements || []).filter((_, i) => i !== idx);
                      setEditingService({ ...editingService, requirements: next });
                    }}
                    className="col-span-1 text-red-600 hover:text-red-800 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditingService(null)} className="px-4 py-2 text-xs font-semibold cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 rounded-lg bg-[#0B162C] text-white text-xs font-bold cursor-pointer">
                Save Service
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
