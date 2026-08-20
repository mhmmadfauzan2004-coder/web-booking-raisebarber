import React, { useState, useEffect } from 'react';
import { Scissors, Calendar, Search, Menu, X, Phone, ShieldCheck } from 'lucide-react';
import { WebsiteSettings } from '../types';

interface NavbarProps {
  settings?: WebsiteSettings;
  onOpenBooking: () => void;
  onOpenLookup: () => void;
  onNavigateAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onOpenBooking,
  onOpenLookup,
  onNavigateAdmin,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Services', href: '#services' },
    { label: 'Barbers', href: '#barbers' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'About', href: '#about' },
    { label: 'Location', href: '#location' },
  ];

  const scrollTo = (href: string) => {
    setMobileMenuOpen(false);
    const elem = document.querySelector(href);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0D0D0D]/95 backdrop-blur-md border-b border-white/10 py-4 shadow-2xl'
          : 'bg-[#0D0D0D]/80 backdrop-blur-sm border-b border-white/5 py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            scrollTo('#home');
          }}
          className="flex items-baseline gap-2 group"
          id="brand-logo-btn"
        >
          <span className="text-2xl sm:text-3xl font-black tracking-tighter text-white">
            RAISE
          </span>
          <span className="text-[11px] uppercase tracking-widest text-[#888] font-bold">
            Barbershop Dumai
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-widest text-gray-400">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                scrollTo(link.href);
              }}
              className="hover:text-white transition-colors relative py-1"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            id="nav-lookup-btn"
            onClick={onOpenLookup}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-widest rounded-sm border border-white/20 hover:bg-white/5 text-white transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <span>Cek Booking</span>
          </button>

          <button
            id="nav-book-btn"
            onClick={onOpenBooking}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-widest rounded-sm bg-white text-black hover:bg-gray-200 transition-colors shadow-sm cursor-pointer"
          >
            <span>Book Now</span>
          </button>
        </div>

        {/* Mobile menu toggle button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onOpenLookup}
            className="p-2 rounded-sm bg-[#161616] border border-white/10 text-gray-300 hover:text-white"
            title="Cek Status Booking"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-sm bg-[#161616] border border-white/10 text-gray-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0D0D0D] border-b border-white/10 px-6 py-6 space-y-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-3 pb-4 border-b border-white/10">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(link.href);
                }}
                className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 rounded-sm transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-sm bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-gray-200"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Now</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLookup();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-sm bg-transparent text-white font-bold uppercase tracking-widest text-xs border border-white/20 hover:bg-white/5"
            >
              <Search className="w-4 h-4 text-gray-400" />
              <span>Cek Status Booking</span>
            </button>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-gray-400" />
              {settings?.phone || '0852-7121-1746'}
            </span>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateAdmin();
              }}
              className="text-gray-400 hover:text-white flex items-center gap-1 uppercase tracking-wider text-[10px] font-bold"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
