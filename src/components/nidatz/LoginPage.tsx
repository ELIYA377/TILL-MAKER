import React, { useState } from 'react';
import { 
  CreditCard, 
  Phone, 
  Lock, 
  User as UserIcon,
  Sun, 
  Moon, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  UserPlus,
  LogIn
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { SystemStore } from '../../services/systemStore';
import { SystemUser } from '../../types';

interface LoginPageProps {
  onLoginSuccess: (user: SystemUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login fields
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration fields
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    setTimeout(() => {
      if (activeTab === 'login') {
        const result = SystemStore.login(phone, password);
        setIsLoading(false);

        if (result.success && result.user) {
          setFeedback({
            type: 'success',
            message: 'Imefanikiwa! Inaingia kwenye mfumo...',
          });
          setTimeout(() => {
            onLoginSuccess(result.user!);
          }, 600);
        } else {
          setFeedback({
            type: 'error',
            message: result.message || 'Namba ya simu au nenosiri siyo sahihi.',
          });
        }
      } else {
        // Register flow
        const result = SystemStore.addUser({
          phone: regPhone,
          password: regPassword,
          fullName: regFullName.trim() || undefined,
          role: 'user',
          credit: 120.00, // Welcome credit
        });
        setIsLoading(false);

        if (result.success && result.user) {
          setFeedback({
            type: 'success',
            message: `Akaunti ya ${result.user.phone} imesajiliwa kikamilifu! Inaingia moja kwa moja...`,
          });
          setTimeout(() => {
            SystemStore.setCurrentUser(result.user!);
            onLoginSuccess(result.user!);
          }, 800);
        } else {
          setFeedback({
            type: 'error',
            message: result.message || 'Usajili umeshindikana. Angalia taarifa zako.',
          });
        }
      }
    }, 600);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white antialiased transition-colors duration-300 min-h-screen flex flex-col justify-center p-4 relative font-sans">
      {/* Theme Toggle Button */}
      <button
        id="theme-toggle"
        type="button"
        onClick={toggleTheme}
        className="absolute top-5 right-5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg text-sm p-2.5 focus:outline-none transition-colors border-2 border-slate-300 dark:border-slate-700 cursor-pointer"
        title="Toggle Dark/Light Mode"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-amber-400" />
        ) : (
          <Moon className="w-5 h-5 text-slate-700" />
        )}
      </button>

      <div className="max-w-md w-full mx-auto">
        {/* Header Icon & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white mb-3 shadow-lg shadow-blue-500/30">
            <CreditCard className="w-8 h-8" />
          </div>
          <div className="inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 mb-2">
            sinsoft.online/id/lookup.php
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Sinsoft ID Lookup & API
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Tanzania National Identification Number Registry & Verification System
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl relative space-y-6">
          {/* Tab Navigation */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setFeedback(null);
              }}
              className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Ingia (Login)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setFeedback(null);
              }}
              className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sajili Mpya</span>
            </button>
          </div>

          <form id="loginForm" onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'register' && (
              <div>
                <label 
                  htmlFor="regFullName"
                  className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-300"
                >
                  Jina Kamili (Full Name)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="regFullName"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full pl-11 border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-white rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors placeholder:text-slate-400 text-sm"
                    placeholder="e.g. Juma Hamisi Bakari"
                  />
                </div>
              </div>
            )}

            {/* Phone Number Field */}
            <div>
              <label 
                htmlFor={activeTab === 'login' ? 'phone' : 'regPhone'}
                className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-300"
              >
                Phone Number (Namba ya Simu)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id={activeTab === 'login' ? 'phone' : 'regPhone'}
                  required
                  value={activeTab === 'login' ? phone : regPhone}
                  onChange={(e) => activeTab === 'login' ? setPhone(e.target.value) : setRegPhone(e.target.value)}
                  className="w-full pl-11 border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-white rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors placeholder:text-slate-400 text-sm"
                  placeholder="e.g. 0754112233"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor={activeTab === 'login' ? 'password' : 'regPassword'}
                className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-300"
              >
                Password (Nenosiri)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  id={activeTab === 'login' ? 'password' : 'regPassword'}
                  required
                  value={activeTab === 'login' ? password : regPassword}
                  onChange={(e) => activeTab === 'login' ? setPassword(e.target.value) : setRegPassword(e.target.value)}
                  className="w-full pl-11 border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-950 dark:text-white rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors placeholder:text-slate-400 text-sm"
                  placeholder={activeTab === 'login' ? 'Weka password yako' : 'Tengeneza password (angalau tarakimu 4)'}
                />
              </div>
            </div>

            {activeTab === 'register' && (
              <p className="text-[11px] text-slate-400">
                Ukisajili sasa utapata salio la kuanzia la <strong>TSh 120</strong> bure kwenye akaunti yako mpya.
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              id="btnLogin"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 rounded-xl text-base transition duration-300 shadow-lg shadow-blue-500/25 flex justify-center items-center mt-2 cursor-pointer disabled:opacity-70"
            >
              <span id="btnText">
                {isLoading 
                  ? 'Inachakata...' 
                  : activeTab === 'login' 
                  ? 'Ingia Kwenye Mfumo' 
                  : 'Kamilisha Usajili na Ingia'}
              </span>
              {isLoading && (
                <Loader2 className="w-5 h-5 ml-2 animate-spin text-white" />
              )}
            </button>
          </form>

          {/* Quick 1-Click Demo Accounts */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
              Akaunti za Kujaribu (1-Click Test Login):
            </span>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPhone('0754112233');
                  setPassword('user123');
                  const result = SystemStore.login('0754112233', 'user123');
                  if (result.success && result.user) {
                    onLoginSuccess(result.user);
                  }
                }}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 text-center transition-all cursor-pointer group"
              >
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block group-hover:text-blue-600">
                  Agent User
                </span>
                <span className="text-[9px] text-slate-400 font-mono">TSh 480 Float</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPhone('0784615052');
                  setPassword('Eliya@123');
                  const result = SystemStore.login('0784615052', 'Eliya@123');
                  if (result.success && result.user) {
                    onLoginSuccess(result.user);
                  }
                }}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 text-center transition-all cursor-pointer group"
              >
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block group-hover:text-blue-600">
                  Admin Boss
                </span>
                <span className="text-[9px] text-slate-400 font-mono">Full Access</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPhone('0600000000');
                  setPassword('feeder123');
                  const result = SystemStore.login('0600000000', 'feeder123');
                  if (result.success && result.user) {
                    onLoginSuccess(result.user);
                  }
                }}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 text-center transition-all cursor-pointer group"
              >
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block group-hover:text-blue-600">
                  Feeder Desk
                </span>
                <span className="text-[9px] text-slate-400 font-mono">Process NIN</span>
              </button>
            </div>
          </div>

          {/* Feedback Message */}
          {feedback && (
            <div
              id="feedbackMessage"
              className={`mt-5 text-center font-bold text-sm p-3 rounded-lg flex items-center justify-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/40'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/40'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6 font-medium">
          Developed by Digital sales &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};
