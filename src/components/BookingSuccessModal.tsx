import React, { useEffect } from 'react';
import {
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Scissors,
  Share2,
  Download,
  RotateCcw,
  X,
  MessageCircle,
  Copy,
  Check,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { Booking } from '../types';
import {
  formatRupiah,
  formatDateIndo,
  generateWhatsAppMessage,
  downloadCalendarICS,
} from '../utils/format';

interface BookingSuccessModalProps {
  booking: Booking | null;
  whatsappNumber?: string;
  onClose: () => void;
  onBookAgain: () => void;
  onOpenLookup: () => void;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  booking,
  whatsappNumber = '085271211746',
  onClose,
  onBookAgain,
  onOpenLookup,
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (booking) {
      // Fire confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#fbbf24', '#ffffff', '#10b981'],
        });
      } catch (e) {
        // ignore if not supported
      }
    }
  }, [booking]);

  if (!booking) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(booking.bookingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const waUrl = generateWhatsAppMessage(booking, whatsappNumber);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-lg bg-[#0D0D0D] border border-white/10 rounded-sm shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-sm bg-white/5 border border-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Celebration Icon */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-sm bg-white/10 border border-white/20 text-white flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">
            Reservasi Berhasil
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            BOOKING CONFIRMED
          </h2>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            Kursi Anda telah berhasil direservasi. Silakan simpan kode booking berikut.
          </p>
        </div>

        {/* Booking Code Banner & QR Code */}
        <div className="p-5 rounded-sm bg-[#161616] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block">
              Unique Booking Code
            </span>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-2xl font-mono font-black text-white tracking-wider">
                {booking.bookingCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded-sm bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Salin Kode"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copied && (
              <span className="text-[10px] text-emerald-400 font-semibold block">
                Kode berhasil disalin!
              </span>
            )}
          </div>

          <div className="p-2 rounded-sm bg-white shrink-0 shadow-md">
            <QRCodeSVG value={booking.bookingCode} size={64} />
          </div>
        </div>

        {/* Booking Details Grid */}
        <div className="p-4 rounded-sm bg-[#161616] border border-white/10 space-y-2.5 text-xs">
          <div className="flex justify-between pb-2 border-b border-white/10">
            <span className="text-gray-400">Nama Pelanggan:</span>
            <span className="font-bold text-white">{booking.customerName}</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-white/10">
            <span className="text-gray-400">Layanan:</span>
            <span className="font-bold text-white">{booking.serviceName}</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-white/10">
            <span className="text-gray-400">Barber:</span>
            <span className="font-bold text-white">{booking.barberName}</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-white/10">
            <span className="text-gray-400">Jadwal:</span>
            <span className="font-bold text-white">
              {formatDateIndo(booking.date)} &bull; {booking.startTime} WIB
            </span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-gray-400">Total Biaya:</span>
            <span className="text-base font-black text-white">
              {formatRupiah(booking.finalPrice)}
            </span>
          </div>
        </div>

        {/* WhatsApp & Actions Buttons */}
        <div className="space-y-2.5 pt-1">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-sm bg-white text-black hover:bg-gray-200 font-black uppercase tracking-widest text-xs shadow-md transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-black" />
            <span>CONFIRM VIA WHATSAPP</span>
          </a>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => downloadCalendarICS(booking)}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-sm bg-[#161616] hover:bg-white/10 text-gray-200 border border-white/10 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>ADD TO CALENDAR</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenLookup();
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-sm bg-[#161616] hover:bg-white/10 text-gray-200 border border-white/10 text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>STATUS / BATALKAN</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onBookAgain();
            }}
            className="w-full py-2.5 text-center text-xs text-gray-400 hover:text-white font-bold uppercase tracking-widest cursor-pointer"
          >
            + BOOKING JADWAL LAIN (BOOK AGAIN)
          </button>
        </div>
      </div>
    </div>
  );
};
