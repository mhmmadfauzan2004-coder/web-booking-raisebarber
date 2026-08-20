import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  User,
  Scissors,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Tag,
  AlertCircle,
  Sparkles,
  Phone,
  Mail,
  FileText,
  Loader2,
  Star,
} from 'lucide-react';
import { Service, Barber, ServiceCategory, TimeSlot, Booking, WebsiteSettings } from '../types';
import { fetchSlots, validatePromo, createBooking } from '../api/client';
import { formatRupiah, formatDateIndo } from '../utils/format';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  categories: ServiceCategory[];
  barbers: Barber[];
  settings?: WebsiteSettings;
  initialServiceId?: string;
  initialBarberId?: string;
  initialDate?: string;
  initialStartTime?: string;
  onBookingSuccess: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  services,
  categories,
  barbers,
  settings,
  initialServiceId,
  initialBarberId,
  initialDate,
  initialStartTime,
  onBookingSuccess,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Wizard Step: 1 = Service, 2 = Barber, 3 = Date & Time, 4 = Customer Info, 5 = Review & Confirm
  const [step, setStep] = useState<number>(1);

  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedBarberId, setSelectedBarberId] = useState<string>('any');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number; name: string } | null>(null);

  // Async States
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [validatingPromo, setValidatingPromo] = useState<boolean>(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Initialize or reset when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialServiceId) setSelectedServiceId(initialServiceId);
      else if (services.length > 0) setSelectedServiceId(services[0].id);

      if (initialBarberId) setSelectedBarberId(initialBarberId);
      else setSelectedBarberId('any');

      if (initialDate) setSelectedDate(initialDate);
      else setSelectedDate(todayStr);

      if (initialStartTime) setSelectedTime(initialStartTime);
      else setSelectedTime('');

      // Auto jump to step 3 if service, barber, date, time were pre-provided from Quick Widget
      if (initialServiceId && initialStartTime) {
        setStep(4);
      } else if (initialServiceId) {
        setStep(2);
      } else {
        setStep(1);
      }

      setSubmitError(null);
    }
  }, [isOpen, initialServiceId, initialBarberId, initialDate, initialStartTime, services]);

  // Load available slots whenever Date, Barber, or Service changes
  useEffect(() => {
    if (!isOpen || !selectedDate || !selectedServiceId) return;

    let isMounted = true;
    setLoadingSlots(true);
    setSlotsError(null);

    fetchSlots(selectedDate, selectedBarberId, selectedServiceId)
      .then((res) => {
        if (isMounted) {
          setSlots(res.slots);
          // If current selected time is no longer available in new slots, clear it
          const stillValid = res.slots.find((s) => s.time === selectedTime && s.available);
          if (!stillValid && selectedTime) {
            setSelectedTime('');
          }
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setSlotsError(err.message || 'Gagal memuat slot jam');
          setSlots([]);
        }
      })
      .finally(() => {
        if (isMounted) setLoadingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDate, selectedBarberId, selectedServiceId, isOpen]);

  if (!isOpen) return null;

  const currentService = services.find((s) => s.id === selectedServiceId) || services[0];
  const currentBarber = barbers.find((b) => b.id === selectedBarberId);

  const priceBeforeDiscount = currentService ? currentService.price : 0;
  const discountAmount = appliedPromo ? appliedPromo.discount : 0;
  const finalPrice = Math.max(0, priceBeforeDiscount - discountAmount);

  // Handle Promo Validation
  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return;
    setValidatingPromo(true);
    setPromoError(null);
    try {
      const res = await validatePromo(promoCodeInput.trim(), priceBeforeDiscount);
      setAppliedPromo({
        code: res.promoCode,
        discount: res.discountAmount,
        name: res.promoName,
      });
      setPromoCodeInput('');
    } catch (err: any) {
      setPromoError(err.message || 'Kode promo tidak valid');
    } finally {
      setValidatingPromo(false);
    }
  };

  // Submit Final Booking
  const handleConfirmBooking = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      setSubmitError('Nama lengkap dan nomor WhatsApp wajib diisi');
      return;
    }
    if (!selectedTime) {
      setSubmitError('Silakan pilih jam appointment');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await createBooking({
        serviceId: currentService.id,
        barberId: selectedBarberId,
        date: selectedDate,
        startTime: selectedTime,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        notes: notes.trim() || undefined,
        promoCode: appliedPromo?.code,
      });

      onBookingSuccess(res.booking);
    } catch (err: any) {
      setSubmitError(err.message || 'Booking gagal. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0D0D0D] border border-white/10 rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Topbar */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#161616]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 block">
              Step {step} of 5 &bull; Online Reservation
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
              {step === 1 && '1. Pilih Layanan Barbershop'}
              {step === 2 && '2. Pilih Barber'}
              {step === 3 && '3. Pilih Tanggal & Jam'}
              {step === 4 && '4. Informasi Pelanggan'}
              {step === 5 && '5. Konfirmasi Booking'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-sm bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Step Bar */}
        <div className="grid grid-cols-5 h-1 bg-[#161616]">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-full transition-all duration-300 ${
                s <= step ? 'bg-white' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: SELECT SERVICE */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-gray-400">
                Pilih paket grooming yang Anda inginkan. Harga dan durasi disajikan secara transparan.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {services.filter((s) => s.isActive).map((service) => {
                  const isSelected = selectedServiceId === service.id;
                  return (
                    <div
                      key={service.id}
                      onClick={() => setSelectedServiceId(service.id)}
                      className={`p-4 rounded-sm border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'bg-white/10 border-white shadow-md ring-1 ring-white'
                          : 'bg-[#161616] border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                            {service.categoryName}
                          </span>
                          <h4 className="text-sm font-bold text-white leading-snug">
                            {service.name}
                          </h4>
                        </div>
                        <div className="px-2 py-1 rounded-sm bg-[#0D0D0D] border border-white/10 text-[10px] font-semibold text-gray-300 flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3 text-white" />
                          <span>{service.duration} m</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                        {service.description}
                      </p>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                        <span className="text-sm font-black text-white">
                          {formatRupiah(service.price)}
                        </span>
                        {isSelected && (
                          <span className="text-xs font-bold text-white flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                            Dipilih
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: SELECT BARBER */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-xs text-gray-400">
                Pilih barber favorit Anda atau pilih &quot;Any Barber&quot; agar sistem mencarikan kursi yang paling cepat tersedia.
              </p>

              {/* Any Barber Card */}
              <div
                onClick={() => setSelectedBarberId('any')}
                className={`p-4 rounded-sm border transition-all cursor-pointer flex items-center justify-between ${
                  selectedBarberId === 'any'
                    ? 'bg-white/10 border-white shadow-md ring-1 ring-white'
                    : 'bg-[#161616] border-white/10 hover:border-white/30'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center text-white">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      ⚡ Any Barber (Paling Cepat / Otomatis)
                    </h4>
                    <p className="text-xs text-gray-400">
                      Sistem mencocokkan jadwal barber mana pun yang siap melayani Anda.
                    </p>
                  </div>
                </div>
                {selectedBarberId === 'any' && (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                )}
              </div>

              {/* Specific Barbers List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {barbers.filter((b) => b.isActive).map((barber) => {
                  const isSelected = selectedBarberId === barber.id;
                  return (
                    <div
                      key={barber.id}
                      onClick={() => setSelectedBarberId(barber.id)}
                      className={`p-3.5 rounded-sm border transition-all cursor-pointer flex items-center gap-3.5 ${
                        isSelected
                          ? 'bg-white/10 border-white shadow-md ring-1 ring-white'
                          : 'bg-[#161616] border-white/10 hover:border-white/30'
                      }`}
                    >
                      <img
                        src={barber.photoUrl}
                        alt={barber.name}
                        className="w-14 h-14 rounded-sm object-cover object-top border border-white/10 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white truncate">
                            {barber.name}
                          </h4>
                          <div className="flex items-center gap-0.5 text-xs text-white font-bold shrink-0">
                            <Star className="w-3 h-3 fill-white" />
                            <span>{barber.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-300 font-medium">
                          {barber.role}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">
                          {barber.specialization.slice(0, 2).join(', ')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: SELECT DATE & TIME */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Date Input Card */}
              <div className="p-4 rounded-sm bg-[#161616] border border-white/10 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-white" />
                  <span>Pilih Tanggal Appointment</span>
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-sm font-semibold focus:outline-none focus:border-white [color-scheme:dark]"
                />
                <p className="text-[11px] text-gray-400">
                  {selectedDate ? formatDateIndo(selectedDate) : ''}
                </p>
              </div>

              {/* Time Slots Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-white" />
                    <span>Slot Jam Tersedia ({slots.filter((s) => s.available).length} Slot)</span>
                  </span>
                  <span className="text-xs text-gray-400 font-semibold">
                    Durasi: {currentService?.duration || 45} Menit
                  </span>
                </div>

                {loadingSlots ? (
                  <div className="py-12 text-center text-gray-400 space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-white" />
                    <p className="text-xs">Menghitung ketersediaan slot real-time...</p>
                  </div>
                ) : slotsError ? (
                  <div className="p-4 rounded-sm bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{slotsError}</span>
                  </div>
                ) : slots.filter((s) => s.available).length === 0 ? (
                  <div className="p-8 rounded-sm bg-[#161616] border border-white/10 text-center space-y-2">
                    <AlertCircle className="w-8 h-8 text-white mx-auto" />
                    <p className="text-sm font-bold text-gray-200">
                      Sorry, semua slot pada waktu tersebut sudah penuh.
                    </p>
                    <p className="text-xs text-gray-400">
                      Silakan pilih tanggal lain atau ganti barber yang dipilih.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                    {slots.map((slot) => {
                      const isSelected = selectedTime === slot.time;
                      if (!slot.available) {
                        return (
                          <div
                            key={slot.time}
                            className="py-2.5 px-2 rounded-sm bg-[#0D0D0D] border border-white/5 text-gray-600 text-xs font-medium text-center line-through select-none cursor-not-allowed"
                            title={slot.reason || 'Penuh'}
                          >
                            {slot.time}
                          </div>
                        );
                      }

                      return (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => setSelectedTime(slot.time)}
                          className={`py-2.5 px-2 rounded-sm text-xs font-bold text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-white text-black shadow-md ring-2 ring-white scale-105'
                              : 'bg-[#161616] border border-white/10 hover:border-white/40 text-gray-200 hover:text-white'
                          }`}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: CUSTOMER INFORMATION & PROMO */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-xs text-gray-400">
                Isi data diri Anda untuk konfirmasi booking. Reservasi tidak memerlukan pembuatan akun (guest booking diizinkan).
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">
                    Nama Lengkap <span className="text-white">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Pratama"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 rounded-sm bg-[#161616] border border-white/10 text-white text-sm focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">
                    Nomor WhatsApp <span className="text-white">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="08xxxxxxxxxx"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-sm bg-[#161616] border border-white/10 text-white text-sm focus:outline-none focus:border-white"
                    />
                    <Phone className="w-4 h-4 text-gray-500 absolute right-3.5 top-3.5" />
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 block">
                    Konfirmasi dan kode booking akan dikirimkan melalui WhatsApp ini.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">
                    Email <span className="text-gray-500">(Opsional)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="nama@email.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-sm bg-[#161616] border border-white/10 text-white text-sm focus:outline-none focus:border-white"
                    />
                    <Mail className="w-4 h-4 text-gray-500 absolute right-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">
                    Catatan Khusus <span className="text-gray-500">(Opsional)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Mau low taper fade, rapikan kumis tipis..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-sm bg-[#161616] border border-white/10 text-white text-sm focus:outline-none focus:border-white"
                  />
                </div>

                {/* Promo Code Input */}
                <div className="pt-2">
                  <label className="text-xs font-bold text-gray-300 block mb-1 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-white" />
                    <span>Punya Kode Promo?</span>
                  </label>
                  {appliedPromo ? (
                    <div className="p-3 rounded-sm bg-white/10 border border-white/20 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">
                          {appliedPromo.code} &bull; Hemat {formatRupiah(appliedPromo.discount)}
                        </span>
                        <span className="text-[11px] text-gray-300">
                          {appliedPromo.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAppliedPromo(null)}
                        className="text-xs text-gray-400 hover:text-white underline font-semibold cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Contoh: RAISEBARBER10"
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                        className="flex-1 px-4 py-2.5 rounded-sm bg-[#161616] border border-white/10 text-white text-xs font-mono uppercase focus:outline-none focus:border-white"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={validatingPromo || !promoCodeInput.trim()}
                        className="px-4 py-2.5 rounded-sm bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {validatingPromo ? 'Cek...' : 'Terapkan'}
                      </button>
                    </div>
                  )}
                  {promoError && (
                    <p className="text-[11px] text-red-400 mt-1">{promoError}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & FINAL CONFIRMATION */}
          {step === 5 && (
            <div className="space-y-5">
              <div className="p-5 rounded-sm bg-[#161616] border border-white/10 space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400 block pb-2 border-b border-white/10">
                  Ringkasan Reservasi
                </span>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 block font-medium">Layanan:</span>
                    <span className="text-sm font-bold text-white">{currentService?.name}</span>
                    <span className="text-gray-400 block text-[11px]">Durasi: {currentService?.duration} Menit</span>
                  </div>

                  <div>
                    <span className="text-gray-400 block font-medium">Barber:</span>
                    <span className="text-sm font-bold text-white">
                      {selectedBarberId === 'any' ? '⚡ Any Available Barber' : currentBarber?.name}
                    </span>
                    <span className="text-gray-400 block text-[11px]">
                      {selectedBarberId === 'any' ? 'Ditentukan saat kedatangan' : currentBarber?.role}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block font-medium">Tanggal Appointment:</span>
                    <span className="text-sm font-bold text-white">{formatDateIndo(selectedDate)}</span>
                  </div>

                  <div>
                    <span className="text-gray-400 block font-medium">Jam Kedatangan:</span>
                    <span className="text-base font-black text-white">{selectedTime} WIB</span>
                  </div>

                  <div>
                    <span className="text-gray-400 block font-medium">Nama Pelanggan:</span>
                    <span className="text-xs font-bold text-white">{customerName}</span>
                  </div>

                  <div>
                    <span className="text-gray-400 block font-medium">No. WhatsApp:</span>
                    <span className="text-xs font-bold text-white">{customerPhone}</span>
                  </div>
                </div>

                {notes && (
                  <div className="pt-2 border-t border-white/10 text-xs">
                    <span className="text-gray-400 font-medium">Catatan Khusus: </span>
                    <span className="text-gray-200 italic">&ldquo;{notes}&rdquo;</span>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="pt-3 border-t border-white/10 space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-300">
                    <span>Harga Layanan</span>
                    <span>{formatRupiah(priceBeforeDiscount)}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>Diskon ({appliedPromo.code})</span>
                      <span>-{formatRupiah(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-white/10">
                    <span>Total Pembayaran (Bayar di Tempat)</span>
                    <span className="text-white text-lg font-black">{formatRupiah(finalPrice)}</span>
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="p-4 rounded-sm bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <p className="text-[11px] text-gray-400 text-center">
                Dengan menekan &quot;Konfirmasi Booking&quot;, jadwal Anda akan langsung tercatat di sistem kami tanpa antrean.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#161616] flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-sm bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>KEMBALI</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 3 && !selectedTime) {
                  setSubmitError('Silakan pilih jam slot terlebih dahulu');
                  return;
                }
                if (step === 4 && (!customerName.trim() || !customerPhone.trim())) {
                  setSubmitError('Nama dan Nomor WhatsApp wajib diisi');
                  return;
                }
                setSubmitError(null);
                setStep(step + 1);
              }}
              className="flex items-center gap-1.5 px-6 py-3 rounded-sm bg-white text-black hover:bg-gray-200 text-xs font-black uppercase tracking-widest shadow-md transition-all cursor-pointer"
            >
              <span>SELANJUTNYA</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleConfirmBooking}
              className="flex items-center gap-2 px-8 py-3.5 rounded-sm bg-white hover:bg-gray-200 text-black text-xs font-black uppercase tracking-widest shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>MEMPROSES BOOKING...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>CONFIRM BOOKING</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
