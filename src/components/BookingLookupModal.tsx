import React, { useState } from 'react';
import {
  X,
  Search,
  Calendar,
  Clock,
  User,
  Scissors,
  CheckCircle,
  AlertCircle,
  XCircle,
  Star,
  MessageCircle,
  RotateCcw,
  Loader2,
  Phone,
} from 'lucide-react';
import { Booking } from '../types';
import { lookupBooking, cancelBooking, submitReview } from '../api/client';
import { formatRupiah, formatDateIndo, generateWhatsAppMessage } from '../utils/format';

interface BookingLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber?: string;
  onRebook: (serviceId: string, barberId: string) => void;
}

export const BookingLookupModal: React.FC<BookingLookupModalProps> = ({
  isOpen,
  onClose,
  whatsappNumber = '085271211746',
  onRebook,
}) => {
  const [bookingCode, setBookingCode] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);

  // Cancellation State
  const [cancelling, setCancelling] = useState(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState<string | null>(null);
  const [cancelErrorMsg, setCancelErrorMsg] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Review State
  const [rating, setRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!bookingCode.trim()) {
      setErrorMsg('Masukkan kode booking (Contoh: RAISE-8F42K)');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setCancelSuccessMsg(null);
    setCancelErrorMsg(null);
    try {
      const res = await lookupBooking(bookingCode.trim(), phone.trim() || undefined);
      setBooking(res.booking);
    } catch (err: any) {
      setErrorMsg(err.message || 'Booking tidak ditemukan');
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    setCancelling(true);
    setCancelErrorMsg(null);
    try {
      const res = await cancelBooking(booking.id, phone.trim() || undefined, 'Dibatalkan oleh pelanggan');
      setBooking(res.booking);
      setCancelSuccessMsg('Booking Anda berhasil dibatalkan.');
      setShowCancelConfirm(false);
    } catch (err: any) {
      setCancelErrorMsg(err.message || 'Gagal membatalkan booking.');
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    setSubmittingReview(true);
    try {
      await submitReview(booking.id, rating, reviewComment, booking.customerName);
      setReviewSuccessMsg('Terima kasih! Ulasan Anda telah berhasil dikirim.');
      booking.hasReviewed = true;
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengirim ulasan.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="px-3 py-1 rounded-sm bg-white/10 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider">
            <CheckCircle className="w-3.5 h-3.5" />
            CONFIRMED
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-3 py-1 rounded-sm bg-white/10 border border-white/20 text-gray-300 text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider">
            <CheckCircle className="w-3.5 h-3.5" />
            COMPLETED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 rounded-sm bg-red-950/80 border border-red-700/80 text-red-400 text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider">
            <XCircle className="w-3.5 h-3.5" />
            CANCELLED
          </span>
        );
      case 'NO_SHOW':
        return (
          <span className="px-3 py-1 rounded-sm bg-white/5 border border-white/10 text-gray-400 text-xs font-bold uppercase tracking-wider">
            NO-SHOW
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-sm bg-white/10 border border-white/20 text-gray-300 text-xs font-bold uppercase tracking-wider">
            PENDING
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0D0D0D] border border-white/10 rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Topbar */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#161616]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 block">
              Self-Service Customer Portal
            </span>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">
              CHECK MY BOOKING
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-sm bg-white/5 border border-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Lookup Form */}
          <form onSubmit={handleLookup} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">
                  Kode Booking <span className="text-white">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="RAISE-XXXXX"
                  value={bookingCode}
                  onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-sm bg-[#161616] border border-white/10 text-white text-sm font-mono uppercase focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">
                  Nomor WhatsApp <span className="text-gray-500">(Verifikasi)</span>
                </label>
                <input
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-sm bg-[#161616] border border-white/10 text-white text-sm focus:outline-none focus:border-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-sm bg-white hover:bg-gray-200 text-black font-black uppercase tracking-widest text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>MENCARI BOOKING...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-black" />
                  <span>CEK STATUS RESERVASI</span>
                </>
              )}
            </button>
          </form>

          {errorMsg && (
            <div className="p-4 rounded-sm bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {cancelSuccessMsg && (
            <div className="p-4 rounded-sm bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{cancelSuccessMsg}</span>
            </div>
          )}

          {/* Booking Result View */}
          {booking && (
            <div className="p-5 rounded-sm bg-[#161616] border border-white/10 space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">
                    Kode Booking
                  </span>
                  <span className="text-xl font-mono font-black text-white">
                    {booking.bookingCode}
                  </span>
                </div>
                <div>{getStatusBadge(booking.status)}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 block">Nama Customer:</span>
                  <span className="font-bold text-white">{booking.customerName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">No. WhatsApp:</span>
                  <span className="font-bold text-white">{booking.customerPhone}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Layanan:</span>
                  <span className="font-bold text-white">{booking.serviceName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Barber:</span>
                  <span className="font-bold text-white">{booking.barberName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Tanggal:</span>
                  <span className="font-bold text-white">{formatDateIndo(booking.date)}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Jam Appointment:</span>
                  <span className="font-bold text-white">{booking.startTime} - {booking.endTime} WIB</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Total Biaya:</span>
                  <span className="font-black text-white">{formatRupiah(booking.finalPrice)}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Status Pembayaran:</span>
                  <span className="font-semibold text-gray-300">{booking.paymentStatus}</span>
                </div>
              </div>

              {booking.notes && (
                <p className="text-xs text-gray-400 pt-2 border-t border-white/10">
                  <span className="font-medium text-gray-300">Catatan:</span> {booking.notes}
                </p>
              )}

              {/* Action Buttons based on status */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                {/* Rebook Button */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onRebook(booking.serviceId, booking.barberId);
                  }}
                  className="w-full py-2.5 px-4 rounded-sm bg-white hover:bg-gray-200 text-black text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-black" />
                  <span>BOOK AGAIN (Gunakan Layanan & Barber Ini)</span>
                </button>

                {/* Cancel Booking Section (if CONFIRMED / PENDING) */}
                {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && (
                  <div>
                    {!showCancelConfirm ? (
                      <button
                        type="button"
                        onClick={() => setShowCancelConfirm(true)}
                        className="w-full py-2 text-center text-xs text-gray-400 hover:text-red-400 font-semibold underline cursor-pointer transition-colors"
                      >
                        Batalkan Reservasi Ini
                      </button>
                    ) : (
                      <div className="p-3 rounded-sm bg-red-950/30 border border-red-800/50 space-y-2">
                        <p className="text-xs text-red-300">
                          Apakah Anda yakin ingin membatalkan booking {booking.bookingCode}? (Pembatalan hanya berlaku min. 2 jam sebelum jadwal).
                        </p>
                        {cancelErrorMsg && (
                          <p className="text-xs text-red-400 font-bold">{cancelErrorMsg}</p>
                        )}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={cancelling}
                            onClick={handleCancelBooking}
                            className="flex-1 py-2 rounded-sm bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                          >
                            {cancelling ? 'Membatalkan...' : 'Ya, Batalkan Booking'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowCancelConfirm(false)}
                            className="px-3 py-2 rounded-sm bg-white/10 text-gray-300 text-xs"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Review Prompt if COMPLETED */}
                {booking.status === 'COMPLETED' && !booking.hasReviewed && (
                  <div className="pt-3 border-t border-white/10 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
                      Bagaimana Pengalaman Anda? (Beri Ulasan)
                    </span>
                    <form onSubmit={handleSubmitReview} className="space-y-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="p-1 cursor-pointer"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= rating
                                  ? 'fill-white text-white'
                                  : 'text-gray-600'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Tulis ulasan Anda untuk barber..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full px-3 py-2 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs focus:outline-none focus:border-white"
                      />
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="px-4 py-2 rounded-sm bg-white text-black hover:bg-gray-200 text-xs font-black uppercase tracking-widest transition-colors cursor-pointer"
                      >
                        {submittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
                      </button>
                    </form>
                  </div>
                )}

                {reviewSuccessMsg && (
                  <p className="text-xs text-emerald-400 font-semibold">{reviewSuccessMsg}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
