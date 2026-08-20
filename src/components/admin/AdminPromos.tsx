import React, { useState } from 'react';
import { Plus, Trash2, Tag, Percent, DollarSign, Check, X } from 'lucide-react';
import { PromoCode } from '../../types';
import { formatRupiah } from '../../utils/format';

interface AdminPromosProps {
  promos: PromoCode[];
  onSavePromo: (promo: Partial<PromoCode>) => Promise<void>;
  onDeletePromo: (id: string) => Promise<void>;
}

export const AdminPromos: React.FC<AdminPromosProps> = ({
  promos,
  onSavePromo,
  onDeletePromo,
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('FIXED');
  const [discountValue, setDiscountValue] = useState<number>(10000);
  const [minOrder, setMinOrder] = useState<number>(0);
  const [maxDiscount, setMaxDiscount] = useState<number>(10000);
  const [maxUsage, setMaxUsage] = useState<number>(100);
  const [validUntil, setValidUntil] = useState('2026-12-31');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSavePromo({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        discountType,
        discountValue: Number(discountValue),
        minOrder: Number(minOrder),
        maxDiscount: discountType === 'PERCENTAGE' ? Number(maxDiscount) : undefined,
        maxUsage: Number(maxUsage),
        validUntil,
        isActive: true,
      });
      setShowAdd(false);
      setCode('');
      setName('');
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan promo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            PROMO CODES & DISCOUNTS
          </h2>
          <p className="text-xs text-zinc-400">
            Buat kode kupon diskon persentase atau potongan nominal untuk pelanggan ({promos.length} promo)
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold uppercase tracking-wider shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ BUAT KODE PROMO</span>
        </button>
      </div>

      {/* Promos Table */}
      <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-950/80 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-800">
            <tr>
              <th className="px-5 py-4">Kode & Nama</th>
              <th className="px-5 py-4">Tipe & Nilai Diskon</th>
              <th className="px-5 py-4">Min. Pembelian</th>
              <th className="px-5 py-4">Penggunaan</th>
              <th className="px-5 py-4">Berlaku Hingga</th>
              <th className="px-5 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-medium">
            {promos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-zinc-500">
                  Belum ada kode promo aktif.
                </td>
              </tr>
            ) : (
              promos.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-800/40">
                  <td className="px-5 py-4">
                    <span className="font-mono font-black text-amber-400 text-sm block">
                      {p.code}
                    </span>
                    <span className="text-zinc-400 text-[11px]">{p.name}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-emerald-400 font-bold">
                      {p.discountType === 'PERCENTAGE'
                        ? `${p.discountValue}% (Maks. ${formatRupiah(p.maxDiscount || 0)})`
                        : formatRupiah(p.discountValue)}
                    </span>
                  </td>
                  <td className="px-5 py-4">{formatRupiah(p.minOrder || 0)}</td>
                  <td className="px-5 py-4">
                    {p.usedCount} / {p.maxUsage} kali
                  </td>
                  <td className="px-5 py-4">{p.validUntil}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => onDeletePromo(p.id)}
                      className="p-2 rounded-lg bg-red-950/50 hover:bg-red-600 text-red-400 hover:text-white transition-colors"
                      title="Hapus Promo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Promo Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                Buat Kode Promo Baru
              </h3>
              <button
                onClick={() => setShowAdd(false)}
                className="w-8 h-8 rounded-full bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-bold block mb-1">Kode Promo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: RAISEDUMAI10"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-mono uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-bold block mb-1">Tipe Diskon</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs"
                  >
                    <option value="FIXED">Nominal Tetap (Rp)</option>
                    <option value="PERCENTAGE">Persentase (%)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-300 font-bold block mb-1">Nama Promo / Keterangan *</label>
                <input
                  type="text"
                  required
                  placeholder="Diskon Khusus Pelanggan Baru"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-bold block mb-1">
                    Nilai Diskon ({discountType === 'PERCENTAGE' ? '%' : 'Rp'}) *
                  </label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-bold block mb-1">Maks Kuota Penggunaan</label>
                  <input
                    type="number"
                    value={maxUsage}
                    onChange={(e) => setMaxUsage(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-bold block mb-1">Min. Pembelian (Rp)</label>
                  <input
                    type="number"
                    value={minOrder}
                    onChange={(e) => setMinOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-bold block mb-1">Berlaku Hingga</label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Promo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
