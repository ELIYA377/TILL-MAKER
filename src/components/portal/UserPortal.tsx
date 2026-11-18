import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  FileCheck2,
  ClipboardList,
  CreditCard,
  History,
  Settings,
  LogOut,
  Bell,
  Plus,
  Download,
  RefreshCw,
  ChevronRight,
  Menu,
  X,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import {
  CreditTransaction,
  NotificationItem,
  PaymentRecord,
  PublicSettings,
  ServiceCategory,
  ServiceItem,
  ServiceRequestItem,
  UserAccount,
} from '../../types/app';
import { apiRequest, formatDateTime, formatTzs, formatBytes, withUserDownloadToken } from '../../lib/api';
import { BrandFooter } from './BrandFooter';
import { StatusBadge } from './StatusBadge';
import { RequestWizard } from './RequestWizard';
import { LanguageToggleButton, usePortalCopy } from '../../lib/i18n';
import { PWAInstallButton } from './PWAComponents';

type UserTab =
  | 'overview'
  | 'services'
  | 'requests'
  | 'completed'
  | 'buy-credits'
  | 'payments'
  | 'credits'
  | 'profile';

interface UserPortalProps {
  user: UserAccount;
  settings: PublicSettings;
  onUserUpdate: (u: UserAccount) => void;
  onLogout: () => void;
}

const CATEGORY_BANNERS: Record<ServiceCategory, string> = {
  'NIDA SERVICES': '/src/assets/images/category_nida_banner_1794977527720.jpg',
  'DOCUMENT SERVICES': '/src/assets/images/category_docs_banner_1794977528971.jpg',
  'TILL SERVICES': '/src/assets/images/category_till_banner_1794977529009.jpg',
};

export const UserPortal: React.FC<UserPortalProps> = ({
  user,
  settings,
  onUserUpdate,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<UserTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [requests, setRequests] = useState<ServiceRequestItem[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [creditHistory, setCreditHistory] = useState<CreditTransaction[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | ServiceCategory>('ALL');
  const [expandedRequestId, setExpandedRequestId] = useState<number | null>(null);
  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Buy Credits state (minimum TSh 1,000; 1 Credit = TSh 100)
  const { copy, language } = usePortalCopy();
  const [depositAmount, setDepositAmount] = useState<string>('1000');
  const [paymentPhone, setPaymentPhone] = useState<string>(user.phone);
  const [paying, setPaying] = useState(false);
  const [activeOrder, setActiveOrder] = useState<PaymentRecord | null>(null);
  const [checkingOrder, setCheckingOrder] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  const loadAllData = useCallback(async () => {
    try {
      const [meRes, svcRes, reqRes, payRes, credRes, notifRes] = await Promise.all([
        apiRequest<{ authenticated: boolean; user: UserAccount }>('/api/auth/me'),
        apiRequest<{ services: ServiceItem[] }>('/api/services'),
        apiRequest<{ requests: ServiceRequestItem[] }>('/api/requests'),
        apiRequest<{ payments: PaymentRecord[] }>('/api/payments/history'),
        apiRequest<{ transactions: CreditTransaction[] }>('/api/credits/history'),
        apiRequest<{ notifications: NotificationItem[] }>('/api/notifications'),
      ]);
      if (meRes.user) onUserUpdate(meRes.user);
      setServices(svcRes.services || []);
      setRequests(reqRes.requests || []);
      setPayments(payRes.payments || []);
      setCreditHistory(credRes.transactions || []);
      setNotifications(notifRes.notifications || []);
    } catch (err) {
      console.error('Error loading user dashboard data:', err);
    }
  }, [onUserUpdate]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const unreadCount = notifications.filter((n) => n.is_read === 0).length;

  const markNotificationsRead = async () => {
    try {
      await apiRequest('/api/notifications/read', { method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch {
      /* ignore */
    }
  };

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    setBannerMessage(null);
    setPaying(true);
    try {
      const res = await apiRequest<{
        success: boolean;
        orderId: string;
        amountTzs: number;
        expectedCredits: number;
        message: string;
      }>('/api/payments/initiate', {
        method: 'POST',
        body: JSON.stringify({
          amount: Number(depositAmount),
          phone: paymentPhone,
        }),
      });
      setBannerMessage({ type: 'success', text: res.message });
      await loadAllData();
      setActiveOrder({
        id: 0,
        order_id: res.orderId,
        user_id: user.id,
        amount_tzs: res.amountTzs,
        expected_credits: res.expectedCredits,
        payment_phone: paymentPhone,
        description: 'DIGITAL SALES CREDIT PURCHASE',
        status: 'Pending',
        dsn_reference: '',
        credited: 0,
        verified_at: null,
        created_at: new Date().toISOString(),
      });
    } catch (err: any) {
      setBannerMessage({ type: 'error', text: err.message || 'Payment initiation failed.' });
    } finally {
      setPaying(false);
    }
  };

  const handleCheckPaymentStatus = useCallback(async (orderId: string, silent = false) => {
    if (!silent) {
      setCheckingOrder(true);
      setBannerMessage(null);
    }
    try {
      const res = await apiRequest<{
        success: boolean;
        payment: PaymentRecord;
        creditBalance?: number;
        message: string;
      }>(`/api/payments/status/${encodeURIComponent(orderId)}`);
      setActiveOrder(res.payment);
      if (res.payment.status !== 'Pending' || !silent) {
        setBannerMessage({
          type: res.payment.status === 'Failed' ? 'error' : 'success',
          text: res.message,
        });
      }
      if (res.payment.status !== 'Pending' || !silent) {
        await loadAllData();
      }
    } catch (err: any) {
      if (!silent) {
        setBannerMessage({ type: 'error', text: err.message || 'Could not verify payment status.' });
      }
    } finally {
      if (!silent) {
        setCheckingOrder(false);
      }
    }
  }, [loadAllData]);

  // Automatically poll DSN status every 4 seconds while an active payment is Pending
  useEffect(() => {
    if (!activeOrder || activeOrder.status !== 'Pending') return;
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      if (attempts > 30) {
        window.clearInterval(timer);
        return;
      }
      handleCheckPaymentStatus(activeOrder.order_id, true);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [activeOrder, handleCheckPaymentStatus]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setBannerMessage(null);
    if (newPassword !== confirmPassword) {
      setBannerMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setPwSaving(true);
    try {
      const res = await apiRequest<{ message: string }>('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setBannerMessage({ type: 'success', text: res.message });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setBannerMessage({ type: 'error', text: err.message || 'Failed to change password.' });
    } finally {
      setPwSaving(false);
    }
  };

  const expectedCredits = Math.max(
    0,
    Number(((Number(depositAmount) || 0) / Math.max(1, settings.creditRateTzs)).toFixed(2))
  );

  const navItems: Array<{ id: UserTab; label: string; icon: React.ComponentType<any> }> = [
    { id: 'overview', label: copy.navDashboard, icon: LayoutDashboard },
    { id: 'services', label: copy.navNewRequest, icon: Briefcase },
    { id: 'requests', label: copy.navMyRequests, icon: ClipboardList },
    { id: 'completed', label: copy.navCompleted, icon: FileCheck2 },
    { id: 'buy-credits', label: copy.navBuyCredits, icon: CreditCard },
    { id: 'payments', label: copy.navPaymentHistory, icon: History },
    { id: 'credits', label: copy.navCreditHistory, icon: History },
    { id: 'profile', label: copy.navProfile, icon: Settings },
  ];

  const completedRequests = requests.filter((r) => r.status === 'Completed');
  const filteredServices =
    categoryFilter === 'ALL' ? services : services.filter((s) => s.category === categoryFilter);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-[#0B162C] text-white shrink-0 border-r border-slate-800">
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <img
            src="/src/assets/images/brand_emblem_gold_1794977527028.jpg"
            alt="Digital Sales Pro Max"
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-lg object-cover border border-[#D4AF37]/40 shrink-0"
          />
          <span className="font-bold text-sm tracking-tight text-white leading-tight">
            DIGITAL SALES PRO MAX
          </span>
        </div>

        <div className="p-4 border-b border-slate-800 bg-[#10203F]">
          <p className="text-[11px] text-slate-300 font-medium">{copy.availableCredits}</p>
          <p className="text-2xl font-mono font-bold text-[#D4AF37] tabular-nums mt-0.5">
            {user.credit_balance}
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedService(null);
              setActiveTab('buy-credits');
            }}
            className="mt-3 w-full py-2 px-3 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B162C] text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{copy.buyCreditsBtn}</span>
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedService(null);
                  setActiveTab(item.id);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  active
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

        <div className="p-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-red-300 hover:bg-red-950/50 hover:text-red-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>{copy.logoutBtn}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 truncate">{copy.welcomeBack}</p>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {user.full_name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <LanguageToggleButton variant="light" />
            <div className="hidden sm:inline-flex">
              <PWAInstallButton variant="light" compact />
            </div>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
              <span className="text-xs text-slate-600">Credits:</span>
              <span className="text-xs font-mono font-bold text-[#0B162C] tabular-nums">
                {user.credit_balance}
              </span>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  if (!notifOpen && unreadCount > 0) markNotificationsRead();
                }}
                aria-label={copy.notifications}
                className="relative p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#D4AF37] text-[#0B162C] text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-lg z-40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <span className="text-xs font-bold text-slate-800">{copy.notifications}</span>
                    <button
                      type="button"
                      onClick={() => setNotifOpen(false)}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-xs text-slate-500 text-center">{copy.noNotifications}</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="p-3.5 hover:bg-slate-50">
                          <p className="text-xs font-bold text-slate-900">{n.title}</p>
                          <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                          <p className="text-[11px] text-slate-400 font-mono mt-1">
                            {formatDateTime(n.created_at)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedService(null);
                setActiveTab('services');
              }}
              className="px-3 sm:px-3.5 py-2 rounded-lg bg-[#0B162C] hover:bg-[#132547] text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
            >
              {copy.newRequestBtn}
            </button>
          </div>
        </header>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0B162C] text-white border-b border-slate-800 p-3 space-y-1">
            <div className="flex items-center justify-between px-3 py-2 mb-2 rounded-lg bg-[#10203F]">
              <span className="text-xs text-slate-300">{copy.availableCredits}</span>
              <span className="text-sm font-mono font-bold text-[#D4AF37] tabular-nums">
                {user.credit_balance} Credits
              </span>
            </div>
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
                    setSelectedService(null);
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
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-red-300 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{copy.logoutBtn}</span>
            </button>
          </div>
        )}

        {/* Viewport Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-6xl w-full mx-auto space-y-6 pb-20 lg:pb-8">
          {bannerMessage && (
            <div
              className={`p-4 rounded-xl border text-sm font-medium flex items-center justify-between gap-3 ${
                bannerMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              <span>{bannerMessage.text}</span>
              <button
                type="button"
                onClick={() => setBannerMessage(null)}
                className="text-current opacity-60 hover:opacity-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Hero Welcome Card */}
              <div className="bg-[#0B162C] text-white rounded-xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-1">
                    {copy.userDashboardLabel}
                  </p>
                  <h2 className="text-2xl font-bold text-white">{user.full_name}</h2>
                  <p className="text-xs text-slate-300 font-mono mt-1 tabular-nums">
                    {copy.accountPhone}: {user.phone}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="px-4 py-3 rounded-lg bg-[#10203F] border border-slate-700">
                    <p className="text-[11px] text-slate-300">{copy.availableCredits}</p>
                    <p className="text-2xl font-mono font-bold text-[#D4AF37] tabular-nums">
                      {user.credit_balance}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('buy-credits')}
                    className="px-5 py-3 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B162C] text-xs font-bold transition-colors cursor-pointer"
                  >
                    {copy.buyCreditsBtn}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('services')}
                    className="px-5 py-3 rounded-lg bg-white hover:bg-slate-100 text-[#0B162C] text-xs font-bold transition-colors cursor-pointer"
                  >
                    {copy.newRequestBtn}
                  </button>
                </div>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <p className="text-xs text-slate-500">{copy.kpiTotalRequests}</p>
                  <p className="text-2xl font-mono font-bold text-slate-900 tabular-nums mt-1">
                    {requests.length}
                  </p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <p className="text-xs text-slate-500">{copy.kpiSubmitted}</p>
                  <p className="text-2xl font-mono font-bold text-amber-700 tabular-nums mt-1">
                    {requests.filter((r) => r.status === 'Submitted').length}
                  </p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <p className="text-xs text-slate-500">{copy.kpiCompleted}</p>
                  <p className="text-2xl font-mono font-bold text-emerald-700 tabular-nums mt-1">
                    {completedRequests.length}
                  </p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <p className="text-xs text-slate-500">{copy.kpiServices}</p>
                  <p className="text-2xl font-mono font-bold text-[#0B162C] tabular-nums mt-1">
                    {services.length}
                  </p>
                </div>
              </div>

              {/* Service Categories Showcase */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-slate-900">{copy.serviceCategories}</h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('services')}
                    className="text-xs font-semibold text-[#0B162C] hover:underline cursor-pointer"
                  >
                    {copy.viewAllServices}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['NIDA SERVICES', 'DOCUMENT SERVICES', 'TILL SERVICES'] as ServiceCategory[]).map(
                    (cat) => {
                      const count = services.filter((s) => s.category === cat).length;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setCategoryFilter(cat);
                            setActiveTab('services');
                          }}
                          className="text-left bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-[#0B162C] transition-colors cursor-pointer group"
                        >
                          <img
                            src={CATEGORY_BANNERS[cat]}
                            alt={cat}
                            referrerPolicy="no-referrer"
                            className="w-full h-32 object-cover"
                          />
                          <div className="p-4 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-bold text-slate-900">{cat}</p>
                              <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                                {count} {copy.servicesCountTag}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0B162C]" />
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Recent Requests Table */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">{copy.recentRequests}</h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('requests')}
                    className="text-xs font-semibold text-[#0B162C] hover:underline cursor-pointer"
                  >
                    {copy.allRequests}
                  </button>
                </div>
                {requests.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-sm text-slate-600 mb-3">{copy.noRequestsYet}</p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('services')}
                      className="px-4 py-2 rounded-lg bg-[#0B162C] text-white text-xs font-semibold cursor-pointer"
                    >
                      {copy.startFirstRequest}
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                          <th className="py-3 px-4">{copy.colRequestId}</th>
                          <th className="py-3 px-4">{copy.colService}</th>
                          <th className="py-3 px-4">{copy.colDate}</th>
                          <th className="py-3 px-4 text-right">{copy.colCredits}</th>
                          <th className="py-3 px-4">{copy.colStatus}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {requests.slice(0, 5).map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-mono font-semibold text-slate-900">{r.request_code}</td>
                            <td className="py-3 px-4 font-medium text-slate-800">{r.service_name}</td>
                            <td className="py-3 px-4 text-slate-500 font-mono">{formatDateTime(r.created_at)}</td>
                            <td className="py-3 px-4 text-right font-mono tabular-nums">{r.credits_charged}</td>
                            <td className="py-3 px-4"><StatusBadge status={r.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SERVICES & NEW REQUEST TAB */}
          {activeTab === 'services' && (
            selectedService ? (
              <RequestWizard
                service={selectedService}
                user={user}
                onCancel={() => setSelectedService(null)}
                onBuyCredits={() => {
                  setSelectedService(null);
                  setActiveTab('buy-credits');
                }}
                onSubmitted={async (newBal, requestCode) => {
                  onUserUpdate({ ...user, credit_balance: newBal });
                  setSelectedService(null);
                  setBannerMessage({
                    type: 'success',
                    text: `Request ${requestCode} submitted successfully! Our team will process and upload your completed document.`,
                  });
                  await loadAllData();
                  setActiveTab('requests');
                }}
              />
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{copy.availableServicesTitle}</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {copy.availableServicesDesc}
                    </p>
                  </div>

                  {/* Category Segmented Filter */}
                  <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
                    {(['ALL', 'NIDA SERVICES', 'DOCUMENT SERVICES', 'TILL SERVICES'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                          categoryFilter === cat
                            ? 'bg-[#0B162C] text-white'
                            : 'text-slate-700 hover:text-slate-900'
                        }`}
                      >
                        {cat === 'ALL' ? copy.allServicesFilter : cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredServices.map((svc) => (
                    <div
                      key={svc.id}
                      className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:border-[#0B162C] transition-colors"
                    >
                      <div>
                        <p className="text-[11px] font-semibold text-slate-500 mb-1">
                          {svc.category} · <span className="font-mono text-[#0B162C] tabular-nums">{svc.credit_cost} Credits</span>
                        </p>
                        <h3 className="text-base font-bold text-slate-900 mb-2">{svc.name}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed mb-4">{svc.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedService(svc)}
                        className="w-full py-2.5 px-4 rounded-lg bg-[#0B162C] hover:bg-[#132547] text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <span>{copy.startRequestBtn}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {/* MY REQUESTS & COMPLETED REQUESTS TABS */}
          {(activeTab === 'requests' || activeTab === 'completed') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {activeTab === 'completed' ? copy.completedRequestsTitle : copy.myRequestsTitle}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {copy.requestsDesc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadAllData}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{copy.refreshBtn}</span>
                </button>
              </div>

              {(activeTab === 'completed' ? completedRequests : requests).length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
                  <p className="text-sm text-slate-600 mb-4">
                    {activeTab === 'completed' ? copy.noCompletedYet : copy.noRequestsYet}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('services')}
                    className="px-4 py-2.5 rounded-lg bg-[#0B162C] text-white text-xs font-semibold cursor-pointer"
                  >
                    {copy.browseServicesBtn}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {(activeTab === 'completed' ? completedRequests : requests).map((req) => {
                    const isOpen = expandedRequestId === req.id;
                    return (
                      <div key={req.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1">
                              <span className="font-mono font-bold text-[#0B162C]">{req.request_code}</span>
                              <span>·</span>
                              <span>{req.service_category}</span>
                              <span>·</span>
                              <span className="font-mono">{formatDateTime(req.created_at)}</span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-900">{req.service_name}</h3>
                          </div>

                          <div className="flex items-center gap-4">
                            <StatusBadge status={req.status} />
                            <button
                              type="button"
                              onClick={() => setExpandedRequestId(isOpen ? null : req.id)}
                              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                            >
                              {isOpen ? copy.hideDetails : copy.viewDetails}
                            </button>
                          </div>
                        </div>

                        {isOpen && (
                          <div className="px-4 sm:px-5 pb-5 pt-3 border-t border-slate-100 bg-slate-50 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              {Object.entries(req.submitted_data || {}).map(([k, v]) => (
                                <div key={k}>
                                  <span className="text-slate-500 capitalize">{k.replace(/_/g, ' ')}:</span>
                                  <p className="font-semibold text-slate-800 mt-0.5">{String(v)}</p>
                                </div>
                              ))}
                            </div>

                            {req.documents.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-slate-700 mb-1.5">{copy.yourSubmittedDocs}</p>
                                <div className="flex flex-wrap gap-2">
                                  {req.documents.map((doc) => (
                                    <a
                                      key={doc.id}
                                      href={withUserDownloadToken(`/api/files/request/${doc.id}`)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-medium text-slate-700 hover:border-[#0B162C]"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                      <span>{doc.original_filename}</span>
                                      <span className="text-slate-400 font-mono">({formatBytes(doc.file_size)})</span>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {req.status === 'Rejected' && req.rejection_reason && (
                              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
                                <p className="font-bold">{copy.rejectionReason}</p>
                                <p className="mt-0.5">{req.rejection_reason}</p>
                              </div>
                            )}

                            {req.status === 'Completed' && (
                              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 space-y-2">
                                <p className="text-xs font-bold text-emerald-900">{copy.authorizedResult}</p>
                                {req.result_summary && (
                                  <p className="text-xs text-emerald-800">{req.result_summary}</p>
                                )}
                                {req.completed_documents.length > 0 && (
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    {req.completed_documents.map((cd) => (
                                      <a
                                        key={cd.id}
                                        href={withUserDownloadToken(`/api/files/completed/${cd.id}`)}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0B162C] text-white text-xs font-semibold hover:bg-[#132547]"
                                      >
                                        <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                                        <span>{copy.downloadBtn} {cd.original_filename}</span>
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* BUY CREDITS PAGE (DSN TECHNOLOGY) */}
          {activeTab === 'buy-credits' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-xl font-bold text-slate-900">{copy.buyCreditsTitle}</h2>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded border ${
                        settings.paymentGatewayReady
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}
                    >
                      {settings.paymentGatewayReady ? copy.dsnActiveBadge : copy.dsnNotReadyBadge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {copy.buyCreditsSubtitle}
                  </p>
                </div>

                {settings.paymentGatewayReady === false && (
                  <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                    <p className="font-bold">DSN Gateway Configuration Notice</p>
                    <p className="mt-1">
                      Live mobile money prompts require <code className="font-mono font-bold">DSN_API_KEY</code> to be added to the server environment Secrets. Once set, clicking PAY NOW will send an instant PIN prompt to the entered phone.
                    </p>
                  </div>
                )}

                <form onSubmit={handlePayNow} className="space-y-4">
                  <div>
                    <p className="block text-xs font-semibold text-slate-700 mb-2">
                      {copy.selectPackageLabel}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {[1000, 2000, 5000, 10000, 20000, 50000].map((preset) => {
                        const pkgCredits = Math.floor(preset / Math.max(1, settings.creditRateTzs));
                        const isSelected = Number(depositAmount) === preset;
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setDepositAmount(String(preset))}
                            className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#0B162C] border-[#D4AF37] text-white'
                                : 'bg-slate-50 border-slate-200 hover:border-[#0B162C] text-slate-900'
                            }`}
                          >
                            <p className={`text-sm font-mono font-bold tabular-nums ${isSelected ? 'text-[#D4AF37]' : 'text-[#0B162C]'}`}>
                              TSh {preset.toLocaleString()}
                            </p>
                            <p className={`text-[11px] font-semibold mt-0.5 tabular-nums ${isSelected ? 'text-slate-200' : 'text-slate-600'}`}>
                              {pkgCredits} Credits
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="deposit-amount">
                      {copy.depositAmountLabel}
                    </label>
                    <input
                      id="deposit-amount"
                      type="number"
                      min={1000}
                      step={100}
                      required
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0B162C]"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">{copy.minDepositHint}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="pay-phone">
                      {copy.payPhoneLabel}
                    </label>
                    <input
                      id="pay-phone"
                      type="tel"
                      required
                      value={paymentPhone}
                      onChange={(e) => setPaymentPhone(e.target.value)}
                      placeholder="07XXXXXXXX / 06XXXXXXXX"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0B162C]"
                    />
                  </div>

                  <div className="p-4 rounded-lg bg-[#0B162C] text-white flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-300">{copy.expectedCreditsLabel}</p>
                      <p className="text-[11px] text-slate-400">
                        {copy.rateLabel}: TSh {settings.creditRateTzs.toLocaleString()} / 1 Credit
                      </p>
                    </div>
                    <p className="text-2xl font-mono font-bold text-[#D4AF37] tabular-nums">
                      {expectedCredits} Credits
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={paying}
                    className="w-full py-3 px-4 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B162C] text-sm font-bold tracking-wide transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {paying ? copy.sendingPrompt : copy.payNowBtn}
                  </button>
                </form>

                {activeOrder && (
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500">{copy.activeOrderLabel}</p>
                        <p className="text-sm font-mono font-bold text-slate-900">{activeOrder.order_id}</p>
                      </div>
                      <StatusBadge status={activeOrder.status} />
                    </div>
                    <div className="text-xs text-slate-600 flex items-center justify-between">
                      <span><span className="font-mono font-semibold">{formatTzs(activeOrder.amount_tzs)}</span></span>
                      <span>Credits: <span className="font-mono font-semibold">{activeOrder.expected_credits}</span></span>
                    </div>
                    {activeOrder.status === 'Pending' && (
                      <div className="space-y-2">
                        <p className="text-[11px] text-slate-600">
                          {copy.autoPollHint.replace('{phone}', activeOrder.payment_phone)}
                        </p>
                        <button
                          type="button"
                          disabled={checkingOrder}
                          onClick={() => handleCheckPaymentStatus(activeOrder.order_id)}
                          className="w-full py-2 px-3 rounded-lg bg-[#0B162C] text-white text-xs font-semibold hover:bg-[#132547] inline-flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${checkingOrder ? 'animate-spin' : ''}`} />
                          <span>{checkingOrder ? copy.verifyingDsn : copy.verifyNowBtn}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900">{copy.recentPaymentsTitle}</h3>
                {payments.length === 0 ? (
                  <p className="text-xs text-slate-500">{copy.noPaymentsYet}</p>
                ) : (
                  <div className="space-y-3">
                    {payments.slice(0, 6).map((p) => (
                      <div key={p.id} className="p-3 rounded-lg border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-slate-900">{p.order_id}</span>
                          <StatusBadge status={p.status} />
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-600">
                          <span className="font-mono tabular-nums">{formatTzs(p.amount_tzs)}</span>
                          <span className="font-mono tabular-nums">+{p.expected_credits} credits</span>
                        </div>
                        {p.status === 'Pending' && (
                          <button
                            type="button"
                            onClick={() => handleCheckPaymentStatus(p.order_id)}
                            className="w-full py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-[#0B162C] cursor-pointer"
                          >
                            {copy.checkStatusBtn}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PAYMENT HISTORY TAB */}
          {activeTab === 'payments' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">{copy.paymentHistoryTitle}</h2>
                <button
                  type="button"
                  onClick={loadAllData}
                  className="text-xs font-semibold text-[#0B162C] hover:underline cursor-pointer"
                >
                  {copy.refreshBtn}
                </button>
              </div>
              {payments.length === 0 ? (
                <p className="p-8 text-center text-sm text-slate-500">{copy.noPaymentsYet}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                        <th className="py-3 px-4">Order ID</th>
                        <th className="py-3 px-4">{copy.phoneLabel}</th>
                        <th className="py-3 px-4 text-right">TSh</th>
                        <th className="py-3 px-4 text-right">{copy.colCredits}</th>
                        <th className="py-3 px-4">Ref</th>
                        <th className="py-3 px-4">{copy.colStatus}</th>
                        <th className="py-3 px-4">-</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {payments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono font-semibold text-slate-900">{p.order_id}</td>
                          <td className="py-3 px-4 font-mono">{p.payment_phone}</td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums">{formatTzs(p.amount_tzs)}</td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums">{p.expected_credits}</td>
                          <td className="py-3 px-4 font-mono text-slate-600">{p.dsn_reference || '—'}</td>
                          <td className="py-3 px-4"><StatusBadge status={p.status} /></td>
                          <td className="py-3 px-4">
                            {p.status === 'Pending' ? (
                              <button
                                type="button"
                                onClick={() => handleCheckPaymentStatus(p.order_id)}
                                className="text-xs font-semibold text-[#0B162C] hover:underline cursor-pointer"
                              >
                                {copy.verifyNowBtn}
                              </button>
                            ) : (
                              <span className="text-slate-400 font-mono">{formatDateTime(p.created_at)}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* CREDIT HISTORY TAB */}
          {activeTab === 'credits' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">{copy.creditHistoryTitle}</h2>
                <span className="text-xs font-mono font-bold text-[#0B162C] tabular-nums">
                  {copy.currentBalanceLabel}: {user.credit_balance} Credits
                </span>
              </div>
              {creditHistory.length === 0 ? (
                <p className="p-8 text-center text-sm text-slate-500">
                  {language === 'sw' ? 'Bado hakuna miamala ya credits iliyorekodiwa.' : 'No credit transactions recorded yet.'}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                        <th className="py-3 px-4">{copy.colDate}</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Ref</th>
                        <th className="py-3 px-4">-</th>
                        <th className="py-3 px-4 text-right">{copy.colCredits}</th>
                        <th className="py-3 px-4 text-right">{copy.currentBalanceLabel}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {creditHistory.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono text-slate-500">{formatDateTime(tx.created_at)}</td>
                          <td className="py-3 px-4 font-semibold capitalize text-slate-800">{tx.type.replace('_', ' ')}</td>
                          <td className="py-3 px-4 font-mono text-slate-700">{tx.reference_code}</td>
                          <td className="py-3 px-4 text-slate-600">{tx.description}</td>
                          <td
                            className={`py-3 px-4 text-right font-mono font-bold tabular-nums ${
                              tx.credits >= 0 ? 'text-emerald-700' : 'text-red-700'
                            }`}
                          >
                            {tx.credits >= 0 ? `+${tx.credits}` : tx.credits}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                            {tx.balance_after}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* PROFILE SETTINGS TAB */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <h2 className="text-base font-bold text-slate-900">{copy.accountInfoTitle}</h2>
                <div className="space-y-3 text-sm">
                  <div className="py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-500">{copy.fullNameLabel}</p>
                    <p className="font-semibold text-slate-900">{user.full_name}</p>
                  </div>
                  <div className="py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-500">{copy.regPhoneLabel}</p>
                    <p className="font-mono font-semibold text-slate-900">{user.phone}</p>
                  </div>
                  <div className="py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-500">{copy.availableCredits}</p>
                    <p className="font-mono font-bold text-[#0B162C] tabular-nums">{user.credit_balance} Credits</p>
                  </div>
                  <div className="py-2">
                    <p className="text-xs text-slate-500">{copy.memberSinceLabel}</p>
                    <p className="font-mono text-slate-700">{formatDateTime(user.created_at)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full py-2.5 px-4 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{copy.logoutAccountBtn}</span>
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#0B162C]" />
                  <span>{copy.changePasswordTitle}</span>
                </h2>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">{copy.currentPasswordLabel}</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B162C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">{copy.newPasswordLabel}</label>
                    <input
                      type="password"
                      required
                      minLength={4}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B162C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">{copy.confirmPasswordLabel}</label>
                    <input
                      type="password"
                      required
                      minLength={4}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B162C]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={pwSaving}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#0B162C] hover:bg-[#132547] text-white text-xs font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{pwSaving ? copy.updatingPassword : copy.updatePasswordBtn}</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>

        {/* Mobile Bottom Quick Navigation (<= 15% viewport height) */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-[#0B162C] text-white border-t border-slate-800 grid grid-cols-4 z-30">
          {[
            { id: 'overview' as UserTab, label: copy.mobileHome, icon: LayoutDashboard },
            { id: 'services' as UserTab, label: copy.mobileRequest, icon: Briefcase },
            { id: 'buy-credits' as UserTab, label: copy.mobileCredits, icon: CreditCard },
            { id: 'requests' as UserTab, label: copy.mobileOrders, icon: ClipboardList },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedService(null);
                  setActiveTab(item.id);
                }}
                className={`py-2.5 flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold cursor-pointer ${
                  active ? 'text-[#D4AF37]' : 'text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <BrandFooter />
      </div>
    </div>
  );
};
