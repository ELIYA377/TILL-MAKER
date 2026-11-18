import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, ShieldCheck, Phone, Lock, User, HelpCircle, X } from 'lucide-react';
import { apiRequest, setUserToken } from '../../lib/api';
import { PublicSettings, UserAccount } from '../../types/app';
import { BrandFooter } from './BrandFooter';
import { LanguageToggleButton, usePortalCopy } from '../../lib/i18n';
import { PWAInstallButton } from './PWAComponents';

interface UserAuthViewProps {
  settings: PublicSettings;
  onSuccess: (user: UserAccount) => void;
  onNavigateAdmin: () => void;
}

export const UserAuthView: React.FC<UserAuthViewProps> = ({
  settings,
  onSuccess,
  onNavigateAdmin,
}) => {
  const { copy } = usePortalCopy();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiRequest<{ success: boolean; user: UserAccount; token?: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone: phone.trim(), password }),
      });
      if (res.token) setUserToken(res.token);
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiRequest<{ success: boolean; user: UserAccount; token?: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ fullName: fullName.trim(), phone: phone.trim(), password }),
      });
      if (res.token) setUserToken(res.token);
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg('');
    setForgotLoading(true);
    try {
      const res = await apiRequest<{ message: string }>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ phone: forgotPhone }),
      });
      setForgotMsg(res.message);
    } catch (err: any) {
      setForgotMsg(err.message || 'Unable to process reset request.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Bar */}
      <header className="w-full bg-[#0B162C] text-white border-b border-slate-800 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="/src/assets/images/brand_emblem_gold_1794977527028.jpg"
            alt="Digital Sales Pro Max Emblem"
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-lg object-cover border border-[#D4AF37]/40 shrink-0"
          />
          <span className="font-bold tracking-tight text-sm sm:text-lg text-white whitespace-nowrap truncate">
            DIGITAL SALES PRO MAX
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap">
          <LanguageToggleButton variant="dark" />
          <PWAInstallButton variant="dark" compact />
          <button
            type="button"
            onClick={() => {
              setError('');
              setMode(mode === 'login' ? 'register' : 'login');
            }}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#D4AF37] text-[#0B162C] hover:bg-[#E5C158] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {mode === 'login' ? copy.registerHereTop : copy.signInBtnTop}
          </button>
          <button
            type="button"
            onClick={onNavigateAdmin}
            className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {copy.adminPortalBtn}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch shadow-sm">
          {/* Left Navy Showcase Column */}
          <div className="lg:col-span-5 bg-[#0B162C] text-white p-7 sm:p-9 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wider text-[#D4AF37] uppercase mb-3">
                {copy.appTagline}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug mb-4 [text-wrap:balance]">
                {copy.authHeroTitle}
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                {copy.authHeroDesc}
              </p>

              <div className="rounded-lg overflow-hidden border border-slate-700/80 mb-6 bg-[#10203F]">
                <img
                  src="/src/assets/images/auth_hero_navy_1794977527633.jpg"
                  alt="Digital Sales Pro Max Portfolio"
                  referrerPolicy="no-referrer"
                  className="w-full h-44 object-cover"
                />
              </div>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-slate-800 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span>{copy.stdServiceFee}</span>
                <span className="font-mono font-semibold text-[#D4AF37] tabular-nums">
                  {settings.defaultRequestCost} {copy.creditsPerReq}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>{copy.creditConversionRate}</span>
                <span className="font-mono font-semibold text-white tabular-nums">
                  TSh {settings.creditRateTzs.toLocaleString()} = 1 Credit
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>{copy.supportHelpline}</span>
                <span className="font-mono text-slate-200 tabular-nums">{settings.supportPhone}</span>
              </div>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">
            {/* Segmented Mode Switcher */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg mb-7 max-w-xs">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setMode('login');
                }}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  mode === 'login'
                    ? 'bg-[#0B162C] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {copy.accountLogin}
              </button>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setMode('register');
                }}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  mode === 'register'
                    ? 'bg-[#0B162C] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {copy.createAccount}
              </button>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm font-medium"
              >
                {error}
              </div>
            )}

            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{copy.signInTitle}</h2>
                  <p className="text-sm text-slate-500 mt-1">{copy.signInSubtitle}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="login-phone">
                    {copy.phoneLabel}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="07XXXXXXXX or 06XXXXXXXX"
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B162C] font-mono tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700" htmlFor="login-password">
                      {copy.passwordLabel}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotMsg('');
                        setForgotPhone(phone);
                        setForgotOpen(true);
                      }}
                      className="text-xs font-semibold text-[#0B162C] hover:underline cursor-pointer"
                    >
                      {copy.forgotPassword}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={copy.enterPasswordPlaceholder}
                      className="w-full pl-10 pr-11 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B162C]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-lg bg-[#0B162C] hover:bg-[#132547] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  <span>{loading ? copy.signingIn : copy.loginBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-xs text-slate-600">{copy.newToApp}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setMode('register');
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B162C] text-xs font-bold tracking-wide transition-colors cursor-pointer"
                  >
                    {copy.registerHereBtn}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{copy.createAccountTitle}</h2>
                  <p className="text-sm text-slate-500 mt-1">{copy.createAccountSubtitle}</p>
                </div>

                {/* STRICTLY ONLY 3 REGISTRATION FIELDS */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="reg-fullname">
                    {copy.regField1}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-fullname"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={copy.regField1Placeholder}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B162C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="reg-phone">
                    {copy.regField2}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="07XXXXXXXX or 06XXXXXXXX"
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B162C] font-mono tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="reg-password">
                    {copy.regField3}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      minLength={4}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={copy.regField3Placeholder}
                      className="w-full pl-10 pr-11 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B162C]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B162C] font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  <span>{loading ? copy.creatingAccount : copy.createAccountBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                  <span>{copy.alreadyRegistered}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setMode('login');
                    }}
                    className="font-semibold text-[#0B162C] hover:underline cursor-pointer"
                  >
                    {copy.backToLogin}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-[#0B162C] shrink-0" />
              <span>{copy.authorizedNotice}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#0B162C]" />
                <h3 className="font-bold text-slate-900">{copy.passwordRecoveryTitle}</h3>
              </div>
              <button
                type="button"
                onClick={() => setForgotOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">{copy.passwordRecoveryDesc}</p>
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <input
                type="tel"
                required
                value={forgotPhone}
                onChange={(e) => setForgotPhone(e.target.value)}
                placeholder={copy.regPhonePlaceholder}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#0B162C]"
              />
              {forgotMsg && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  {forgotMsg}
                </div>
              )}
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setForgotOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  {copy.close}
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="px-4 py-2 rounded-lg bg-[#0B162C] text-white text-xs font-semibold hover:bg-[#132547] cursor-pointer"
                >
                  {forgotLoading ? copy.submitting : copy.requestReset}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BrandFooter />
    </div>
  );
};
