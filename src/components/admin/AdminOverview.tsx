import React from 'react';
import {
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  Scissors,
  TrendingUp,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { DashboardStats, Booking, Barber } from '../../types';
import { formatRupiah, formatDateIndo, generateWhatsAppMessage } from '../../utils/format';

interface AdminOverviewProps {
  stats: DashboardStats | null;
  bookings: Booking[];
  barbers: Barber[];
  onNavigateTab: (tab: string) => void;
  onUpdateBookingStatus: (id: string, status: Booking['status']) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  stats,
  bookings,
  barbers,
  onNavigateTab,
  onUpdateBookingStatus,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter((b) => b.date === todayStr);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Raise Barbershop Control Center</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            RINGKASAN OPERASIONAL
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Pantau reservasi, pendapatan harian, performa barber, dan aktivitas pelanggan secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('bookings')}
            className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold uppercase tracking-wider text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            + KELOLA RESERVASI
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bookings */}
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Total Reservasi
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-white">{stats?.totalBookings || 0}</span>
            <span className="text-xs text-zinc-500 ml-2 font-medium">booking tercatat</span>
          </div>
          <div className="text-[11px] text-zinc-400 flex items-center gap-1">
            <span className="text-emerald-400 font-bold">{stats?.confirmedBookings || 0} aktif</span> &bull;{' '}
            <span className="text-blue-400 font-bold">{stats?.completedBookings || 0} selesai</span>
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Omzet Hari Ini
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">
              {formatRupiah(stats?.todayRevenue || 0)}
            </span>
          </div>
          <div className="text-[11px] text-zinc-400">
            Total Estimasi: <span className="text-white font-bold">{formatRupiah(stats?.totalRevenue || 0)}</span>
          </div>
        </div>

        {/* Active Barbers Today */}
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Barber On Duty
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Scissors className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-amber-400">
              {barbers.filter((b) => b.isAvailableToday && b.isActive).length} / {barbers.length}
            </span>
            <span className="text-xs text-zinc-500 ml-2 font-medium">standby</span>
          </div>
          <div className="text-[11px] text-zinc-400">
            Siap melayani kursi potong hari ini
          </div>
        </div>

        {/* Total Registered Clients */}
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Database Customer
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-white">{stats?.totalCustomers || 0}</span>
            <span className="text-xs text-zinc-500 ml-2 font-medium">pelanggan</span>
          </div>
          <div className="text-[11px] text-zinc-400">
            Terdata di CRM Raise Barbershop
          </div>
        </div>
      </div>

      {/* Two Column Layout: Today's Schedule & Barber Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Today's Bookings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Jadwal Appointment Hari Ini ({todayBookings.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('bookings')}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayBookings.length === 0 ? (
            <div className="p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-2">
              <Calendar className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm font-semibold text-zinc-300">
                Belum ada reservasi untuk hari ini.
              </p>
              <p className="text-xs text-zinc-500">
                Slot masih terbuka lebar untuk pelanggan walk-in atau booking baru.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayBookings.slice(0, 6).map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center text-center shrink-0">
                      <span className="text-xs font-black text-amber-400 leading-none">
                        {booking.startTime}
                      </span>
                      <span className="text-[9px] text-zinc-500 uppercase mt-0.5">WIB</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">
                          {booking.customerName}
                        </h4>
                        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
                          {booking.bookingCode}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300">
                        {booking.serviceName} &bull; <span className="text-amber-400 font-semibold">{booking.barberName}</span>
                      </p>
                      {booking.notes && (
                        <p className="text-[11px] text-zinc-400 italic mt-0.5">
                          &ldquo;{booking.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {booking.status === 'CONFIRMED' && (
                      <>
                        <button
                          onClick={() => onUpdateBookingStatus(booking.id, 'COMPLETED')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-600/40 text-emerald-400 hover:text-white text-xs font-bold transition-all cursor-pointer"
                        >
                          Selesai
                        </button>
                        <button
                          onClick={() => onUpdateBookingStatus(booking.id, 'NO_SHOW')}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs font-semibold transition-all cursor-pointer"
                        >
                          No-Show
                        </button>
                      </>
                    )}

                    <a
                      href={`https://wa.me/${booking.customerPhone.replace(/\D/g, '').replace(/^0/, '62')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-emerald-400 transition-colors"
                      title="Chat WhatsApp Customer"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Barber Roster Quick Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Status Barber
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('barbers')}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Kelola</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
            {barbers.map((barber) => (
              <div
                key={barber.id}
                className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={barber.photoUrl}
                    alt={barber.name}
                    className="w-10 h-10 rounded-xl object-cover border border-zinc-700 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">{barber.name}</h4>
                    <p className="text-[10px] text-zinc-400">{barber.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      barber.isAvailableToday && barber.isActive
                        ? 'bg-emerald-400 animate-pulse'
                        : 'bg-zinc-600'
                    }`}
                  />
                  <span className="text-[11px] font-semibold text-zinc-300">
                    {barber.isAvailableToday && barber.isActive ? 'On Duty' : 'Off'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
