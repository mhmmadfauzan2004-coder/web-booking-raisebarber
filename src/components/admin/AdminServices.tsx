import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Clock, Scissors, Sparkles, Check, X, Loader2 } from 'lucide-react';
import { Service, ServiceCategory } from '../../types';
import { formatRupiah } from '../../utils/format';
import { ImageUploadField } from '../common/ImageUploadField';

interface AdminServicesProps {
  services: Service[];
  categories: ServiceCategory[];
  onSaveService: (service: Partial<Service>) => Promise<void>;
  onDeleteService: (id: string) => Promise<void>;
}

export const AdminServices: React.FC<AdminServicesProps> = ({
  services,
  categories,
  onSaveService,
  onDeleteService,
}) => {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isNew, setIsNew] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Form states
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-1');
  const [price, setPrice] = useState<number>(65000);
  const [duration, setDuration] = useState<number>(45);
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [featured, setFeatured] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(true);

  const openAdd = () => {
    setEditingService(null);
    setIsNew(true);
    setName('');
    setCategoryId(categories[0]?.id || 'cat-1');
    setPrice(65000);
    setDuration(45);
    setDescription('Layanan potong rambut presisi, cuci rambut, pijat kepala rileks, dan styling pomade.');
    setPhotoUrl('https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&auto=format&fit=crop&q=80');
    setFeatured(false);
    setIsActive(true);
  };

  const openEdit = (s: Service) => {
    setEditingService(s);
    setIsNew(false);
    setName(s.name);
    setCategoryId(s.categoryId);
    setPrice(s.price);
    setDuration(s.duration);
    setDescription(s.description);
    setPhotoUrl(s.photoUrl);
    setFeatured(s.featured || false);
    setIsActive(s.isActive);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const selectedCat = categories.find((c) => c.id === categoryId);
      await onSaveService({
        id: editingService ? editingService.id : undefined,
        name: name.trim(),
        categoryId,
        categoryName: selectedCat ? selectedCat.name : 'HAIRCUT',
        price: Number(price),
        duration: Number(duration),
        description: description.trim(),
        photoUrl: photoUrl.trim(),
        featured,
        isActive,
      });
      setIsNew(false);
      setEditingService(null);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan layanan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            SERVICES & PRICING MANAGEMENT
          </h2>
          <p className="text-xs text-gray-400">
            Kelola katalog layanan haircut, grooming, durasi waktu, dan tarif Rupiah ({services.length} paket)
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-sm bg-white hover:bg-gray-200 text-black text-xs font-black uppercase tracking-wider shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>+ TAMBAH LAYANAN BARU</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((s) => (
          <div
            key={s.id}
            className="p-5 rounded-sm bg-[#161616] border border-white/10 flex flex-col justify-between space-y-4 shadow-xl hover:border-white/20 transition-all"
          >
            <div className="space-y-3">
              <div className="relative h-44 rounded-sm overflow-hidden bg-[#0D0D0D] border border-white/10">
                <img
                  src={s.photoUrl}
                  alt={s.name}
                  className="w-full h-full object-cover filter brightness-90"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 left-2 bg-black/80 px-2.5 py-1 rounded-sm text-[10px] font-bold text-white flex items-center gap-1 border border-white/10">
                  <Clock className="w-3 h-3 text-white" />
                  <span>{s.duration} Menit</span>
                </div>
                {s.featured && (
                  <div className="absolute top-2 right-2 bg-white text-black px-2 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-wider shadow-sm">
                    Featured
                  </div>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">
                  {s.categoryName}
                </span>
                <h3 className="text-base font-bold text-white leading-snug">{s.name}</h3>
                <p className="text-xs text-gray-400 line-clamp-2 mt-1">{s.description}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Tarif</span>
                <span className="text-base font-black text-white">{formatRupiah(s.price)}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(s)}
                  className="p-2 rounded-sm bg-[#0D0D0D] hover:bg-white hover:text-black border border-white/10 text-gray-300 transition-colors cursor-pointer"
                  title="Edit Layanan"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Hapus layanan "${s.name}"?`)) {
                      onDeleteService(s.id);
                    }
                  }}
                  className="p-2 rounded-sm bg-red-950/40 hover:bg-red-600 text-red-400 hover:text-white border border-red-800/80 transition-colors cursor-pointer"
                  title="Hapus Layanan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add / Edit Service */}
      {(isNew || editingService) && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#161616] border border-white/15 rounded-sm p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                {isNew ? 'Tambah Layanan Baru' : `Edit Layanan: ${editingService?.name}`}
              </h3>
              <button
                onClick={() => {
                  setIsNew(false);
                  setEditingService(null);
                }}
                className="w-8 h-8 rounded-sm bg-[#0D0D0D] border border-white/10 text-gray-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Photo Upload via File Picker */}
              <ImageUploadField
                label="Foto Layanan Haircut / Treatment"
                value={photoUrl}
                onChange={(val) => setPhotoUrl(val)}
                aspectRatio="video"
                placeholder="Pilih foto model potongan / layanan dari HP / galeri"
                helperText="Upload langsung dari perangkat. Tersimpan sebagai Data URL otomatis."
              />

              <div>
                <label className="text-gray-300 font-bold block mb-1">
                  Nama Layanan <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Signature Gentleman Cut"
                  className="w-full px-3.5 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs focus:outline-none focus:border-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-300 font-bold block mb-1">Kategori</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs focus:outline-none focus:border-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gray-300 font-bold block mb-1">Durasi (Menit)</label>
                  <input
                    type="number"
                    required
                    step="5"
                    min="15"
                    max="180"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
                    className="w-full px-3 py-2 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-300 font-bold block mb-1">
                  Tarif Harga (IDR) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  step="5000"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-gray-500">{formatRupiah(price)}</span>
              </div>

              <div>
                <label className="text-gray-300 font-bold block mb-1">Deskripsi Lengkap</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                  <span className="text-gray-300 font-semibold">Layanan Aktif</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded-sm border-white/20 text-white accent-white"
                  />
                  <span className="text-gray-300 font-semibold">Featured / Rekomendasi</span>
                </label>
              </div>

              <div className="pt-3 border-t border-white/10 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsNew(false);
                    setEditingService(null);
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
                      <span>SIMPAN LAYANAN</span>
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

