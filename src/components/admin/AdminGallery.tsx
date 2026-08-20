import React, { useState } from 'react';
import { Plus, Trash2, Image as ImageIcon, Sparkles, X, Check, Loader2 } from 'lucide-react';
import { GalleryItem, Barber } from '../../types';
import { ImageUploadField } from '../common/ImageUploadField';

interface AdminGalleryProps {
  gallery: GalleryItem[];
  barbers: Barber[];
  onAddPhoto: (item: Omit<GalleryItem, 'id' | 'createdAt'>) => Promise<void>;
  onDeletePhoto: (id: string) => Promise<void>;
}

export const AdminGallery: React.FC<AdminGalleryProps> = ({
  gallery,
  barbers,
  onAddPhoto,
  onDeletePhoto,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Fade');
  const [imageUrl, setImageUrl] = useState('');
  const [barberId, setBarberId] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = ['Fade', 'Crop', 'Classic', 'Texture', 'Styling', 'Shave', 'Barbershop'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      alert('Silakan pilih atau upload foto lookbook terlebih dahulu');
      return;
    }
    setLoading(true);
    try {
      const selectedBarber = barbers.find((b) => b.id === barberId);
      await onAddPhoto({
        title: title.trim(),
        category,
        imageUrl: imageUrl.trim(),
        barberId: barberId || undefined,
        barberName: selectedBarber ? selectedBarber.name : undefined,
      });
      setShowAddModal(false);
      setTitle('');
      setImageUrl('');
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan foto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            GALLERY & LOOKBOOK MANAGEMENT
          </h2>
          <p className="text-xs text-gray-400">
            Admin dapat mengganti seluruh foto portfolio haircut, tagging barber, dan kategori ({gallery.length} foto)
          </p>
        </div>

        <button
          onClick={() => {
            setTitle('');
            setImageUrl('');
            setBarberId(barbers[0]?.id || '');
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-sm bg-white hover:bg-gray-200 text-black text-xs font-black uppercase tracking-wider shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>+ UPLOAD FOTO LOOKBOOK</span>
        </button>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {gallery.map((item) => (
          <div
            key={item.id}
            className="group relative h-64 rounded-sm overflow-hidden bg-[#161616] border border-white/10 shadow-lg flex flex-col justify-between"
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 filter brightness-90"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

            <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-sm text-[10px] font-bold text-white border border-white/15">
              {item.category}
            </div>

            <button
              onClick={() => {
                if (window.confirm(`Hapus foto "${item.title}" dari lookbook?`)) {
                  onDeletePhoto(item.id);
                }
              }}
              className="absolute top-2 right-2 p-1.5 rounded-sm bg-red-950/80 hover:bg-red-600 text-red-400 hover:text-white transition-colors cursor-pointer"
              title="Hapus Foto"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <div className="absolute bottom-0 inset-x-0 p-3 space-y-0.5">
              <h4 className="text-xs font-bold text-white leading-tight truncate">
                {item.title}
              </h4>
              {item.barberName && (
                <p className="text-[10px] text-gray-400">By {item.barberName}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Photo Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#161616] border border-white/15 rounded-sm p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                Upload Foto Lookbook
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-sm bg-[#0D0D0D] border border-white/10 text-gray-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Image Upload File Picker */}
              <ImageUploadField
                label="Pilih Foto dari Galeri / Kamera"
                value={imageUrl}
                onChange={(val) => setImageUrl(val)}
                aspectRatio="square"
                placeholder="Upload foto haircut portfolio dari HP"
                helperText="Upload langsung tanpa perlu hosting URL."
              />

              <div>
                <label className="text-gray-300 font-bold block mb-1">
                  Judul / Style Haircut <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Low Taper Fade Sharp Line"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs focus:outline-none focus:border-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-300 font-bold block mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs focus:outline-none focus:border-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gray-300 font-bold block mb-1">Barber Stylist</label>
                  <select
                    value={barberId}
                    onChange={(e) => setBarberId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs focus:outline-none focus:border-white"
                  >
                    <option value="">Semua Barber / Generic</option>
                    {barbers.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
                      <span>MENGUPLOAD...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-black" />
                      <span>SIMPAN KE LOOKBOOK</span>
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
