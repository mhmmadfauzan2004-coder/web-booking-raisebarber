import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Star, Check, X, Scissors, User, Sparkles, Loader2, Phone } from 'lucide-react';
import { Barber } from '../../types';
import { ImageUploadField } from '../common/ImageUploadField';

interface AdminBarbersProps {
  barbers: Barber[];
  onSaveBarber: (barber: Partial<Barber>) => Promise<void>;
  onDeleteBarber: (id: string) => Promise<void>;
  onToggleAvailability: (id: string) => Promise<void>;
}

export const AdminBarbers: React.FC<AdminBarbersProps> = ({
  barbers,
  onSaveBarber,
  onDeleteBarber,
  onToggleAvailability,
}) => {
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [isNew, setIsNew] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('Senior Barber');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [rating, setRating] = useState(4.9);
  const [specsText, setSpecsText] = useState('Fade, Pompadour, Beard Trim');
  const [isActive, setIsActive] = useState(true);
  const [isAvailableToday, setIsAvailableToday] = useState(true);

  const openAdd = () => {
    setEditingBarber(null);
    setIsNew(true);
    setName('');
    setRole('Master Barber');
    setPhone('081234567890');
    setBio('Spesialis potongan rambut pria modern dan classic grooming.');
    setPhotoUrl('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80');
    setRating(4.9);
    setSpecsText('Skin Fade, French Crop, Beard Styling');
    setIsActive(true);
    setIsAvailableToday(true);
  };

  const openEdit = (b: Barber) => {
    setEditingBarber(b);
    setIsNew(false);
    setName(b.name);
    setRole(b.role);
    setPhone(b.phone || '');
    setBio(b.bio);
    setPhotoUrl(b.photoUrl);
    setRating(b.rating);
    setSpecsText((b.specialization || []).join(', '));
    setIsActive(b.isActive);
    setIsAvailableToday(b.isAvailableToday);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const specialization = specsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await onSaveBarber({
        id: editingBarber ? editingBarber.id : undefined,
        name: name.trim(),
        role: role.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        photoUrl: photoUrl.trim(),
        rating: Number(rating),
        specialization,
        isActive,
        isAvailableToday,
      });
      setIsNew(false);
      setEditingBarber(null);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan barber');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            BARBER CREW MANAGEMENT
          </h2>
          <p className="text-xs text-gray-400">
            Kelola profil barber, status jaga hari ini (On-Duty), keahlian spesialisasi, dan kontak WhatsApp ({barbers.length} kapster)
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-sm bg-white hover:bg-gray-200 text-black text-xs font-black uppercase tracking-wider shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>+ TAMBAH BARBER BARU</span>
        </button>
      </div>

      {/* Barbers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {barbers.map((b) => (
          <div
            key={b.id}
            className="p-5 rounded-sm bg-[#161616] border border-white/10 flex flex-col justify-between space-y-4 shadow-xl hover:border-white/20 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-start gap-3.5">
                <img
                  src={b.photoUrl}
                  alt={b.name}
                  className="w-16 h-16 rounded-sm object-cover border border-white/10 shadow-md shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">
                    {b.role}
                  </span>
                  <h3 className="text-base font-bold text-white truncate">{b.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-black">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{b.rating.toFixed(1)}</span>
                    </div>
                    {b.phone && (
                      <span className="text-gray-500 text-[11px] font-mono">&bull; {b.phone}</span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{b.bio}</p>

              {/* Specialties */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(b.specialization || []).map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-[10px] text-gray-300 font-semibold"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              {/* Daily Availability Toggle */}
              <button
                onClick={() => onToggleAvailability(b.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold transition-all cursor-pointer ${
                  b.isAvailableToday && b.isActive
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                    : 'bg-[#0D0D0D] text-gray-400 border border-white/10'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    b.isAvailableToday && b.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'
                  }`}
                />
                <span>{b.isAvailableToday && b.isActive ? 'On Duty' : 'Off Today'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(b)}
                  className="p-2 rounded-sm bg-[#0D0D0D] hover:bg-white hover:text-black border border-white/10 text-gray-300 transition-colors cursor-pointer"
                  title="Edit Profil Barber"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Hapus data barber "${b.name}"?`)) {
                      onDeleteBarber(b.id);
                    }
                  }}
                  className="p-2 rounded-sm bg-red-950/40 hover:bg-red-600 text-red-400 hover:text-white border border-red-800/80 transition-colors cursor-pointer"
                  title="Hapus Barber"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Barber Modal */}
      {(isNew || editingBarber) && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#161616] border border-white/15 rounded-sm p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                {isNew ? 'Tambah Barber Baru' : `Edit Barber: ${editingBarber?.name}`}
              </h3>
              <button
                onClick={() => {
                  setIsNew(false);
                  setEditingBarber(null);
                }}
                className="w-8 h-8 rounded-sm bg-[#0D0D0D] border border-white/10 text-gray-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Photo Upload via File Picker */}
              <ImageUploadField
                label="Foto Profil Barber"
                value={photoUrl}
                onChange={(val) => setPhotoUrl(val)}
                aspectRatio="square"
                placeholder="Pilih foto portrait barber dari HP / galeri"
                helperText="Upload langsung dari galeri HP atau kamera. Tersimpan otomatis."
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-300 font-bold block mb-1">
                    Nama Lengkap <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs focus:outline-none focus:border-white font-medium"
                  />
                </div>

                <div>
                  <label className="text-gray-300 font-bold block mb-1">Role / Jabatan</label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Master Barber"
                    className="w-full px-3.5 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-300 font-bold block mb-1">No. WhatsApp</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-3.5 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs focus:outline-none focus:border-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-gray-300 font-bold block mb-1">Rating Bintang</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(parseFloat(e.target.value) || 4.9)}
                    className="w-full px-3.5 py-2 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-300 font-bold block mb-1">
                  Spesialisasi & Tag (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={specsText}
                  onChange={(e) => setSpecsText(e.target.value)}
                  placeholder="Low Fade, Taper, Beard Shave"
                  className="w-full px-3.5 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="text-gray-300 font-bold block mb-1">Bio Singkat</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs focus:outline-none focus:border-white"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded-sm border-white/20 text-white accent-white"
                  />
                  <span className="text-gray-300 font-semibold">Barber Aktif</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAvailableToday}
                    onChange={(e) => setIsAvailableToday(e.target.checked)}
                    className="rounded-sm border-white/20 text-white accent-white"
                  />
                  <span className="text-gray-300 font-semibold">On Duty Hari Ini</span>
                </label>
              </div>

              <div className="pt-3 border-t border-white/10 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsNew(false);
                    setEditingBarber(null);
                  }}
                  className="flex-1 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-gray-300 font-bold text-xs hover:bg-[#202020] cursor-pointer"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-sm bg-white hover:bg-gray-200 text-black font-black uppercase tracking-wider text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                      <span>MENYIMPAN...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-black" />
                      <span>SIMPAN BARBER</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
