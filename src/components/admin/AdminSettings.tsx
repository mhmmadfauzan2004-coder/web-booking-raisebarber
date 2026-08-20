import React, { useState } from 'react';
import {
  Save,
  Check,
  Clock,
  Globe,
  Lock,
  Key,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { WebsiteSettings, BusinessDayHours } from '../../types';
import { changeAdminPassword } from '../../api/client';

interface AdminSettingsProps {
  settings: WebsiteSettings;
  onSaveSettings: (settings: Partial<WebsiteSettings>) => Promise<void>;
  token?: string;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  settings,
  onSaveSettings,
  token = '',
}) => {
  const [formData, setFormData] = useState<WebsiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleHourChange = (index: number, field: keyof BusinessDayHours, value: any) => {
    const updated = [...formData.businessHours];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, businessHours: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      await onSaveSettings(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('Silakan masukkan kata sandi saat ini.');
      return;
    }

    if (newPassword.length < 4) {
      setPasswordError('Kata sandi baru minimal 4 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await changeAdminPassword(currentPassword, newPassword, token);
      setPasswordSuccess(res.message || 'Kata sandi admin berhasil diperbarui!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 5000);
    } catch (err: any) {
      setPasswordError(err.message || 'Gagal mengubah kata sandi.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            PENGATURAN WEBSITE & TOKO
          </h2>
          <p className="text-xs text-gray-400">
            Atur identitas brand, jam operasional, integrasi reservasi, serta keamanan kata sandi admin
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-sm bg-white hover:bg-gray-200 text-black text-xs font-black uppercase tracking-widest shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-black" />
              <span>MENYIMPAN...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-black" />
              <span>SIMPAN PENGATURAN</span>
            </>
          )}
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-sm bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Pengaturan berhasil diperbarui dan diterapkan ke seluruh website!</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-sm bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Security & Password Settings Card */}
      <div className="p-6 rounded-sm bg-[#161616] border border-white/10 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-[#0D0D0D] border border-white/10 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Keamanan & Ubah Kata Sandi Admin
              </h3>
              <p className="text-[11px] text-gray-400">
                Ubah kata sandi login admin. Kata sandi baru akan langsung berlaku untuk login berikutnya.
              </p>
            </div>
          </div>
        </div>

        {passwordSuccess && (
          <div className="p-3.5 rounded-sm bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="p-3.5 rounded-sm bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-gray-300 font-bold block">
                Kata Sandi Saat Ini <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Kata sandi saat ini"
                  className="w-full px-3.5 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs focus:outline-none focus:border-white font-medium pl-9"
                />
                <Key className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
              </div>
              <span className="text-[10px] text-gray-500 block">
                Default awal: <code className="text-gray-300">raiseadmin2025</code>
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-gray-300 font-bold block">
                Kata Sandi Baru <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 4 karakter"
                  className="w-full px-3.5 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs focus:outline-none focus:border-white font-medium pl-9"
                />
                <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
              </div>
              <span className="text-[10px] text-gray-500 block">
                Gunakan kombinasi karakter yang aman.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-gray-300 font-bold block">
                Konfirmasi Kata Sandi Baru <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full px-3.5 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs focus:outline-none focus:border-white font-medium pl-9"
                />
                <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
              </div>
              <span className="text-[10px] text-gray-500 block">
                Pastikan sama dengan kata sandi baru.
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="flex items-center gap-2 px-5 py-2.5 rounded-sm bg-white hover:bg-gray-200 text-black text-xs font-black uppercase tracking-wider shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {savingPassword ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                  <span>MEMPERBARUI KATA SANDI...</span>
                </>
              ) : (
                <>
                  <Key className="w-3.5 h-3.5 text-black" />
                  <span>SIMPAN KATA SANDI BARU</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Brand & Contact Section */}
        <div className="p-6 rounded-sm bg-[#161616] border border-white/10 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-white/10 pb-3">
            <Globe className="w-4 h-4 text-gray-400" />
            <span>Identitas Brand & Kontak</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-gray-300 font-bold block mb-1">Nama Brand</label>
              <input
                type="text"
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs focus:outline-none focus:border-white font-medium"
              />
            </div>

            <div>
              <label className="text-gray-300 font-bold block mb-1">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs focus:outline-none focus:border-white font-medium"
              />
            </div>

            <div>
              <label className="text-gray-300 font-bold block mb-1">Nomor WhatsApp Booking</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs focus:outline-none focus:border-white font-medium"
              />
            </div>

            <div>
              <label className="text-gray-300 font-bold block mb-1">Username Instagram</label>
              <input
                type="text"
                value={formData.instagramUsername}
                onChange={(e) => setFormData({ ...formData, instagramUsername: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs focus:outline-none focus:border-white font-medium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-gray-300 font-bold block mb-1">Alamat Lengkap</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs focus:outline-none focus:border-white font-medium"
              />
            </div>
          </div>
        </div>

        {/* Business Hours & Rules */}
        <div className="p-6 rounded-sm bg-[#161616] border border-white/10 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-white/10 pb-3">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>Jam Operasional & Aturan Reservasi</span>
          </h3>

          <div className="space-y-2.5">
            {formData.businessHours.map((hour, idx) => (
              <div
                key={hour.dayKey}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-sm bg-[#0D0D0D] border border-white/10 text-xs"
              >
                <div className="flex items-center gap-3 w-44">
                  <input
                    type="checkbox"
                    checked={hour.isOpen}
                    onChange={(e) => handleHourChange(idx, 'isOpen', e.target.checked)}
                    className="rounded-sm border-white/20 text-white accent-white"
                  />
                  <span className="font-bold text-white">{hour.dayName}</span>
                </div>

                {hour.isOpen ? (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-[11px]">Buka:</span>
                    <input
                      type="time"
                      value={hour.openTime}
                      onChange={(e) => handleHourChange(idx, 'openTime', e.target.value)}
                      className="px-2.5 py-1.5 rounded-sm bg-[#161616] border border-white/10 text-white [color-scheme:dark]"
                    />
                    <span className="text-gray-400 text-[11px]">Tutup:</span>
                    <input
                      type="time"
                      value={hour.closeTime}
                      onChange={(e) => handleHourChange(idx, 'closeTime', e.target.value)}
                      className="px-2.5 py-1.5 rounded-sm bg-[#161616] border border-white/10 text-white [color-scheme:dark]"
                    />
                  </div>
                ) : (
                  <span className="text-red-400 font-semibold">Tutup</span>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/10 text-xs">
            <div>
              <label className="text-gray-300 font-bold block mb-1">
                Cancellation Window (Batas Pembatalan Online - Jam)
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={formData.cancellationWindowHours}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cancellationWindowHours: parseInt(e.target.value) || 2,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white"
              />
              <span className="text-[10px] text-gray-500">
                Customer tidak dapat membatalkan booking online jika kurang dari jam ini sebelum appointment.
              </span>
            </div>

            <div>
              <label className="text-gray-300 font-bold block mb-1">
                Slot Interval Engine (Menit)
              </label>
              <input
                type="number"
                min="15"
                max="60"
                step="15"
                value={formData.slotIntervalMinutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    slotIntervalMinutes: parseInt(e.target.value) || 30,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white"
              />
            </div>
          </div>
        </div>

        {/* Hero & Media Banner */}
        <div className="p-6 rounded-sm bg-[#161616] border border-white/10 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-white/10 pb-3">
            <Globe className="w-4 h-4 text-gray-400" />
            <span>Konten Homepage & Banner Hero</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-gray-300 font-bold block mb-1">Hero Title</label>
              <input
                type="text"
                value={formData.heroTitle}
                onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-gray-300 font-bold block mb-1">Hero Subtitle</label>
              <textarea
                rows={2}
                value={formData.heroSubtitle}
                onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                className="w-full px-3.5 py-2 rounded-sm bg-[#0D0D0D] border border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-gray-300 font-bold block mb-1">Hero Background Image URL</label>
              <input
                type="url"
                value={formData.heroImageUrl}
                onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white font-mono"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
