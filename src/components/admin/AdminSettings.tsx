import React, { useState, useEffect } from 'react';
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
  RotateCcw,
  Sparkles,
  Palette,
  Image as ImageIcon,
} from 'lucide-react';
import { WebsiteSettings, BusinessDayHours } from '../../types';
import { changeAdminPassword } from '../../api/client';
import { INITIAL_SETTINGS } from '../../data/initialData';

interface AdminSettingsProps {
  settings?: WebsiteSettings | null;
  onSaveSettings: (settings: Partial<WebsiteSettings>) => Promise<void>;
  token?: string;
}

// Utility to ensure complete fallback data structure
function sanitizeSettings(input?: WebsiteSettings | null): WebsiteSettings {
  const fallback = INITIAL_SETTINGS;
  if (!input || typeof input !== 'object') {
    return { ...fallback };
  }

  // Ensure businessHours array exists with all 7 days
  const businessHours: BusinessDayHours[] = Array.isArray(input.businessHours) && input.businessHours.length > 0
    ? input.businessHours.map((h, i) => {
        const fallbackH = fallback.businessHours[i] || fallback.businessHours[0];
        return {
          dayName: h?.dayName || fallbackH?.dayName || 'Hari',
          dayKey: h?.dayKey || fallbackH?.dayKey || 'monday',
          isOpen: typeof h?.isOpen === 'boolean' ? h.isOpen : true,
          openTime: h?.openTime || fallbackH?.openTime || '09:00',
          closeTime: h?.closeTime || fallbackH?.closeTime || '22:00',
        };
      })
    : [...fallback.businessHours];

  return {
    brandName: input.brandName || fallback.brandName || 'RAISE BARBERSHOP DUMAI',
    tagline: input.tagline || fallback.tagline || 'Hair Cut & Shave',
    phone: input.phone || fallback.phone || '0852-7121-1746',
    whatsapp: input.whatsapp || fallback.whatsapp || '085271211746',
    instagram: input.instagram || fallback.instagram || '@raisebarbershop',
    instagramUsername: input.instagramUsername || input.instagram || fallback.instagramUsername || '@raisebarbershop',
    instagramUrl: input.instagramUrl || fallback.instagramUrl || 'https://instagram.com/raisebarbershop',
    address: input.address || fallback.address || 'Jl. Pangeran Diponegoro, Sukajadi, Kecamatan Dumai Kota, Kota Dumai, Riau',
    addressDetails: input.addressDetails || fallback.addressDetails || 'Dekat pusat kota Dumai, parkir luas & nyaman untuk mobil/motor.',
    googleMapsEmbedUrl: input.googleMapsEmbedUrl || fallback.googleMapsEmbedUrl || '',
    googleMapsDirectionsUrl: input.googleMapsDirectionsUrl || fallback.googleMapsDirectionsUrl || '',
    heroTitle: input.heroTitle || fallback.heroTitle || 'LOOK SHARP. FEEL CONFIDENT.',
    heroSubtitle: input.heroSubtitle || fallback.heroSubtitle || 'Premium Hair Cut & Shave di Raise Barbershop Dumai.',
    heroImageUrl: input.heroImageUrl || fallback.heroImageUrl || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1600&auto=format&fit=crop&q=80',
    aboutTitle: input.aboutTitle || fallback.aboutTitle || 'RAISE YOUR STANDARD',
    aboutText: input.aboutText || fallback.aboutText || fallback.aboutText,
    aboutFeatures: Array.isArray(input.aboutFeatures) && input.aboutFeatures.length > 0 ? input.aboutFeatures : fallback.aboutFeatures,
    logoUrl: input.logoUrl || '',
    businessHours,
    cancellationWindowHours: Number(input.cancellationWindowHours ?? input.bookingRules?.cancellationWindowHours ?? 2),
    slotIntervalMinutes: Number(input.slotIntervalMinutes ?? input.bookingRules?.slotIntervalMinutes ?? 30),
    bookingRules: input.bookingRules || fallback.bookingRules,
    holidays: Array.isArray(input.holidays) ? input.holidays : [],
  };
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  settings,
  onSaveSettings,
  token = '',
}) => {
  const [formData, setFormData] = useState<WebsiteSettings>(() => sanitizeSettings(settings));
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetNotice, setResetNotice] = useState<string | null>(null);

  // Sync state if settings prop changes
  useEffect(() => {
    if (settings) {
      setFormData(sanitizeSettings(settings));
    }
  }, [settings]);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleHourChange = (index: number, field: keyof BusinessDayHours, value: any) => {
    const currentHours = Array.isArray(formData?.businessHours) ? formData.businessHours : INITIAL_SETTINGS.businessHours;
    const updated = [...currentHours];
    if (updated[index]) {
      updated[index] = { ...updated[index], [field]: value };
      setFormData((prev) => ({ ...prev, businessHours: updated }));
    }
  };

  const handleResetToDefault = () => {
    const confirmation = window.confirm(
      'Apakah Anda yakin ingin memuat ulang pengaturan bawaan (default)? Semua field formulir akan diisi ulang dengan data asli Raise Barbershop.'
    );
    if (!confirmation) return;

    const defaults = sanitizeSettings(INITIAL_SETTINGS);
    setFormData(defaults);
    setResetNotice('Pengaturan default berhasil dimuat ke formulir. Klik "Simpan Pengaturan" di atas untuk menyimpan ke server.');
    setTimeout(() => setResetNotice(null), 7000);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      const sanitized = sanitizeSettings(formData);
      await onSaveSettings(sanitized);
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

  const safeHours = Array.isArray(formData?.businessHours) && formData.businessHours.length > 0
    ? formData.businessHours
    : INITIAL_SETTINGS.businessHours;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
            <span>PENGATURAN WEBSITE & TOKO</span>
            <span className="px-2 py-0.5 rounded-xs bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-400 font-bold tracking-widest uppercase">
              LIVE CONFIG
            </span>
          </h2>
          <p className="text-xs text-gray-400">
            Atur identitas brand, logo, tema visual, jam operasional, integrasi reservasi, serta keamanan kata sandi admin
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center gap-2 px-4 py-2.5 rounded-sm bg-[#161616] hover:bg-[#222] border border-white/15 text-gray-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            title="Muat ulang pengaturan default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET DEFAULT</span>
          </button>

          <button
            onClick={() => handleSubmit()}
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
      </div>

      {resetNotice && (
        <div className="p-4 rounded-sm bg-amber-950/40 border border-amber-800 text-amber-300 text-xs flex items-center gap-2.5 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{resetNotice}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-sm bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Pengaturan berhasil diperbarui dan diterapkan ke seluruh website!</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-sm bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
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
                Default: <code className="text-gray-300">raiseadmin2025</code>
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
        {/* Brand & Identity Section */}
        <div className="p-6 rounded-sm bg-[#161616] border border-white/10 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-white/10 pb-3">
            <Globe className="w-4 h-4 text-gray-400" />
            <span>Identitas Brand, Logo & Kontak Toko</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-gray-300 font-bold block mb-1">Nama Brand / Barbershop</label>
              <input
                type="text"
                value={formData?.brandName ?? ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, brandName: e.target.value }))}
                placeholder="RAISE BARBERSHOP DUMAI"
                className="w-full px-3.5 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs focus:outline-none focus:border-white font-medium"
              />
            </div>

            <div>
              <label className="text-gray-300 font-bold block mb-1">Tagline Barbershop</label>
              <input
                type="text"
                value={formData?.tagline ?? ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, tagline: e.target.value }))}
                placeholder="Hair Cut & Shave"
                className="w-full px-3.5 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs focus:outline-none focus:border-white font-medium"
              />
            </div>

            <div>
              <label className="text-gray-300 font-bold block mb-1">Logo URL (Opsional / Gambar Khusus)</label>
              <input
                type="url"
                value={formData?.logoUrl ?? ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, logoUrl: e.target.value }))}
                placeholder="https://... (Kosongkan jika menggunakan teks badge logo)"
                className="w-full px-3.5 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs focus:outline-none focus:border-white font-medium"
              />
            </div>

            <div>
              <label className="text-gray-300 font-bold block mb-1">Nomor Telepon Toko</label>
              <input
                type="text"
                value={formData?.phone ?? ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="0852-7121-1746"
                className="w-full px-3.5 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs focus:outline-none focus:border-white font-medium"
              />
            </div>

            <div>
              <label className="text-gray-300 font-bold block mb-1">Nomor WhatsApp Notifikasi Booking</label>
              <input
                type="text"
                value={formData?.whatsapp ?? ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, whatsapp: e.target.value }))}
                placeholder="085271211746"
                className="w-full px-3.5 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs focus:outline-none focus:border-white font-medium"
              />
            </div>

            <div>
              <label className="text-gray-300 font-bold block mb-1">Instagram (@handle)</label>
              <input
                type="text"
                value={formData?.instagramUsername || formData?.instagram || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    instagram: e.target.value,
                    instagramUsername: e.target.value,
                    instagramUrl: 'https://instagram.com/' + e.target.value.replace('@', ''),
                  }))
                }
                placeholder="@raisebarbershop"
                className="w-full px-3.5 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs focus:outline-none focus:border-white font-medium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-gray-300 font-bold block mb-1">Alamat Lengkap Barbershop</label>
              <input
                type="text"
                value={formData?.address ?? ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Jl. Pangeran Diponegoro, Sukajadi, Kota Dumai..."
                className="w-full px-3.5 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs focus:outline-none focus:border-white font-medium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-gray-300 font-bold block mb-1">Keterangan Tambahan Lokasi / Patokan</label>
              <input
                type="text"
                value={formData?.addressDetails ?? ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, addressDetails: e.target.value }))}
                placeholder="Dekat pusat kota Dumai, parkir luas..."
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
            {safeHours.map((hour, idx) => (
              <div
                key={hour?.dayKey || idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-sm bg-[#0D0D0D] border border-white/10 text-xs"
              >
                <div className="flex items-center gap-3 w-44">
                  <input
                    type="checkbox"
                    checked={hour?.isOpen ?? true}
                    onChange={(e) => handleHourChange(idx, 'isOpen', e.target.checked)}
                    className="rounded-sm border-white/20 text-white accent-white cursor-pointer"
                  />
                  <span className="font-bold text-white">{hour?.dayName || `Hari ${idx + 1}`}</span>
                </div>

                {hour?.isOpen ? (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-[11px]">Buka:</span>
                    <input
                      type="time"
                      value={hour?.openTime || '09:00'}
                      onChange={(e) => handleHourChange(idx, 'openTime', e.target.value)}
                      className="px-2.5 py-1.5 rounded-sm bg-[#161616] border border-white/10 text-white [color-scheme:dark]"
                    />
                    <span className="text-gray-400 text-[11px]">Tutup:</span>
                    <input
                      type="time"
                      value={hour?.closeTime || '22:00'}
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
                Batas Pembatalan Online (Cancellation Window - Jam)
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={formData?.cancellationWindowHours ?? 2}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    cancellationWindowHours: parseInt(e.target.value) || 2,
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white"
              />
              <span className="text-[10px] text-gray-500">
                Customer tidak dapat membatalkan booking jika kurang dari waktu ini sebelum jam appointment.
              </span>
            </div>

            <div>
              <label className="text-gray-300 font-bold block mb-1">
                Interval Durasi Slot Waktu (Menit)
              </label>
              <input
                type="number"
                min="15"
                max="60"
                step="15"
                value={formData?.slotIntervalMinutes ?? 30}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    slotIntervalMinutes: parseInt(e.target.value) || 30,
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white"
              />
              <span className="text-[10px] text-gray-500">
                Jarak interval antara setiap slot booking (rekomendasi: 30 menit).
              </span>
            </div>
          </div>
        </div>

        {/* Hero & Media Banner */}
        <div className="p-6 rounded-sm bg-[#161616] border border-white/10 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-white/10 pb-3">
            <ImageIcon className="w-4 h-4 text-gray-400" />
            <span>Konten Homepage & Banner Hero</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-gray-300 font-bold block mb-1">Hero Title (Judul Utama Banner)</label>
              <input
                type="text"
                value={formData?.heroTitle ?? ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, heroTitle: e.target.value }))}
                placeholder="LOOK SHARP. FEEL CONFIDENT."
                className="w-full px-3.5 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-gray-300 font-bold block mb-1">Hero Subtitle (Deskripsi Pendek)</label>
              <textarea
                rows={2}
                value={formData?.heroSubtitle ?? ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, heroSubtitle: e.target.value }))}
                placeholder="Deskripsi barbershop pada banner utama..."
                className="w-full px-3.5 py-2 rounded-sm bg-[#0D0D0D] border border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-gray-300 font-bold block mb-1">Hero Background Image URL</label>
              <input
                type="url"
                value={formData?.heroImageUrl ?? ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, heroImageUrl: e.target.value }))}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Floating Bottom Save Button */}
        <div className="flex items-center justify-between p-4 rounded-sm bg-[#161616] border border-white/10 sticky bottom-4 shadow-2xl backdrop-blur-md">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Muat Ulang Pengaturan Default</span>
          </button>

          <button
            type="submit"
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
                <span>SIMPAN SEMUA PERUBAHAN</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

