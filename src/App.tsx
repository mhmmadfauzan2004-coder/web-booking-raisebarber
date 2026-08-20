import React, { useState, useEffect, useCallback } from 'react';
import {
  WebsiteSettings,
  Service,
  ServiceCategory,
  Barber,
  GalleryItem,
  Review,
  Booking,
} from './types';
import {
  fetchShopInfo,
  getStoredAdminToken,
  setStoredAdminToken,
  clearStoredAdminSession,
  adminLogout,
} from './api/client';

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { QuickBookingWidget } from './components/QuickBookingWidget';
import { ServicesSection } from './components/ServicesSection';
import { BarberSection } from './components/BarberSection';
import { GallerySection } from './components/GallerySection';
import { AboutSection } from './components/AboutSection';
import { LocationSection } from './components/LocationSection';
import { ReviewSection } from './components/ReviewSection';
import { Footer } from './components/Footer';
import { BottomNavMobile } from './components/BottomNavMobile';

import { BookingModal } from './components/BookingModal';
import { BookingSuccessModal } from './components/BookingSuccessModal';
import { BookingLookupModal } from './components/BookingLookupModal';

import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Loader2 } from 'lucide-react';

export default function App() {
  // App View Mode: 'customer' | 'admin-login' | 'admin-dashboard'
  const [currentView, setCurrentView] = useState<'customer' | 'admin-login' | 'admin-dashboard'>(() => {
    if (typeof window === 'undefined') return 'customer';
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const token = getStoredAdminToken();

    if (path === '/login') {
      return 'admin-login';
    }
    if (path.startsWith('/admin') || params.get('admin') === '1') {
      return token ? 'admin-dashboard' : 'admin-login';
    }
    return 'customer';
  });

  const [adminToken, setAdminToken] = useState<string | null>(() => getStoredAdminToken());

  // Shop Public Data
  const [settings, setSettings] = useState<WebsiteSettings | undefined>(undefined);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Booking Flow
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [lookupModalOpen, setLookupModalOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Preselected booking options when opened from specific card
  const [preselectedServiceId, setPreselectedServiceId] = useState<string | undefined>(undefined);
  const [preselectedBarberId, setPreselectedBarberId] = useState<string | undefined>(undefined);
  const [preselectedDate, setPreselectedDate] = useState<string | undefined>(undefined);
  const [preselectedStartTime, setPreselectedStartTime] = useState<string | undefined>(undefined);

  // Load shop info from API
  const loadPublicData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchShopInfo();
      setSettings(res.settings);
      setServices(res.services);
      setCategories(res.categories);
      setBarbers(res.barbers);
      setGallery(res.gallery);
      setReviews(res.reviews);
    } catch (err) {
      console.error('Failed to load shop info:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Route Synchronization & Browser History Management
  useEffect(() => {
    loadPublicData();

    // Check initial query params for booking triggers
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('book') === '1') {
      setBookingModalOpen(true);
    }
    if (urlParams.get('lookup') === '1') {
      setLookupModalOpen(true);
    }

    // Sync initial route state and protect /admin
    const path = window.location.pathname;
    const token = getStoredAdminToken();
    if (path.startsWith('/admin') || urlParams.get('admin') === '1') {
      if (!token) {
        // Route protection: unauthorized access replaced with /login
        window.history.replaceState({ route: 'login' }, '', '/login');
        setCurrentView('admin-login');
        setAdminToken(null);
      } else {
        setCurrentView('admin-dashboard');
        setAdminToken(token);
      }
    } else if (path === '/login') {
      setCurrentView('admin-login');
    }

    // Listen to browser Back / Forward buttons (popstate)
    const handlePopState = () => {
      const currentPath = window.location.pathname;
      const currentSearch = window.location.search;
      const activeToken = getStoredAdminToken();

      if (currentPath.startsWith('/admin') || currentSearch.includes('admin=1')) {
        if (!activeToken) {
          // Route Protection: Prevent unauthorized backward navigation into admin
          window.history.replaceState({ route: 'login' }, '', '/login');
          setCurrentView('admin-login');
          setAdminToken(null);
        } else {
          setAdminToken(activeToken);
          setCurrentView('admin-dashboard');
        }
      } else if (currentPath === '/login') {
        setCurrentView('admin-login');
      } else {
        setCurrentView('customer');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [loadPublicData]);

  // Admin login handler
  const handleAdminLoginSuccess = (token: string) => {
    setStoredAdminToken(token);
    setAdminToken(token);
    setCurrentView('admin-dashboard');
    window.history.pushState({ route: 'admin' }, '', '/admin');
  };

  // Admin logout handler - Clears sessionStorage, cookies, resets state & forces redirect to /login
  const handleAdminLogout = async () => {
    try {
      await adminLogout(adminToken || undefined);
    } catch {
      // ignore
    } finally {
      clearStoredAdminSession();
      setAdminToken(null);
      setCurrentView('admin-login');
      // Replace state to ensure browser "Back" button cannot return to dashboard
      window.history.replaceState({ route: 'login' }, '', '/login');
    }
  };

  // Navigate to Admin Area
  const handleNavigateAdmin = () => {
    const token = getStoredAdminToken();
    if (token) {
      setAdminToken(token);
      setCurrentView('admin-dashboard');
      window.history.pushState({ route: 'admin' }, '', '/admin');
    } else {
      setAdminToken(null);
      setCurrentView('admin-login');
      window.history.pushState({ route: 'login' }, '', '/login');
    }
  };

  // Navigate back to Public Customer Website
  const handleNavigateCustomer = () => {
    setCurrentView('customer');
    window.history.pushState({ route: 'customer' }, '', '/');
    loadPublicData();
  };

  // Launchers for Booking Modal with context
  const handleOpenBooking = (initialData?: {
    serviceId?: string;
    barberId?: string;
    date?: string;
    startTime?: string;
  }) => {
    setPreselectedServiceId(initialData?.serviceId);
    setPreselectedBarberId(initialData?.barberId);
    setPreselectedDate(initialData?.date);
    setPreselectedStartTime(initialData?.startTime);
    setBookingModalOpen(true);
  };

  const handleSelectServiceToBook = (serviceId: string) => {
    handleOpenBooking({ serviceId });
  };

  const handleSelectBarberToBook = (barberId: string) => {
    handleOpenBooking({ barberId });
  };

  const handleRebook = (serviceId: string, barberId: string) => {
    handleOpenBooking({ serviceId, barberId });
  };

  const handleBookingCompleted = (booking: Booking) => {
    setBookingModalOpen(false);
    setConfirmedBooking(booking);
  };

  // ==========================================
  // ROUTE RENDERING
  // ==========================================

  // 1. Admin Login Form View (/login or unauthorized /admin)
  if (currentView === 'admin-login') {
    return (
      <AdminLogin
        onSuccess={handleAdminLoginSuccess}
        onCancel={handleNavigateCustomer}
      />
    );
  }

  // 2. Protected Admin Dashboard View (/admin with valid session)
  if (currentView === 'admin-dashboard') {
    if (!adminToken) {
      // Extra safety check - enforce route protection
      return (
        <AdminLogin
          onSuccess={handleAdminLoginSuccess}
          onCancel={handleNavigateCustomer}
        />
      );
    }

    return (
      <AdminDashboard
        token={adminToken}
        onLogout={handleAdminLogout}
        onViewWebsite={handleNavigateCustomer}
      />
    );
  }

  // 3. Customer Facing View
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-amber-500 selection:text-zinc-950">
      {/* Navbar */}
      <Navbar
        settings={settings}
        onOpenBooking={() => handleOpenBooking()}
        onOpenLookup={() => setLookupModalOpen(true)}
        onNavigateAdmin={handleNavigateAdmin}
      />

      <main>
        {/* Hero Banner */}
        <Hero
          settings={settings}
          onOpenBooking={() => handleOpenBooking()}
        />

        {/* Quick Booking Widget directly underneath Hero */}
        <QuickBookingWidget
          services={services}
          barbers={barbers}
          onStartFullBooking={(data) => handleOpenBooking(data)}
        />

        {/* Services & Pricing Section */}
        <ServicesSection
          services={services}
          categories={categories}
          onSelectServiceToBook={handleSelectServiceToBook}
        />

        {/* Barber Roster Section */}
        <BarberSection
          barbers={barbers}
          onSelectBarberToBook={handleSelectBarberToBook}
        />

        {/* Lookbook Gallery Section */}
        <GallerySection
          gallery={gallery}
          onOpenBooking={() => handleOpenBooking()}
        />

        {/* Philosophy & Craftsmanship About Section */}
        <AboutSection
          settings={settings}
          onOpenBooking={() => handleOpenBooking()}
        />

        {/* Location, Google Maps & Operating Hours Section */}
        <LocationSection
          settings={settings}
        />

        {/* Verified Client Testimonials Reviews */}
        <ReviewSection
          reviews={reviews}
        />
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onOpenBooking={() => handleOpenBooking()}
        onOpenLookup={() => setLookupModalOpen(true)}
        onNavigateAdmin={handleNavigateAdmin}
      />

      {/* Sticky Bottom Navigation on Mobile */}
      <BottomNavMobile
        onOpenBooking={() => handleOpenBooking()}
        onOpenLookup={() => setLookupModalOpen(true)}
      />

      {/* Multi-step Online Booking Wizard Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        services={services}
        categories={categories}
        barbers={barbers}
        settings={settings}
        initialServiceId={preselectedServiceId}
        initialBarberId={preselectedBarberId}
        initialDate={preselectedDate}
        initialStartTime={preselectedStartTime}
        onBookingSuccess={handleBookingCompleted}
      />

      {/* Booking Success Confirmation Modal (with QR, WhatsApp, .ics) */}
      <BookingSuccessModal
        booking={confirmedBooking}
        whatsappNumber={settings?.whatsapp}
        onClose={() => setConfirmedBooking(null)}
        onBookAgain={() => handleOpenBooking()}
        onOpenLookup={() => setLookupModalOpen(true)}
      />

      {/* Self-Service Booking Status Lookup Modal */}
      <BookingLookupModal
        isOpen={lookupModalOpen}
        onClose={() => setLookupModalOpen(false)}
        whatsappNumber={settings?.whatsapp}
        onRebook={handleRebook}
      />
    </div>
  );
}
