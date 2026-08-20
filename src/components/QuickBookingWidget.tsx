import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, Scissors, CheckCircle, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Service, Barber, TimeSlot } from '../types';
import { fetchSlots } from '../api/client';
import { formatRupiah } from '../utils/format';

interface QuickBookingWidgetProps {
  services: Service[];
  barbers: Barber[];
  onStartFullBooking: (initialData?: {
    serviceId?: string;
    barberId?: string;
    date?: string;
    startTime?: string;
  }) => void;
}

export const QuickBookingWidget: React.FC<QuickBookingWidgetProps> = ({
  services,
  barbers,
  onStartFullBooking,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedBarberId, setSelectedBarberId] = useState<string>('any');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [hasChecked, setHasChecked] = useState<boolean>(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Set default service on mount
  useEffect(() => {
    if (services.length > 0 && !selectedServiceId) {
      setSelectedServiceId(services[0].id);
    }
  }, [services]);

  const handleCheckAvailability = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedDate) {
      setErrorMsg('Silakan pilih tanggal booking.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSelectedTime(null);
    try {
      const res = await fetchSlots(selectedDate, selectedBarberId, selectedServiceId);
      setSlots(res.slots);
      setHasChecked(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memuat ketersediaan slot.');
      setSlots([]);
      setHasChecked(true);
    } finally {
      setLoading(false);
    }
  };

  // Trigger check whenever date or barber changes if already checked once
  useEffect(() => {
    if (hasChecked) {
      handleCheckAvailability();
    }
  }, [selectedDate, selectedBarberId, selectedServiceId]);

  const activeService = services.find((s) => s.id === selectedServiceId);
  const availableSlots = slots.filter((s) => s.available);

  return (
    <section className="relative z-20 -mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-[#161616] border border-white/10 rounded-sm shadow-2xl backdrop-blur-xl p-6 sm:p-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <div className="h-px w-6 bg-white" />
              <span className="text-xs uppercase tracking-[0.25em] font-bold text-gray-400">
                Direct Reservation
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              BOOK YOUR CHAIR
            </h2>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm max-w-md">
            Pilih layanan, barber favorit, dan tanggal untuk memeriksa slot jam yang tersedia secara langsung tanpa antre.
          </p>
        </div>

        {/* Form Selection Grid */}
        <form onSubmit={handleCheckAvailability} className="pt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Service Selector */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-gray-400 font-bold block">
                1. Service
              </label>
              <div className="relative">
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0D0D0D] border border-white/20 text-gray-100 text-xs sm:text-sm focus:outline-none focus:border-white appearance-none font-medium rounded-sm"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({formatRupiah(s.price)})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* 2. Barber Selector */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-gray-400 font-bold block">
                2. Barber
              </label>
              <div className="relative">
                <select
                  value={selectedBarberId}
                  onChange={(e) => setSelectedBarberId(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0D0D0D] border border-white/20 text-gray-100 text-xs sm:text-sm focus:outline-none focus:border-white appearance-none font-medium rounded-sm"
                >
                  <option value="any">Any Barber (Paling Cepat)</option>
                  {barbers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.role})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* 3. Date Selector */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-gray-400 font-bold block">
                3. Date
              </label>
              <input
                type="date"
                min={todayStr}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 bg-[#0D0D0D] border border-white/20 text-gray-100 text-xs sm:text-sm focus:outline-none focus:border-white font-medium rounded-sm [color-scheme:dark]"
              />
            </div>

            {/* 4. Action Button */}
            <div className="flex items-end">
              <button
                type="submit"
                id="btn-check-availability"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer rounded-sm shadow-md"
              >
                <Clock className="w-4 h-4 text-black" />
                <span>{loading ? 'CHECKING...' : 'CHECK AVAILABILITY'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Slot Results Display */}
        {hasChecked && (
          <div className="mt-6 pt-6 border-t border-white/10 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest font-bold text-gray-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-white" />
                Slot Tersedia ({availableSlots.length} slot) &bull; Durasi:{' '}
                {activeService?.duration || 45} Menit
              </span>
              {activeService && (
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {activeService.name} &bull; {formatRupiah(activeService.price)}
                </span>
              )}
            </div>

            {errorMsg && (
              <div className="p-4 rounded-sm bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {availableSlots.length === 0 && !errorMsg ? (
              <div className="p-6 rounded-sm bg-[#0D0D0D] border border-white/10 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-sm font-bold text-white">
                  Semua slot pada tanggal tersebut sudah penuh.
                </p>
                <p className="text-xs text-gray-400">
                  Silakan pilih tanggal lain atau coba pilih &quot;Any Barber&quot; untuk opsi barber yang masih tersedia.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
                {slots.map((slot) => {
                  const isSelected = selectedTime === slot.time;
                  if (!slot.available) {
                    return (
                      <div
                        key={slot.time}
                        className="py-2.5 px-2 rounded-sm bg-[#0D0D0D] border border-white/5 text-gray-600 text-xs font-medium text-center line-through cursor-not-allowed select-none"
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
                      onClick={() => {
                        setSelectedTime(slot.time);
                        onStartFullBooking({
                          serviceId: selectedServiceId,
                          barberId: selectedBarberId !== 'any' ? selectedBarberId : (slot.barberId || 'any'),
                          date: selectedDate,
                          startTime: slot.time,
                        });
                      }}
                      className={`py-2.5 px-2 rounded-sm text-xs font-bold text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white text-black font-black shadow-md'
                          : 'bg-[#0D0D0D] border border-white/10 hover:border-white/40 text-gray-200 hover:text-white'
                      }`}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            )}

            {availableSlots.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                  Klik salah satu slot jam di atas untuk langsung membuka formulir reservasi.
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onStartFullBooking({
                      serviceId: selectedServiceId,
                      barberId: selectedBarberId,
                      date: selectedDate,
                      startTime: selectedTime || (availableSlots[0]?.time),
                    })
                  }
                  className="flex items-center gap-1.5 text-white hover:text-gray-300 font-bold uppercase tracking-widest text-xs underline cursor-pointer"
                >
                  <span>Lanjutkan Booking Lengkap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
