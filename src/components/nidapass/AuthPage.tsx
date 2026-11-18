import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  CreditCard, 
  Mail, 
  Phone, 
  User as UserIcon, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Check, 
  KeyRound,
  FileCheck2,
  Building,
  Info
} from 'lucide-react';
import { SystemStore } from '../../services/systemStore';
import { SystemUser } from '../../types';
import sealImage from '../../assets/images/coat_of_arms_seal_1790750477491.jpg';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
  onLoginSuccess: (user: SystemUser) => void;
  onBackToHome: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  onLoginSuccess,
  onBackToHome,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialMode);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regNin, setRegNin] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regAgreeTerms, setRegAgreeTerms] = useState(false);

  // Interaction & validation state
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Synchronize initial mode if prop changes
  useEffect(() => {
    setActiveTab(initialMode);
    setFeedback(null);
  }, [initialMode]);

  // Validation helpers for Login Identifier
  const getIdentifierType = (val: string): 'nin' | 'email' | 'phone' | 'unknown' => {
    const trimmed = val.trim();
    if (!trimmed) return 'unknown';
    if (trimmed.includes('@')) return 'email';
    const digitsOnly = trimmed.replace(/\D/g, '');
    if (digitsOnly.length >= 16 || (trimmed.includes('-') && digitsOnly.length >= 12)) return 'nin';
    if (digitsOnly.length === 10 && (digitsOnly.startsWith('06') || digitsOnly.startsWith('07'))) return 'phone';
    return 'unknown';
  };

  const identifierType = getIdentifierType(loginIdentifier);

  const isIdentifierValid = (): boolean => {
    if (!loginIdentifier.trim()) return false;
    if (identifierType === 'email') {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginIdentifier.trim());
    }
    if (identifierType === 'nin') {
      const cleanDigits = loginIdentifier.replace(/\D/g, '');
      return cleanDigits.length === 20 || cleanDigits.length >= 16;
    }
    if (identifierType === 'phone') {
      const clean = loginIdentifier.replace(/\D/g, '');
      return clean.length === 10 && (clean.startsWith('06') || clean.startsWith('07'));
    }
    // Also allow raw matching
    return loginIdentifier.trim().length >= 4;
  };

  // Password strength calculation for Registration
  const getPasswordStrength = (pass: string): { label: string; score: number; color: string } => {
    if (!pass) return { label: 'None', score: 0, color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { label: 'Weak', score: 25, color: 'bg-red-500' };
    if (score <= 3) return { label: 'Fair', score: 50, color: 'bg-amber-500' };
    if (score <= 4) return { label: 'Good', score: 75, color: 'bg-blue-600' };
    return { label: 'Strong', score: 100, color: 'bg-emerald-600' };
  };

  const passwordStrength = getPasswordStrength(regPassword);

  // 1-Click Test Demo Credentials helper
  const handleFastLogin = (identifier: string, pass: string) => {
    setLoginIdentifier(identifier);
    setLoginPassword(pass);
    setIsLoading(true);
    setFeedback(null);

    setTimeout(() => {
      const result = SystemStore.login(identifier, pass);
      setIsLoading(false);
      if (result.success && result.user) {
        setFeedback({
          type: 'success',
          message: `Authenticated as ${result.user.fullName || result.user.phone}. Entering secure dashboard...`,
        });
        setTimeout(() => {
          onLoginSuccess(result.user!);
        }, 500);
      } else {
        setFeedback({
          type: 'error',
          message: result.message || 'Authentication failed. Please verify credentials.',
        });
      }
    }, 450);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (activeTab === 'login') {
      if (!isIdentifierValid()) {
        setFeedback({
          type: 'error',
          message: 'Please provide a valid National ID Number (NIN), email address, or 10-digit mobile number.',
        });
        return;
      }

      if (!loginPassword) {
        setFeedback({
          type: 'error',
          message: 'Please enter your password.',
        });
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        const result = SystemStore.login(loginIdentifier, loginPassword);
        setIsLoading(false);

        if (result.success && result.user) {
          setFeedback({
            type: 'success',
            message: `Identity verified successfully! Directing to NIDA Pass Portal...`,
          });
          setTimeout(() => {
            onLoginSuccess(result.user!);
          }, 600);
        } else {
          setFeedback({
            type: 'error',
            message: result.message || 'Authentication error. Please check your credentials.',
          });
        }
      }, 550);
    } else {
      // Register Flow
      const cleanPhone = regPhone.replace(/\D/g, '');
      if (cleanPhone.length !== 10 || (!cleanPhone.startsWith('06') && !cleanPhone.startsWith('07'))) {
        setFeedback({
          type: 'error',
          message: 'Mobile number must be 10 digits starting with 07 or 06.',
        });
        return;
      }

      if (!regFullName.trim()) {
        setFeedback({
          type: 'error',
          message: 'Please enter your full legal citizen name.',
        });
        return;
      }

      if (regPassword.length < 4) {
        setFeedback({
          type: 'error',
          message: 'Password must be at least 4 characters long.',
        });
        return;
      }

      if (regPassword !== regConfirmPassword) {
        setFeedback({
          type: 'error',
          message: 'Passwords do not match. Please re-enter confirm password.',
        });
        return;
      }

      if (!regAgreeTerms) {
        setFeedback({
          type: 'error',
          message: 'Please confirm the civil identity declaration before completing registration.',
        });
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        // Auto-generate standardized NIN if left blank
        const formattedNin = regNin.trim() || `199${Math.floor(10000000000000000 + Math.random() * 90000000000000000)}`;

        const result = SystemStore.addUser({
          phone: cleanPhone,
          password: regPassword,
          fullName: regFullName.trim(),
          email: regEmail.trim() || undefined,
          nin: formattedNin,
          role: 'user',
          credit: 240.00,
          verificationTier: 'Tier 3 (Citizen Verified)',
          passStatus: 'ACTIVE',
          dateOfBirth: '1996-06-15',
          gender: 'MALE',
          nationality: 'TANZANIAN',
          residence: 'Dar es Salaam, Tanzania',
          district: 'Ilala',
          documentNumber: `TZ-NID-${Math.floor(10000000 + Math.random() * 90000000)}`,
          issueDate: new Date().toISOString().split('T')[0],
          expiryDate: '2036-06-15',
          avatarUrl: '/src/assets/images/avatar_citizen_verified_1790750468089.jpg',
        });

        setIsLoading(false);
        if (result.success && result.user) {
          setFeedback({
            type: 'success',
            message: `Account created for ${result.user.fullName}! Entering portal...`,
          });
          setTimeout(() => {
            SystemStore.setCurrentUser(result.user!);
            onLoginSuccess(result.user!);
          }, 800);
        } else {
          setFeedback({
            type: 'error',
            message: result.message || 'Registration failed. Check if phone number is already registered.',
          });
        }
      }, 650);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-blue-900 selection:text-white">
      {/* Return to Portal Link */}
      <div className="max-w-md w-full mx-auto mb-4">
        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-950 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Portal Homepage</span>
        </button>
      </div>

      {/* Main Authentication Container Card */}
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Card Header with Official Crest */}
        <div className="bg-slate-900 text-white p-6 sm:p-7 text-center relative border-b border-slate-800">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800 border border-slate-700 p-2 shadow-sm flex items-center justify-center mb-3">
            <img 
              src={sealImage} 
              alt="National Emblem" 
              className="w-full h-full object-contain" 
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider bg-blue-950 text-blue-300 border border-blue-800/80 mb-1.5">
            TLS 1.3 · 256-BIT ENCRYPTED GATEWAY
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            NIDA Pass Authentication
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            National Identification Authority · United Republic of Tanzania
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Segmented Control: Sign In vs Register */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setFeedback(null);
              }}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white text-blue-950 shadow-xs'
                  : 'hover:text-slate-950'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-blue-900" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setFeedback(null);
              }}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-white text-blue-950 shadow-xs'
                  : 'hover:text-slate-950'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-blue-900" />
              <span>Register Pass</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'login' ? (
              <>
                {/* Identifier Field: NIN, Email, or Phone */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label 
                      htmlFor="loginIdentifier" 
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                    >
                      National ID (NIN) or Email
                    </label>

                    {/* Detected Format Hint */}
                    {loginIdentifier && (
                      <span className="text-[10px] font-mono font-semibold text-slate-400">
                        {identifierType === 'nin' && 'Detected: NIN Number'}
                        {identifierType === 'email' && 'Detected: Email Address'}
                        {identifierType === 'phone' && 'Detected: Mobile Phone'}
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      {identifierType === 'email' ? (
                        <Mail className="w-4 h-4" />
                      ) : identifierType === 'phone' ? (
                        <Phone className="w-4 h-4" />
                      ) : (
                        <CreditCard className="w-4 h-4" />
                      )}
                    </div>
                    <input
                      type="text"
                      id="loginIdentifier"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="e.g. 19900315-11103-00001-21 or juma@nidapass.go.tz"
                      className={`w-full pl-10 pr-9 py-3 rounded-xl border text-sm font-medium focus:outline-none transition-colors ${
                        loginIdentifier && isIdentifierValid()
                          ? 'border-emerald-500 bg-emerald-50/20 text-slate-900'
                          : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-900'
                      }`}
                    />
                    {loginIdentifier && isIdentifierValid() && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-emerald-600">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Accepts 20-digit National ID Number, registered civil email, or mobile phone.
                  </p>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label 
                      htmlFor="loginPassword" 
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setLoginPassword('user123')}
                      className="text-[11px] text-blue-900 hover:underline font-semibold cursor-pointer"
                    >
                      Forgot Passkey?
                    </button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="loginPassword"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your secure password"
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm font-medium focus:outline-none focus:border-blue-900 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember this terminal */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 font-medium">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                    />
                    <span>Keep authenticated on this secure terminal</span>
                  </label>
                </div>
              </>
            ) : (
              <>
                {/* Registration Fields */}
                <div>
                  <label htmlFor="regFullName" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Full Legal Name (Jina Kamili)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="regFullName"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="e.g. Juma Hamisi Bakari"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:border-blue-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="regNin" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      National ID (NIN)
                    </label>
                    <input
                      type="text"
                      id="regNin"
                      value={regNin}
                      onChange={(e) => setRegNin(e.target.value)}
                      placeholder="Optional or 20 digits"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="regPhone" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Phone Number (Simu)
                    </label>
                    <input
                      type="text"
                      id="regPhone"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="0754112233"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-900"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="regEmail" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      id="regEmail"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="citizen@domain.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:border-blue-900"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="regPassword" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Password (Nenosiri)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={regShowPassword ? 'text' : 'password'}
                      id="regPassword"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="At least 4 characters"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:border-blue-900"
                    />
                    <button
                      type="button"
                      onClick={() => setRegShowPassword(!regShowPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {regShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {regPassword && (
                    <div className="mt-1.5 space-y-1">
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${passwordStrength.color}`} 
                          style={{ width: `${passwordStrength.score}%` }} 
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                        <span>Password Strength:</span>
                        <span className="font-semibold text-slate-700">{passwordStrength.label}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="regConfirmPassword" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="regConfirmPassword"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Re-type password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:border-blue-900"
                  />
                </div>

                <div className="pt-1">
                  <label className="flex items-start gap-2 cursor-pointer text-[11px] text-slate-600">
                    <input
                      type="checkbox"
                      checked={regAgreeTerms}
                      onChange={(e) => setRegAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                    />
                    <span>
                      I declare that all biographical data matches official civil registration records under NIDA Act Cap. 36.
                    </span>
                  </label>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-900/15 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Authenticating Gateway...</span>
                </>
              ) : activeTab === 'login' ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-blue-300" />
                  <span>Authenticate & Enter Portal</span>
                </>
              ) : (
                <>
                  <FileCheck2 className="w-4 h-4 text-blue-300" />
                  <span>Complete Registration & Issue Pass</span>
                </>
              )}
            </button>
          </form>

          {/* Feedback Banner */}
          {feedback && (
            <div 
              className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* 1-Click Fast Test Accounts Bar */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
              1-Click Verified Test Clearance
            </span>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleFastLogin('juma@nidapass.go.tz', 'user123')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-900 text-center transition-all cursor-pointer group"
              >
                <span className="text-xs font-bold text-slate-800 block group-hover:text-blue-900">
                  Citizen Pass
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Juma Hamisi</span>
              </button>

              <button
                type="button"
                onClick={() => handleFastLogin('admin@nidapass.go.tz', 'Eliya@123')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-900 text-center transition-all cursor-pointer group"
              >
                <span className="text-xs font-bold text-slate-800 block group-hover:text-blue-900">
                  Authority Officer
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Eliya Amos</span>
              </button>

              <button
                type="button"
                onClick={() => handleFastLogin('desk@nidapass.go.tz', 'feeder123')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-900 text-center transition-all cursor-pointer group"
              >
                <span className="text-xs font-bold text-slate-800 block group-hover:text-blue-900">
                  Desk Officer
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Temeke Desk</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
