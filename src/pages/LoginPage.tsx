import React, { useState } from 'react';
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
    <div className="min-h-screen bg-[#0B0F19] flex flex-col justify-center items-center p-4 sm:p-6 select-none relative overflow-hidden font-sans">
      {/* Subtle ambient tech grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293712_1px,transparent_1px),linear-gradient(to_bottom,#1f293712_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

      <div className="max-w-md w-full z-10">
        {/* Restaurant Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-emerald-600 text-white mb-3 shadow-lg shadow-emerald-950/50 border border-emerald-400/30">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase font-mono">
            ZAFFRAN FLAVOURS
          </h1>
          <p className="text-xs font-mono font-bold tracking-widest text-emerald-400 mt-1 uppercase">
            RESTAURANT POS
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Restaurant POS &amp; Billing System
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl shadow-2xl p-6 sm:p-8 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-100">Welcome back</h2>
              <p className="text-xs text-slate-400 mt-0.5">Please enter your credentials to sign in</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Online" />
          </div>

          {/* Error Banner */}
          {error && (
            <div id="login-error-alert" className="mb-5 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username-email" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username / Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="username-email"
                  type="text"
                  required
                  value={usernameOrEmail}
                  onChange={e => {
                    setUsernameOrEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#0B0F19] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono transition-colors"
                  placeholder="admin@restaurant.com"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full pl-9 pr-10 py-2.5 bg-[#0B0F19] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono transition-colors"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-0.5"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer font-mono"
            >
              <span>LOGIN</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demo Login Section */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                Demo Login
              </span>
              <span className="text-[10px] text-slate-500">Click to fill or login directly</span>
            </div>

            <div className="space-y-2">
              {/* Owner */}
              <div 
                onClick={() => handleSelectDemo('admin@restaurant.com', 'admin123')}
                className="p-3 rounded-lg bg-[#0B0F19] hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all flex items-center justify-between group"
                title="Click to populate credentials"
              >
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 flex items-center gap-2">
                    <span>Owner:</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 font-mono font-bold border border-amber-800/60">
                      OWNER
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">admin@restaurant.com</div>
                  <div className="text-[11px] text-slate-500 font-mono">admin123</div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDirectLogin('admin@restaurant.com', 'admin123');
                  }}
                  className="px-2.5 py-1 text-[11px] font-mono font-medium rounded bg-slate-800 text-slate-300 group-hover:bg-emerald-600 group-hover:text-white transition-colors"
                >
                  Sign in
                </button>
              </div>

              {/* Cashier */}
              <div 
                onClick={() => handleSelectDemo('cashier@restaurant.com', 'cashier123')}
                className="p-3 rounded-lg bg-[#0B0F19] hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all flex items-center justify-between group"
                title="Click to populate credentials"
              >
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 flex items-center gap-2">
                    <span>Cashier:</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 font-mono font-bold border border-blue-800/60">
                      CASHIER
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">cashier@restaurant.com</div>
                  <div className="text-[11px] text-slate-500 font-mono">cashier123</div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDirectLogin('cashier@restaurant.com', 'cashier123');
                  }}
                  className="px-2.5 py-1 text-[11px] font-mono font-medium rounded bg-slate-800 text-slate-300 group-hover:bg-emerald-600 group-hover:text-white transition-colors"
                >
                  Sign in
                </button>
              </div>

              {/* Kitchen */}
              <div 
                onClick={() => handleSelectDemo('kitchen@restaurant.com', 'kitchen123')}
                className="p-3 rounded-lg bg-[#0B0F19] hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all flex items-center justify-between group"
                title="Click to populate credentials"
              >
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 flex items-center gap-2">
                    <span>Kitchen:</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 font-mono font-bold border border-purple-800/60">
                      KITCHEN
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">kitchen@restaurant.com</div>
                  <div className="text-[11px] text-slate-500 font-mono">kitchen123</div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDirectLogin('kitchen@restaurant.com', 'kitchen123');
                  }}
                  className="px-2.5 py-1 text-[11px] font-mono font-medium rounded bg-slate-800 text-slate-300 group-hover:bg-emerald-600 group-hover:text-white transition-colors"
                >
                  Sign in
                </button>
              </div>

              {/* Waiter */}
              <div 
                onClick={() => handleSelectDemo('waiter@restaurant.com', 'waiter123')}
                className="p-3 rounded-lg bg-[#0B0F19] hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all flex items-center justify-between group"
                title="Click to populate credentials"
              >
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 flex items-center gap-2">
                    <span>Waiter:</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 font-mono font-bold border border-teal-800/60">
                      WAITER
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">waiter@restaurant.com</div>
                  <div className="text-[11px] text-slate-500 font-mono">waiter123</div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDirectLogin('waiter@restaurant.com', 'waiter123');
                  }}
                  className="px-2.5 py-1 text-[11px] font-mono font-medium rounded bg-slate-800 text-slate-300 group-hover:bg-emerald-600 group-hover:text-white transition-colors"
                >
                  Sign in
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-5 text-center text-[11px] text-slate-500">
          Zaffran Flavours • Multi-Branch Restaurant Point of Sale System
        </div>
      </div>
    </div>
  );
};
