import React, { useState, useEffect } from 'react';
import {
  WebsiteSettings,
  Service,
  ServiceCategory,
  Barber,
  GalleryItem,
  Review,
  Booking,
} from './types';
import { fetchShopInfo } from './api/client';

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
  // App View Mode: 'customer' | 'admin'
  const [viewMode, setViewMode] = useState<'customer' | 'admin'>('customer');
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('raise_admin_token');
  });

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
  const loadPublicData = async () => {
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
  };

  useEffect(() => {
    loadPublicData();

    // Check query params for deep-link
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === '1') {
      setViewMode('admin');
    }
    if (urlParams.get('book') === '1') {
      setBookingModalOpen(true);
    }
    if (urlParams.get('lookup') === '1') {
      setLookupModalOpen(true);
    }
  }, []);

  // Admin login handler
  const handleAdminLoginSuccess = (token: string) => {
    localStorage.setItem('raise_admin_token', token);
    setAdminToken(token);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('raise_admin_token');
    setAdminToken(null);
    setViewMode('customer');
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

  // If Admin View Mode is Active
  if (viewMode === 'admin') {
    if (!adminToken) {
      return (
        <AdminLogin
          onSuccess={handleAdminLoginSuccess}
          onCancel={() => setViewMode('customer')}
        />
      );
    }

    return (
      <AdminDashboard
        token={adminToken}
        onLogout={handleAdminLogout}
        onViewWebsite={() => {
          setViewMode('customer');
          loadPublicData();
        }}
      />
    );
  }

  // Customer Facing View
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-amber-500 selection:text-zinc-950">
      {/* Navbar */}
      <Navbar
        settings={settings}
        onOpenBooking={() => handleOpenBooking()}
        onOpenLookup={() => setLookupModalOpen(true)}
        onNavigateAdmin={() => setViewMode('admin')}
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
        onNavigateAdmin={() => setViewMode('admin')}
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
