import React, { useState } from 'react';
import { Scissors, ShieldCheck, Lock, User, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { adminLogin } from '../../api/client';

interface AdminLoginProps {
  onSuccess: (token: string) => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState(() => {
    return typeof window !== 'undefined'
      ? localStorage.getItem('raise_admin_password') || 'raiseadmin2025'
      : 'raiseadmin2025';
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await adminLogin(username, password);
      onSuccess(res.token);
    } catch (err: any) {
      setError(err.message || 'Username atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

      {/* Top back button */}
      <button
        onClick={onCancel}
        className="absolute top-6 left-6 flex items-center gap-2 px-3 py-2 rounded-sm bg-[#161616] border border-white/10 text-gray-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Website</span>
      </button>

      <div className="w-full max-w-md bg-[#161616] border border-white/10 rounded-sm p-8 shadow-2xl space-y-6 relative z-10">
        {/* Brand Icon */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-sm bg-[#0D0D0D] border border-white/20 text-white flex items-center justify-center mx-auto shadow-lg">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            ADMIN PORTAL
          </h1>
          <p className="text-xs text-gray-400">
            Raise Barbershop Dumai &bull; Booking & Business Management
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-sm bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300 block">Username</label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-sm focus:outline-none focus:border-white font-medium pl-10"
                placeholder="Username admin"
              />
              <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300 block">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-sm focus:outline-none focus:border-white font-medium pl-10"
                placeholder="Password"
              />
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="p-3 rounded-sm bg-[#0D0D0D] border border-white/10 text-[11px] text-gray-400">
            <span className="text-white font-bold">Default Demo Credentials:</span>
            <br />
            Username: <code className="text-white font-mono font-bold">admin</code> &bull; Password:{' '}
            <code className="text-white font-mono font-bold">raiseadmin2025</code>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-sm bg-white hover:bg-gray-200 text-black font-black uppercase tracking-widest text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>MEMVERIFIKASI...</span>
              </>
            ) : (
              <span>MASUK DASHBOARD</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
