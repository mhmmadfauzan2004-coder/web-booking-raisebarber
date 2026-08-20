import React from 'react';
import { Calendar, ChevronRight, Star, Clock, ShieldCheck, Sparkles, MapPin } from 'lucide-react';
import { WebsiteSettings } from '../types';

interface HeroProps {
  settings?: WebsiteSettings;
  onOpenBooking: () => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, onOpenBooking }) => {
  const scrollToServices = () => {
    const el = document.getElementById('services');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToLocation = () => {
    const el = document.getElementById('location');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative min-h-[90vh] lg:min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden bg-[#0D0D0D]">
      {/* Hero Background Image with Multi-layer Dark Gradient */}
      <div className="absolute inset-0 z-0">
        <img
          src={
            settings?.heroImageUrl ||
            'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1600&auto=format&fit=crop&q=80'
          }
          alt="Raise Barbershop Dumai"
          className="w-full h-full object-cover object-center filter brightness-[0.35] contrast-125"
          referrerPolicy="no-referrer"
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/70 to-[#0D0D0D]/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D]/95 via-[#0D0D0D]/60 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl space-y-6 lg:space-y-8">
          {/* Eyebrow */}
          <div className="flex items-center space-x-3">
            <div className="h-px w-8 bg-white" />
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-gray-400">
              Jl. Pangeran Diponegoro, Dumai &bull; Open Daily
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-[1.05]">
              {settings?.heroTitle || 'LOOK SHARP.'}<br />
              <span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255, 255, 255, 0.85)' }}>
                FEEL CONFIDENT.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-gray-400 font-normal leading-relaxed max-w-xl">
              {settings?.heroSubtitle ||
                'Premium Hair Cut & Shave di Raise Barbershop Dumai. Pengalaman grooming pria berkelas dengan barber handal dan suasana maskulin eksklusif.'}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <button
              id="hero-book-now-btn"
              onClick={onOpenBooking}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-xs sm:text-sm hover:bg-gray-200 transition-colors shadow-lg rounded-sm cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-black" />
              <span>RESERVE CHAIR</span>
              <ChevronRight className="w-4 h-4 text-black" />
            </button>

            <button
              id="hero-view-services-btn"
              onClick={scrollToServices}
              className="flex items-center justify-center gap-2 px-8 py-4 border border-white/20 hover:bg-white/5 text-white font-black uppercase tracking-widest text-xs sm:text-sm transition-all rounded-sm cursor-pointer"
            >
              <span>VIEW SERVICES</span>
            </button>
          </div>

          {/* Trust & Highlight Badges */}
          <div className="pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="space-y-1">
              <div className="text-2xl font-black text-white tracking-tight">4.9/5</div>
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Kepuasan Klien</div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl font-black text-white tracking-tight">5 Master</div>
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Barber Ahli</div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl font-black text-white tracking-tight">Real-Time</div>
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Bebas Antre</div>
            </div>

            <div
              onClick={scrollToLocation}
              className="space-y-1 cursor-pointer group"
            >
              <div className="text-2xl font-black text-white group-hover:text-gray-300 transition-colors tracking-tight">Dumai Kota</div>
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Sukajadi, Riau</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
