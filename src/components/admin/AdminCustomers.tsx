import React, { useState } from 'react';
import {
  Users,
  Search,
  MessageCircle,
  Phone,
  Calendar,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  Crown,
  UserCheck,
  UserPlus,
  Sparkles,
  X,
  Check,
  Scissors,
  User,
  FileText,
  Filter,
  Loader2,
  Award,
} from 'lucide-react';
import { Customer, CustomerMemberStatus, Service, Barber } from '../../types';
import { formatRupiah, formatDateShort } from '../../utils/format';
import { ImageUploadField } from '../common/ImageUploadField';

interface AdminCustomersProps {
  customers: Customer[];
  services?: Service[];
  barbers?: Barber[];
  onSaveCustomer: (customer: Partial<Customer>) => Promise<void>;
  onDeleteCustomer: (id: string) => Promise<void>;
}

export const AdminCustomers: React.FC<AdminCustomersProps> = ({
  customers,
  services = [],
  barbers = [],
  onSaveCustomer,
  onDeleteCustomer,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [memberStatus, setMemberStatus] = useState<CustomerMemberStatus>('REGULER');
  const [totalBookings, setTotalBookings] = useState<number>(1);
  const [totalSpending, setTotalSpending] = useState<number>(45000);
  const [favoriteServiceName, setFavoriteServiceName] = useState('');
  const [favoriteBarberName, setFavoriteBarberName] = useState('');
  const [barberNotes, setBarberNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [lastBookingDate, setLastBookingDate] = useState('');

  // Delete Confirmation Modal State
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openAddModal = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setEmail('');
    setMemberStatus('BARU');
    setTotalBookings(1);
    setTotalSpending(45000);
    setFavoriteServiceName(services[0]?.name || 'Raise Signature Haircut');
    setFavoriteBarberName(barbers[0]?.name || 'Dede');
    setBarberNotes('');
    setPhotoUrl('');
    setLastBookingDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone);
    setEmail(c.email || '');
    setMemberStatus((c.memberStatus as CustomerMemberStatus) || (c.totalBookings && c.totalBookings > 5 ? 'VIP' : 'REGULER'));
    setTotalBookings(c.totalBookings || c.totalVisits || 1);
    setTotalSpending(c.totalSpending || c.totalSpent || 0);
    setFavoriteServiceName(c.favoriteServiceName || '');
    setFavoriteBarberName(c.favoriteBarberName || '');
    setBarberNotes(c.barberNotes || (c.notes && c.notes.length > 0 ? c.notes.map(n => n.text).join('\n') : ''));
    setPhotoUrl(c.photoUrl || '');
    setLastBookingDate(c.lastBookingDate || c.lastVisit || new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Nama dan No. WhatsApp wajib diisi');
      return;
    }

    setLoading(true);
    try {
      await onSaveCustomer({
        id: editingCustomer ? editingCustomer.id : undefined,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        memberStatus,
        photoUrl: photoUrl.trim() || undefined,
        totalBookings: Number(totalBookings),
        totalVisits: Number(totalBookings),
        totalSpending: Number(totalSpending),
        totalSpent: Number(totalSpending),
        favoriteServiceName: favoriteServiceName.trim() || undefined,
        favoriteBarberName: favoriteBarberName.trim() || undefined,
        barberNotes: barberNotes.trim(),
        lastBookingDate: lastBookingDate || new Date().toISOString().split('T')[0],
        lastVisit: lastBookingDate || new Date().toISOString().split('T')[0],
      });
      setIsModalOpen(false);
      setEditingCustomer(null);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan data customer');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;
    setDeleting(true);
    try {
      await onDeleteCustomer(customerToDelete.id);
      setCustomerToDelete(null);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus customer');
    } finally {
      setDeleting(false);
    }
  };

  // Helper status determination
  const getCustomerStatus = (c: Customer): CustomerMemberStatus => {
    if (c.memberStatus) {
      return c.memberStatus.toUpperCase() as CustomerMemberStatus;
    }
    const count = c.totalBookings || c.totalVisits || 0;
    if (count >= 5) return 'VIP';
    if (count >= 2) return 'REGULER';
    return 'BARU';
  };

  // Filter & Search Logic
  const filtered = customers.filter((c) => {
    const status = getCustomerStatus(c);
    if (statusFilter !== 'ALL' && status !== statusFilter) {
      return false;
    }
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.favoriteServiceName && c.favoriteServiceName.toLowerCase().includes(q)) ||
      (c.favoriteBarberName && c.favoriteBarberName.toLowerCase().includes(q)) ||
      (c.barberNotes && c.barberNotes.toLowerCase().includes(q))
    );
  });

  // KPI Metrics
  const totalCount = customers.length;
  const vipCount = customers.filter((c) => getCustomerStatus(c) === 'VIP').length;
  const regulerCount = customers.filter((c) => getCustomerStatus(c) === 'REGULER').length;
  const baruCount = customers.filter((c) => getCustomerStatus(c) === 'BARU').length;
  const totalCrmSpending = customers.reduce((sum, c) => sum + (c.totalSpending || c.totalSpent || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            KELOLA DATA CUSTOMER & CRM
          </h2>
          <p className="text-xs text-gray-400">
            Database profil pelanggan, status VIP, riwayat kunjungan, layanan favorit, dan catatan khusus barber
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-sm bg-white hover:bg-gray-200 text-black text-xs font-black uppercase tracking-wider shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>+ TAMBAH CUSTOMER BARU</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-sm bg-[#161616] border border-white/10 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Klien</span>
            <Users className="w-4 h-4 text-white" />
          </div>
          <p className="text-xl font-black text-white">{totalCount}</p>
          <span className="text-[10px] text-gray-500 block">Pelanggan terdaftar</span>
        </div>

        <div className="p-3.5 rounded-sm bg-[#161616] border border-white/10 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">Member VIP</span>
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-black text-amber-400">{vipCount}</p>
          <span className="text-[10px] text-gray-500 block">Loyalitas tinggi (5+ visit)</span>
        </div>

        <div className="p-3.5 rounded-sm bg-[#161616] border border-white/10 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">Reguler</span>
            <UserCheck className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl font-black text-blue-400">{regulerCount}</p>
          <span className="text-[10px] text-gray-500 block">Kunjungan rutin (2-4 visit)</span>
        </div>

        <div className="p-3.5 rounded-sm bg-[#161616] border border-white/10 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Customer Baru</span>
            <UserPlus className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-black text-emerald-400">{baruCount}</p>
          <span className="text-[10px] text-gray-500 block">First-time visitors</span>
        </div>

        <div className="p-3.5 rounded-sm bg-[#161616] border border-white/10 space-y-1 shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Transaksi</span>
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <p className="text-base font-black text-white truncate">{formatRupiah(totalCrmSpending)}</p>
          <span className="text-[10px] text-gray-500 block">Lifetime value</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-sm bg-[#161616] border border-white/10 flex flex-col md:flex-row gap-3 items-center justify-between shadow-md">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Cari nama, No. WA, catatan barber..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs focus:outline-none focus:border-white font-medium"
          />
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-3 text-gray-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Member Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {[
            { key: 'ALL', label: `Semua (${customers.length})` },
            { key: 'VIP', label: `VIP (${vipCount})` },
            { key: 'REGULER', label: `Reguler (${regulerCount})` },
            { key: 'BARU', label: `Baru (${baruCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-sm text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab.key
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-[#0D0D0D] text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-sm bg-[#161616] border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#0D0D0D] text-gray-400 uppercase tracking-wider text-[10px] border-b border-white/10">
              <tr>
                <th className="px-5 py-4">Data Customer</th>
                <th className="px-5 py-4">Status Member</th>
                <th className="px-5 py-4">Kunjungan & Belanja</th>
                <th className="px-5 py-4">Layanan & Barber Favorit</th>
                <th className="px-5 py-4">Catatan Khusus Barber</th>
                <th className="px-5 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Users className="w-8 h-8 text-gray-600 mx-auto" />
                      <p className="text-sm font-bold text-white">Tidak ada data customer</p>
                      <p className="text-xs text-gray-400">
                        {search || statusFilter !== 'ALL'
                          ? 'Tidak ada pelanggan yang cocok dengan kriteria pencarian / filter.'
                          : 'Belum ada data customer tersimpan.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const cleanPhone = c.phone.replace(/\D/g, '').replace(/^0/, '62');
                  const status = getCustomerStatus(c);
                  const totalVisitsCount = c.totalBookings || c.totalVisits || 1;
                  const totalSpendAmount = c.totalSpending || c.totalSpent || 0;
                  const notesText =
                    c.barberNotes ||
                    (c.notes && c.notes.length > 0 ? c.notes[c.notes.length - 1].text : '');

                  return (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Name & Phone */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {c.photoUrl ? (
                            <img
                              src={c.photoUrl}
                              alt={c.name}
                              className="w-10 h-10 rounded-sm object-cover border border-white/10 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-sm bg-[#0D0D0D] border border-white/10 flex items-center justify-center text-white font-black text-sm shrink-0">
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-bold text-white text-sm block truncate">
                              {c.name}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <a
                                href={`https://wa.me/${cleanPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono text-[11px]"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{c.phone}</span>
                              </a>
                            </div>
                            {c.email && (
                              <span className="text-gray-500 text-[10px] block truncate">
                                {c.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Member Status Badge */}
                      <td className="px-5 py-4">
                        {status === 'VIP' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-amber-950/60 border border-amber-800/80 text-amber-300 font-bold text-[11px] uppercase tracking-wider">
                            <Crown className="w-3 h-3 text-amber-400" />
                            <span>VIP Member</span>
                          </span>
                        )}
                        {status === 'REGULER' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-blue-950/60 border border-blue-800/80 text-blue-300 font-bold text-[11px] uppercase tracking-wider">
                            <UserCheck className="w-3 h-3 text-blue-400" />
                            <span>Reguler</span>
                          </span>
                        )}
                        {status === 'BARU' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 font-bold text-[11px] uppercase tracking-wider">
                            <UserPlus className="w-3 h-3 text-emerald-400" />
                            <span>Baru</span>
                          </span>
                        )}
                      </td>

                      {/* Total Visits & Spending */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 rounded-sm bg-[#0D0D0D] border border-white/10 font-bold text-white text-[11px] inline-block">
                            {totalVisitsCount}x Booking
                          </span>
                          <span className="text-xs font-black text-white block">
                            {formatRupiah(totalSpendAmount)}
                          </span>
                          {c.lastBookingDate && (
                            <span className="text-[10px] text-gray-500 block">
                              Terakhir: {formatDateShort(c.lastBookingDate)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Favorite Service & Barber */}
                      <td className="px-5 py-4">
                        <div className="space-y-1 max-w-[200px]">
                          {c.favoriteServiceName ? (
                            <div className="flex items-center gap-1.5 text-gray-200">
                              <Scissors className="w-3 h-3 text-gray-400 shrink-0" />
                              <span className="font-semibold text-xs truncate">
                                {c.favoriteServiceName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-[11px] italic">Layanan belum diisi</span>
                          )}

                          {c.favoriteBarberName && (
                            <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                              <User className="w-3 h-3 text-gray-500 shrink-0" />
                              <span>Barber: <strong className="text-gray-200">{c.favoriteBarberName}</strong></span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Barber Special Notes */}
                      <td className="px-5 py-4">
                        {notesText ? (
                          <div className="p-2 rounded-sm bg-[#0D0D0D] border border-white/10 text-[11px] text-gray-300 max-w-[240px] line-clamp-2 leading-relaxed">
                            <span className="text-white font-semibold flex items-center gap-1 mb-0.5">
                              <FileText className="w-3 h-3 text-gray-400" /> Catatan:
                            </span>
                            {notesText}
                          </div>
                        ) : (
                          <span className="text-gray-600 text-[11px] italic">Belum ada catatan</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Chat WA */}
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                              `Halo Kak ${c.name}, salam dari Raise Barbershop Dumai! Kursi barbershop kami siap untuk jadwal potong rambut Kakak berikutnya.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-sm bg-emerald-950/60 hover:bg-emerald-600 border border-emerald-800 text-emerald-400 hover:text-white transition-colors cursor-pointer"
                            title="Chat WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>

                          {/* Edit Customer */}
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-2 rounded-sm bg-[#0D0D0D] hover:bg-white hover:text-black border border-white/10 text-gray-300 transition-colors cursor-pointer"
                            title="Edit Data Customer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Customer */}
                          <button
                            onClick={() => setCustomerToDelete(c)}
                            className="p-2 rounded-sm bg-red-950/40 hover:bg-red-600 border border-red-800/80 text-red-400 hover:text-white transition-colors cursor-pointer"
                            title="Hapus Customer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Modal Add / Edit Customer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#161616] border border-white/15 rounded-sm p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-sm bg-[#0D0D0D] border border-white/10 flex items-center justify-center text-white">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-tight">
                    {editingCustomer ? `Edit Profil: ${editingCustomer.name}` : 'Tambah Data Customer Baru'}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Kelola identitas lengkap, status membership, riwayat transaksi, dan preferensi gaya rambut
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-sm bg-[#0D0D0D] border border-white/10 text-gray-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {/* Photo Upload without URL */}
              <ImageUploadField
                label="Foto Profil Customer (Opsional)"
                value={photoUrl}
                onChange={(val) => setPhotoUrl(val)}
                aspectRatio="square"
                placeholder="Pilih foto profil dari galeri / kamera HP"
                helperText="Format JPG, PNG, WEBP. Tersimpan langsung sebagai Data URL."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Nama Customer */}
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">
                    Nama Lengkap <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Bima Satria"
                    className="w-full px-3.5 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs focus:outline-none focus:border-white font-medium"
                  />
                </div>

                {/* No WhatsApp */}
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">
                    Nomor WhatsApp / HP <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-3.5 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs focus:outline-none focus:border-white font-mono"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">Email (Opsional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full px-3.5 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs focus:outline-none focus:border-white"
                  />
                </div>

                {/* Status Member */}
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">
                    Status Member <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={memberStatus}
                    onChange={(e) => setMemberStatus(e.target.value as CustomerMemberStatus)}
                    className="w-full px-3 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs focus:outline-none focus:border-white font-bold"
                  >
                    <option value="VIP">👑 VIP MEMBER (Prioritas & Sering Datang)</option>
                    <option value="REGULER">👤 REGULER (Pelanggan Rutin)</option>
                    <option value="BARU">✨ BARU (First-time / Kunjungan Baru)</option>
                  </select>
                </div>
              </div>

              {/* Booking History & Spending */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 border-t border-white/10">
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">Total Kunjungan / Booking</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={totalBookings}
                    onChange={(e) => setTotalBookings(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">Total Belanja (IDR)</label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    required
                    value={totalSpending}
                    onChange={(e) => setTotalSpending(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs font-bold font-mono"
                  />
                  <span className="text-[10px] text-gray-500">{formatRupiah(totalSpending)}</span>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">Kunjungan Terakhir</label>
                  <input
                    type="date"
                    value={lastBookingDate}
                    onChange={(e) => setLastBookingDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Preferences */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-white/10">
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">Layanan Favorit</label>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      list="services-list"
                      value={favoriteServiceName}
                      onChange={(e) => setFavoriteServiceName(e.target.value)}
                      placeholder="Pilih atau ketik nama layanan"
                      className="w-full px-3.5 py-2 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs"
                    />
                    <datalist id="services-list">
                      {services.map((s) => (
                        <option key={s.id} value={s.name} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold block">Barber Favorit</label>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      list="barbers-list"
                      value={favoriteBarberName}
                      onChange={(e) => setFavoriteBarberName(e.target.value)}
                      placeholder="Pilih atau ketik nama barber"
                      className="w-full px-3.5 py-2 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs"
                    />
                    <datalist id="barbers-list">
                      {barbers.map((b) => (
                        <option key={b.id} value={b.name} />
                      ))}
                    </datalist>
                  </div>
                </div>
              </div>

              {/* Barber Notes */}
              <div className="space-y-1 pt-2 border-t border-white/10">
                <label className="text-gray-300 font-bold block">
                  Catatan Khusus Barber (Haircut Preference, Kulit Kepala, dsb.)
                </label>
                <textarea
                  rows={3}
                  value={barberNotes}
                  onChange={(e) => setBarberNotes(e.target.value)}
                  placeholder="Contoh: Suka potongan mid fade 0.5, rambut bagian atas hanya di-trim sedikit, suka pomade waterbased aroma vanilla, kulit kepala agak sensitif."
                  className="w-full px-3.5 py-2 rounded-sm bg-[#0D0D0D] border border-white/10 text-white text-xs focus:outline-none focus:border-white leading-relaxed"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                      <span>SIMPAN DATA CUSTOMER</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#161616] border border-red-900/60 rounded-sm p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-sm bg-red-950/60 border border-red-800 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tight">
                  Hapus Data Customer?
                </h3>
                <p className="text-xs text-gray-400">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <p className="text-xs text-gray-300 bg-[#0D0D0D] p-3 rounded-sm border border-white/10">
              Apakah Anda yakin ingin menghapus data customer{' '}
              <strong className="text-white">{customerToDelete.name}</strong> ({customerToDelete.phone})?
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCustomerToDelete(null)}
                className="flex-1 py-2.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-gray-300 font-bold text-xs hover:bg-[#202020] cursor-pointer"
              >
                BATAL
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-sm bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>MENGHAPUS...</span>
                  </>
                ) : (
                  <span>YA, HAPUS CUSTOMER</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
