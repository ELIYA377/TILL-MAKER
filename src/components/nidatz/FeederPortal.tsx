import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Users, 
  Sun, 
  Moon, 
  LogOut, 
  Phone, 
  Lock, 
  CheckCircle2, 
  X, 
  Loader2, 
  Zap, 
  Check, 
  Copy,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { SystemStore } from '../../services/systemStore';
import { SystemUser } from '../../types';

interface FeederPortalProps {
  currentUser: SystemUser;
  onLogout: () => void;
}

export const FeederPortal: React.FC<FeederPortalProps> = ({ currentUser, onLogout }) => {
  const { theme, toggleTheme } = useTheme();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [initialCredit, setInitialCredit] = useState('160');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdUser, setCreatedUser] = useState<{ phone: string; password: string; credit: number } | null>(null);
  const [copied, setCopied] = useState(false);

  // List of all system users
  const [users, setUsers] = useState<SystemUser[]>([]);

  const refreshUsers = () => {
    setUsers(SystemStore.getUsers());
  };

  useEffect(() => {
    refreshUsers();
    window.addEventListener('nidatz_users_changed', refreshUsers);
    return () => window.removeEventListener('nidatz_users_changed', refreshUsers);
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setCreatedUser(null);
    setPhone('');
    setPassword('');
    setInitialCredit('160');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCreatedUser(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanPhone = phone.trim();
    const phoneRegex = /^(06|07)[0-9]{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      alert('Namba ya simu lazima ianze na 07 au 06 na iwe na tarakimu 10!');
      return;
    }

    if (password.length < 4) {
      alert('Password lazima iwe na urefu wa angalau 4!');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const creditNum = parseFloat(initialCredit) || 0;
      const res = SystemStore.addUser({
        phone: cleanPhone,
        password,
        role: 'user',
        credit: creditNum,
      });

      setIsSubmitting(false);

      if (res.success && res.user) {
        setCreatedUser({
          phone: res.user.phone,
          password: password,
          credit: res.user.credit,
        });
        refreshUsers();
      } else {
        alert(res.message || 'Failed to save user.');
      }
    }, 500);
  };

  const handleCopyCredentials = () => {
    if (!createdUser) return;
    const text = `NIDA PORTAL LOGIN:\nPhone: ${createdUser.phone}\nPassword: ${createdUser.password}\nSalio: TSh ${createdUser.credit}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white antialiased transition-colors duration-300 min-h-screen flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shadow-sm">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r bg-clip-text text-transparent from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
                NIN Feeder Portal
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  Agent Desk: {currentUser.phone}
                </span>
                <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 font-bold uppercase">
                  Feeder Role
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="p-2 sm:p-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-900/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            User Registration Desk
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Provision new user accounts instantly into the NIDA system with floating credit.
          </p>
        </div>

        {/* The Iconic Feeder Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            id="cardCreateUser"
            onClick={handleOpenModal}
            className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-emerald-500/40 cursor-pointer transition-all duration-300 flex flex-col justify-between group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm group-hover:scale-110 transition-transform">
                <UserPlus className="w-7 h-7" />
              </div>
              <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">
                Active Desk
              </span>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-1">
                Create User Access
              </h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Register a new customer account with phone number, password, and starting balance.
              </p>
              <div className="inline-flex items-center gap-2 text-sm font-extrabold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                <span>Fungua Fomu ya Usajili</span> &rarr;
              </div>
            </div>
          </div>

          {/* Quick Stats & Helper */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                System Registry Status
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-800 dark:text-slate-200">
                  {users.length}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase">Registered Users</span>
              </div>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                Mteja aliyesajiliwa ataweza kuingia kwenye User Portal mara moja na kuanza kuomba namba za NIDA kwa TSh 40 tu kwa kila ombi.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
              Uthibitisho wa namba za simu: <strong>07xxxxxxxx</strong> au <strong>06xxxxxxxx</strong> (Tarakimu 10).
            </div>
          </div>
        </div>

        {/* Recently Registered Users Table */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" />
              <span>Recently Registered Profiles</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Showing {Math.min(users.length, 10)} latest</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase">
                  <th className="py-2.5 px-3">Phone Number</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Float Balance</th>
                  <th className="py-2.5 px-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {users.slice(0, 8).map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      {u.phone}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      TSh {u.credit.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal: Add New User */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 p-7 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            {!createdUser ? (
              /* Content State */
              <div id="modalContent" className="space-y-4">
                <div className="mb-2">
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-emerald-500" />
                    <span>Add New User</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sajili namba ya mteja ili apate uwezo wa kuingia kwenye portal.
                  </p>
                </div>

                <form id="formAddUser" onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                      Namba ya Simu (Phone Number)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        id="phone"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 0712345678"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-sm font-bold font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        id="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Angalau tarakimu 4"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-sm font-bold font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                      Salio la Kuanzia (Initial Float Credit in TSh)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <input
                        type="number"
                        value={initialCredit}
                        onChange={(e) => setInitialCredit(e.target.value)}
                        placeholder="160"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-sm font-bold font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="btnSubmit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition-all shadow-md shadow-emerald-500/25 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save User</span>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* Success State */
              <div id="successState" className="text-center py-4 space-y-4 animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">
                    User Created!
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Akaunti mpya imehifadhiwa kwenye database kikamilifu.
                  </p>
                </div>

                {/* Account Details Box */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phone:</span>
                    <strong className="text-slate-900 dark:text-white font-bold">{createdUser.phone}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Password:</span>
                    <strong className="text-slate-900 dark:text-white font-bold">{createdUser.password}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Initial Salio:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">TSh {createdUser.credit.toFixed(2)}</strong>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleCopyCredentials}
                    className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs flex justify-center items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCreatedUser(null);
                      setPhone('');
                      setPassword('');
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-colors cursor-pointer"
                  >
                    Create Another User
                  </button>
                </div>
              </div>
            )}
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
