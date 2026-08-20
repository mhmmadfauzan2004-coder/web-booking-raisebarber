import React, { useState, useEffect } from 'react';
import {
  Scissors,
  LayoutDashboard,
  Calendar,
  Users,
  Tag,
  Image as ImageIcon,
  Star,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  RefreshCw,
  Bell,
} from 'lucide-react';
import {
  WebsiteSettings,
  Service,
  ServiceCategory,
  Barber,
  Booking,
  Customer,
  PromoCode,
  GalleryItem,
  Review,
  DashboardStats,
} from '../../types';
import {
  fetchAdminData,
  updateBookingStatusAdmin,
  createManualBookingAdmin,
  saveBarberAdmin,
  deleteBarberAdmin,
  toggleBarberAvailabilityAdmin,
  saveServiceAdmin,
  deleteServiceAdmin,
  addGalleryPhotoAdmin,
  deleteGalleryPhotoAdmin,
  savePromoAdmin,
  deletePromoAdmin,
  deleteReviewAdmin,
  saveSettingsAdmin,
  saveCustomerAdmin,
  deleteCustomerAdmin,
} from '../../api/client';

import { AdminOverview } from './AdminOverview';
import { AdminBookings } from './AdminBookings';
import { AdminBarbers } from './AdminBarbers';
import { AdminServices } from './AdminServices';
import { AdminGallery } from './AdminGallery';
import { AdminPromos } from './AdminPromos';
import { AdminCustomers } from './AdminCustomers';
import { AdminReviews } from './AdminReviews';
import { AdminSettings } from './AdminSettings';

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
  onViewWebsite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  token,
  onLogout,
  onViewWebsite,
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // System Data
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchAdminData(token);
      setStats(res.stats);
      setBookings(res.bookings);
      setServices(res.services);
      setCategories(res.categories);
      setBarbers(res.barbers);
      setCustomers(res.customers);
      setPromos(res.promos);
      setGallery(res.gallery);
      setReviews(res.reviews);
      setSettings(res.settings);
    } catch (err: any) {
      console.error('Failed to fetch admin data', err);
      if (err.message && err.message.includes('401')) {
        onLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  // Handler Functions
  const handleUpdateBookingStatus = async (id: string, status: Booking['status']) => {
    try {
      const res = await updateBookingStatusAdmin(id, status, token);
      setBookings((prev) => prev.map((b) => (b.id === id ? res.booking : b)));
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status booking');
    }
  };

  const handleCreateManualBooking = async (data: any) => {
    const res = await createManualBookingAdmin(data, token);
    setBookings((prev) => [res.booking, ...prev]);
    loadData();
  };

  const handleSaveBarber = async (barber: Partial<Barber>) => {
    const res = await saveBarberAdmin(barber, token);
    setBarbers((prev) => {
      const exists = prev.find((b) => b.id === res.barber.id);
      if (exists) {
        return prev.map((b) => (b.id === res.barber.id ? res.barber : b));
      }
      return [...prev, res.barber];
    });
  };

  const handleDeleteBarber = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus barber ini?')) return;
    await deleteBarberAdmin(id, token);
    setBarbers((prev) => prev.filter((b) => b.id !== id));
  };

  const handleToggleAvailability = async (id: string) => {
    const res = await toggleBarberAvailabilityAdmin(id, token);
    setBarbers((prev) => prev.map((b) => (b.id === id ? res.barber : b)));
  };

  const handleSaveService = async (service: Partial<Service>) => {
    const res = await saveServiceAdmin(service, token);
    setServices((prev) => {
      const exists = prev.find((s) => s.id === res.service.id);
      if (exists) {
        return prev.map((s) => (s.id === res.service.id ? res.service : s));
      }
      return [...prev, res.service];
    });
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus layanan ini?')) return;
    await deleteServiceAdmin(id, token);
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddPhoto = async (item: Omit<GalleryItem, 'id' | 'createdAt'>) => {
    const res = await addGalleryPhotoAdmin(item, token);
    setGallery((prev) => [res.item, ...prev]);
  };

  const handleDeletePhoto = async (id: string) => {
    if (!window.confirm('Hapus foto ini dari lookbook?')) return;
    await deleteGalleryPhotoAdmin(id, token);
    setGallery((prev) => prev.filter((g) => g.id !== id));
  };

  const handleSavePromo = async (promo: Partial<PromoCode>) => {
    const res = await savePromoAdmin(promo, token);
    setPromos((prev) => {
      const exists = prev.find((p) => p.id === res.promo.id);
      if (exists) {
        return prev.map((p) => (p.id === res.promo.id ? res.promo : p));
      }
      return [...prev, res.promo];
    });
  };

  const handleDeletePromo = async (id: string) => {
    if (!window.confirm('Hapus promo ini?')) return;
    await deletePromoAdmin(id, token);
    setPromos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm('Hapus ulasan ini?')) return;
    await deleteReviewAdmin(id, token);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSaveCustomer = async (customer: Partial<Customer>) => {
    const res = await saveCustomerAdmin(customer, token);
    setCustomers((prev) => {
      const exists = prev.find((c) => c.id === res.customer.id);
      if (exists) {
        return prev.map((c) => (c.id === res.customer.id ? res.customer : c));
      }
      return [res.customer, ...prev];
    });
  };

  const handleDeleteCustomer = async (id: string) => {
    await deleteCustomerAdmin(id, token);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSaveSettings = async (newSettings: Partial<WebsiteSettings>) => {
    const res = await saveSettingsAdmin(newSettings, token);
    setSettings(res.settings);
  };

  const navItems = [
    { id: 'overview', label: 'Ringkasan & Stats', icon: LayoutDashboard, count: null },
    { id: 'bookings', label: 'Reservasi Masuk', icon: Calendar, count: bookings.filter((b) => b.status === 'CONFIRMED').length },
    { id: 'barbers', label: 'Kelola Barber', icon: Users, count: barbers.length },
    { id: 'services', label: 'Layanan & Tarif', icon: Scissors, count: services.length },
    { id: 'gallery', label: 'Gallery Lookbook', icon: ImageIcon, count: gallery.length },
    { id: 'promos', label: 'Kode Promo', icon: Tag, count: promos.length },
    { id: 'customers', label: 'Database CRM', icon: Users, count: customers.length },
    { id: 'reviews', label: 'Ulasan Pelanggan', icon: Star, count: reviews.length },
    { id: 'settings', label: 'Pengaturan Website', icon: Settings, count: null },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex text-white antialiased font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0D0D0D] border-r border-white/10 p-5 shrink-0 justify-between">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-sm bg-[#161616] border border-white/20 flex items-center justify-center text-white">
              <Scissors className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <span className="font-brand font-black tracking-widest text-base text-white block leading-tight">
                RAISE
              </span>
              <span className="text-[9px] tracking-[0.2em] text-gray-400 uppercase font-bold block">
                ADMIN CONTROL
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-sm text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-black font-bold shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-[#161616]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== null && (
                    <span
                      className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                        isActive
                          ? 'bg-black text-white'
                          : 'bg-[#161616] text-gray-400 border border-white/10'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <button
            onClick={onViewWebsite}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-sm text-xs font-semibold text-gray-400 hover:text-white hover:bg-[#161616] transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-white" />
            <span>Lihat Website</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-sm text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0D0D0D]">
        {/* Topbar Mobile/Tablet Header */}
        <header className="px-6 py-4 bg-[#0D0D0D]/90 border-b border-white/10 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-sm bg-[#161616] text-gray-300 border border-white/10"
            >
              <Menu className="w-5 h-5" />
            </button>

            <h1 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
              {navItems.find((n) => n.id === activeTab)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-2 rounded-sm bg-[#161616] hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-white' : ''}`} />
            </button>

            <button
              onClick={onViewWebsite}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-white text-black font-bold hover:bg-gray-200 text-xs transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-black" />
              <span>Lihat Website</span>
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex">
            <div className="w-72 bg-[#0D0D0D] border-r border-white/10 p-5 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-white" />
                    <span className="font-brand font-black text-white">RAISE ADMIN</span>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 rounded-sm text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-xs font-semibold ${
                          isActive
                            ? 'bg-white text-black font-bold'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    onViewWebsite();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-semibold text-gray-300"
                >
                  <ExternalLink className="w-4 h-4 text-white" />
                  <span>Lihat Website</span>
                </button>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-semibold text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content Container */}
        <main className="p-4 sm:p-6 lg:p-8 overflow-y-auto flex-1 bg-[#0D0D0D]">
          {activeTab === 'overview' && (
            <AdminOverview
              stats={stats}
              bookings={bookings}
              barbers={barbers}
              onNavigateTab={(t) => setActiveTab(t)}
              onUpdateBookingStatus={handleUpdateBookingStatus}
            />
          )}

          {activeTab === 'bookings' && (
            <AdminBookings
              bookings={bookings}
              barbers={barbers}
              services={services}
              onUpdateStatus={handleUpdateBookingStatus}
              onCreateManualBooking={handleCreateManualBooking}
            />
          )}

          {activeTab === 'barbers' && (
            <AdminBarbers
              barbers={barbers}
              onSaveBarber={handleSaveBarber}
              onDeleteBarber={handleDeleteBarber}
              onToggleAvailability={handleToggleAvailability}
            />
          )}

          {activeTab === 'services' && (
            <AdminServices
              services={services}
              categories={categories}
              onSaveService={handleSaveService}
              onDeleteService={handleDeleteService}
            />
          )}

          {activeTab === 'gallery' && (
            <AdminGallery
              gallery={gallery}
              barbers={barbers}
              onAddPhoto={handleAddPhoto}
              onDeletePhoto={handleDeletePhoto}
            />
          )}

          {activeTab === 'promos' && (
            <AdminPromos
              promos={promos}
              onSavePromo={handleSavePromo}
              onDeletePromo={handleDeletePromo}
            />
          )}

          {activeTab === 'customers' && (
            <AdminCustomers
              customers={customers}
              services={services}
              barbers={barbers}
              onSaveCustomer={handleSaveCustomer}
              onDeleteCustomer={handleDeleteCustomer}
            />
          )}

          {activeTab === 'reviews' && (
            <AdminReviews reviews={reviews} onDeleteReview={handleDeleteReview} />
          )}

          {activeTab === 'settings' && settings && (
            <AdminSettings
              settings={settings}
              onSaveSettings={handleSaveSettings}
              token={token}
            />
          )}
        </main>
      </div>
    </div>
  );
};
