import React, { useState } from 'react';
import {
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Scissors,
  MessageCircle,
  Plus,
  RotateCcw,
  AlertCircle,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { Booking, Barber, Service } from '../../types';
import { formatRupiah, formatDateIndo, generateWhatsAppMessage } from '../../utils/format';

interface AdminBookingsProps {
  bookings: Booking[];
  barbers: Barber[];
  services: Service[];
  onUpdateStatus: (id: string, status: Booking['status']) => Promise<void>;
  onCreateManualBooking: (data: any) => Promise<void>;
}

export const AdminBookings: React.FC<AdminBookingsProps> = ({
  bookings,
  barbers,
  services,
  onUpdateStatus,
  onCreateManualBooking,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [barberFilter, setBarberFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL'); // ALL, TODAY, TOMORROW, CUSTOM
  const [customDate, setCustomDate] = useState<string>('');

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showWalkInModal, setShowWalkInModal] = useState<boolean>(false);

  // Walk-in modal state
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInServiceId, setWalkInServiceId] = useState(services[0]?.id || '');
  const [walkInBarberId, setWalkInBarberId] = useState(barbers[0]?.id || 'any');
  const [walkInDate, setWalkInDate] = useState(new Date().toISOString().split('T')[0]);
  const [walkInTime, setWalkInTime] = useState('14:00');
  const [walkInNotes, setWalkInNotes] = useState('');
  const [submittingWalkIn, setSubmittingWalkIn] = useState(false);
  const [walkInError, setWalkInError] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // Filtering Logic
  const filteredBookings = bookings.filter((b) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = b.customerName.toLowerCase().includes(q);
      const matchCode = b.bookingCode.toLowerCase().includes(q);
      const matchPhone = b.customerPhone.includes(q);
      if (!matchName && !matchCode && !matchPhone) return false;
    }

    // Status
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;

    // Barber
    if (barberFilter !== 'ALL' && b.barberId !== barberFilter) return false;

    // Date
    if (dateFilter === 'TODAY' && b.date !== todayStr) return false;
    if (dateFilter === 'TOMORROW' && b.date !== tomorrowStr) return false;
    if (dateFilter === 'CUSTOM' && customDate && b.date !== customDate) return false;

    return true;
  });

  const handleCreateWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName || !walkInPhone) {
      setWalkInError('Nama dan nomor telepon wajib diisi');
      return;
    }

    setSubmittingWalkIn(true);
    setWalkInError(null);
    try {
      await onCreateManualBooking({
        serviceId: walkInServiceId,
        barberId: walkInBarberId,
        date: walkInDate,
        startTime: walkInTime,
        customerName: walkInName,
        customerPhone: walkInPhone,
        notes: walkInNotes ? `[Manual/Walk-in] ${walkInNotes}` : '[Manual/Walk-in]',
      });
      setShowWalkInModal(false);
      setWalkInName('');
      setWalkInPhone('');
      setWalkInNotes('');
    } catch (err: any) {
      setWalkInError(err.message || 'Gagal membuat walk-in booking');
    } finally {
      setSubmittingWalkIn(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            BOOKING MANAGEMENT
          </h2>
          <p className="text-xs text-zinc-400">
            Daftar seluruh reservasi pelanggan Raise Barbershop Dumai ({filteredBookings.length} data)
          </p>
        </div>

        <button
          onClick={() => setShowWalkInModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ INPUT WALK-IN / TELPON</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Cari kode, nama, No. WA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-amber-500"
            />
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-amber-500 font-medium"
          >
            <option value="ALL">Semua Status</option>
            <option value="CONFIRMED">CONFIRMED (Terkonfirmasi)</option>
            <option value="COMPLETED">COMPLETED (Selesai)</option>
            <option value="CANCELLED">CANCELLED (Dibatalkan)</option>
            <option value="NO_SHOW">NO-SHOW (Tidak Hadir)</option>
          </select>

          {/* Barber Filter */}
          <select
            value={barberFilter}
            onChange={(e) => setBarberFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-amber-500 font-medium"
          >
            <option value="ALL">Semua Barber</option>
            {barbers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Date Filter Tabs */}
          <div className="flex gap-1.5">
            <button
              onClick={() => setDateFilter('ALL')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold ${
                dateFilter === 'ALL'
                  ? 'bg-amber-400 text-zinc-950'
                  : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setDateFilter('TODAY')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold ${
                dateFilter === 'TODAY'
                  ? 'bg-amber-400 text-zinc-950'
                  : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setDateFilter('TOMORROW')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold ${
                dateFilter === 'TOMORROW'
                  ? 'bg-amber-400 text-zinc-950'
                  : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
              }`}
            >
              Besok
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Table / Card View */}
      <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/80 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-800">
              <tr>
                <th className="px-5 py-4">Kode & Pelanggan</th>
                <th className="px-5 py-4">Layanan & Barber</th>
                <th className="px-5 py-4">Jadwal & Waktu</th>
                <th className="px-5 py-4">Total Biaya</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-zinc-500">
                    Tidak ada data reservasi yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const cleanWA = b.customerPhone.replace(/\D/g, '').replace(/^0/, '62');
                  return (
                    <tr key={b.id} className="hover:bg-zinc-800/40 transition-colors">
                      {/* Code & Customer */}
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-amber-400 text-xs">
                            {b.bookingCode}
                          </span>
                          <p className="font-bold text-white text-sm">{b.customerName}</p>
                          <a
                            href={`https://wa.me/${cleanWA}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-zinc-400 hover:text-emerald-400 flex items-center gap-1"
                          >
                            <MessageCircle className="w-3 h-3 text-emerald-500" />
                            <span>{b.customerPhone}</span>
                          </a>
                        </div>
                      </td>

                      {/* Service & Barber */}
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-white">{b.serviceName}</p>
                          <span className="text-[11px] text-amber-400/90 font-medium flex items-center gap-1">
                            <Scissors className="w-3 h-3" />
                            {b.barberName}
                          </span>
                          {b.notes && (
                            <p className="text-[10px] text-zinc-400 italic line-clamp-1">
                              &ldquo;{b.notes}&rdquo;
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Schedule */}
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <span className="text-zinc-200 font-semibold">
                            {formatDateIndo(b.date)}
                          </span>
                          <p className="text-amber-400 font-bold text-xs">
                            {b.startTime} - {b.endTime} WIB
                          </p>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-4">
                        <span className="font-bold text-white text-sm">
                          {formatRupiah(b.finalPrice)}
                        </span>
                        {b.promoDiscount ? (
                          <span className="block text-[10px] text-emerald-400">
                            Diskon {formatRupiah(b.promoDiscount)}
                          </span>
                        ) : null}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            b.status === 'CONFIRMED'
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                              : b.status === 'COMPLETED'
                              ? 'bg-blue-950/80 text-blue-400 border border-blue-800'
                              : b.status === 'CANCELLED'
                              ? 'bg-red-950/80 text-red-400 border border-red-800'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.status === 'CONFIRMED' && (
                            <>
                              <button
                                onClick={() => onUpdateStatus(b.id, 'COMPLETED')}
                                className="p-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-800/80 transition-colors"
                                title="Tandai Selesai (Completed)"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onUpdateStatus(b.id, 'NO_SHOW')}
                                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                                title="Tandai No-Show"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onUpdateStatus(b.id, 'CANCELLED')}
                                className="p-2 rounded-lg bg-red-950/80 hover:bg-red-600 text-red-400 hover:text-white border border-red-800/80 transition-colors"
                                title="Batalkan Booking"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          <a
                            href={`https://wa.me/${cleanWA}?text=${encodeURIComponent(
                              `Halo ${b.customerName}, kami dari Raise Barbershop Dumai mengonfirmasi jadwal potong rambut Anda (${b.serviceName}) pada ${formatDateIndo(b.date)} pukul ${b.startTime} WIB bersama ${b.barberName}. Kode booking: ${b.bookingCode}. Terima kasih!`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-zinc-800 hover:bg-emerald-600 text-zinc-300 hover:text-white transition-colors"
                            title="Kirim Pesan WhatsApp Konfirmasi"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Walk-In Booking Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">
                Input Walk-in / Phone Booking
              </h3>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="w-8 h-8 rounded-full bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {walkInError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs">
                {walkInError}
              </div>
            )}

            <form onSubmit={handleCreateWalkIn} className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-300 font-bold block mb-1">Nama Customer *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap"
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-bold block mb-1">No. WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="08xxxxxxxxxx"
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-bold block mb-1">Layanan</label>
                  <select
                    value={walkInServiceId}
                    onChange={(e) => setWalkInServiceId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({formatRupiah(s.price)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-zinc-300 font-bold block mb-1">Barber</label>
                  <select
                    value={walkInBarberId}
                    onChange={(e) => setWalkInBarberId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs"
                  >
                    <option value="any">⚡ Any Barber</option>
                    {barbers.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-bold block mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={walkInDate}
                    onChange={(e) => setWalkInDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-bold block mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    value={walkInTime}
                    onChange={(e) => setWalkInTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-300 font-bold block mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  placeholder="Catatan walk-in..."
                  value={walkInNotes}
                  onChange={(e) => setWalkInNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingWalkIn}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold"
                >
                  {submittingWalkIn ? 'Menyimpan...' : 'Simpan Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
