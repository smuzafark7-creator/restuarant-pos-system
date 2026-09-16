import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  UtensilsCrossed, 
  KeyRound, 
  Mail, 
  ArrowRight, 
  ShieldAlert, 
  Eye, 
  EyeOff,
  UserCheck
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useApp();
  const [usernameOrEmail, setUsernameOrEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Failsafe: Ensure body/html allows vertical scrolling when on the login screen
  useEffect(() => {
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';
    document.body.style.height = 'auto';
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = login(usernameOrEmail, password);
    if (!result.success) {
      setError(result.error || 'Invalid email or password');
      setIsSubmitting(false);
    }
  };

  const handleSelectDemo = (userIdentifier: string, pass: string) => {
    setUsernameOrEmail(userIdentifier);
    setPassword(pass);
    setError('');
  };

  const handleDirectLogin = (userIdentifier: string, pass: string) => {
    setUsernameOrEmail(userIdentifier);
    setPassword(pass);
    setError('');
    login(userIdentifier, pass);
  };

  return (
    <div 
      className="w-full min-h-screen pt-4 pb-16 flex flex-col items-center justify-start px-4 bg-[#f8fafc] dark:bg-[#060b17] select-none relative font-sans overflow-y-auto"
      style={{ minHeight: '100vh', maxHeight: 'none', overflowY: 'auto' }}
    >
      {/* Subtle background texture */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b50_1px,transparent_1px),linear-gradient(to_bottom,#1e293b50_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

      <div className="max-w-md w-full z-10">
        {/* Restaurant Brand Header */}
        <div className="text-center mt-1 mb-2">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-600 text-white mb-1.5 shadow-md border border-emerald-500">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase leading-tight">
            ZAFFRAN FLAVOURS
          </h1>
          <p className="text-[11px] font-semibold tracking-widest text-emerald-700 dark:text-emerald-400 mt-0.5 uppercase">
            RESTAURANT POS
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Cloud POS &amp; Dining Room Management
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-5">
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Welcome back</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Please enter your credentials to sign in</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Online" />
          </div>

          {/* Error Banner */}
          {error && (
            <div id="login-error-alert" className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="username-email" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Username / Email
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="username-email"
                  type="text"
                  required
                  value={usernameOrEmail}
                  onChange={e => {
                    setUsernameOrEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full pl-8.5 pr-3 py-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100/70 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
                  placeholder="admin@restaurant.com"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full pl-8.5 pr-9 py-2 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100/70 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-1.5 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>SIGN IN TO POS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Demo Login Section */}
          <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Demo Credentials
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Click to fill &amp; enter</span>
            </div>

            <div className="space-y-1.5">
              {/* Owner */}
              <div 
                onClick={() => handleSelectDemo('admin@restaurant.com', 'admin123')}
                className="py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
                title="Click to populate credentials"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 flex items-center gap-1.5 leading-tight">
                    <span>Owner / Super Admin:</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      OWNER
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    admin@restaurant.com • admin123
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDirectLogin('admin@restaurant.com', 'admin123');
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-colors shadow-2xs cursor-pointer shrink-0 ml-2"
                >
                  Sign in
                </button>
              </div>

              {/* Branch Manager */}
              <div 
                onClick={() => handleSelectDemo('manager@restaurant.com', 'manager123')}
                className="py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
                title="Click to populate credentials"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 flex items-center gap-1.5 leading-tight">
                    <span>Branch Manager (Branch 1):</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      SUPERVISOR
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    manager@restaurant.com • manager123
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDirectLogin('manager@restaurant.com', 'manager123');
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-colors shadow-2xs cursor-pointer shrink-0 ml-2"
                >
                  Sign in
                </button>
              </div>

              {/* Cashier */}
              <div 
                onClick={() => handleSelectDemo('cashier@restaurant.com', 'cashier123')}
                className="py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
                title="Click to populate credentials"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 flex items-center gap-1.5 leading-tight">
                    <span>Cashier (Toast Counter):</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                      CASHIER
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    cashier@restaurant.com • cashier123
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDirectLogin('cashier@restaurant.com', 'cashier123');
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-colors shadow-2xs cursor-pointer shrink-0 ml-2"
                >
                  Sign in
                </button>
              </div>

              {/* Waiter */}
              <div 
                onClick={() => handleSelectDemo('waiter@restaurant.com', 'waiter123')}
                className="py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
                title="Click to populate credentials"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 flex items-center gap-1.5 leading-tight">
                    <span>Floor Waiter (Touch Handheld):</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                      WAITER
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    waiter@restaurant.com • waiter123
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDirectLogin('waiter@restaurant.com', 'waiter123');
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-colors shadow-2xs cursor-pointer shrink-0 ml-2"
                >
                  Sign in
                </button>
              </div>

              {/* Kitchen */}
              <div 
                onClick={() => handleSelectDemo('kitchen@restaurant.com', 'kitchen123')}
                className="py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
                title="Click to populate credentials"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 flex items-center gap-1.5 leading-tight">
                    <span>Kitchen Display (KDS):</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                      KITCHEN
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    kitchen@restaurant.com • kitchen123
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDirectLogin('kitchen@restaurant.com', 'kitchen123');
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-colors shadow-2xs cursor-pointer shrink-0 ml-2"
                >
                  Sign in
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-3 text-center text-[11px] text-slate-500 dark:text-slate-400">
          Zaffran Flavours • Multi-Branch Restaurant Point of Sale System
        </div>
      </div>
    </div>
  );
};
