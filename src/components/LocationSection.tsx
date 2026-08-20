import React from 'react';
import { MapPin, Navigation, Phone, MessageCircle, Clock, Instagram, CheckCircle } from 'lucide-react';
import { WebsiteSettings } from '../types';

interface LocationSectionProps {
  settings?: WebsiteSettings;
}

export const LocationSection: React.FC<LocationSectionProps> = ({ settings }) => {
  const currentDayIndex = new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday
  const dayKeyMap: ('sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday')[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  const todayKey = dayKeyMap[currentDayIndex];

  const hours = settings?.businessHours || [
    { dayName: 'Senin', dayKey: 'monday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
    { dayName: 'Selasa', dayKey: 'tuesday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
    { dayName: 'Rabu', dayKey: 'wednesday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
    { dayName: 'Kamis', dayKey: 'thursday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
    { dayName: 'Jumat', dayKey: 'friday', isOpen: true, openTime: '13:00', closeTime: '22:00' },
    { dayName: 'Sabtu', dayKey: 'saturday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
    { dayName: 'Minggu', dayKey: 'sunday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
  ];

  const cleanPhone = (settings?.whatsapp || '085271211746').replace(/\D/g, '').replace(/^0/, '62');

  return (
    <section id="location" className="py-24 bg-[#0D0D0D] relative border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-px w-8 bg-white" />
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-gray-400">
              Visit Us In Dumai
            </span>
            <div className="h-px w-8 bg-white" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            LOCATION & HOURS
          </h2>
          <p className="text-sm sm:text-base text-gray-400">
            Temukan lokasi kami yang strategis di pusat kota Dumai dan cek jadwal operasional harian.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Address, Hours, Contact Actions (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Address Card */}
            <div className="p-6 rounded-sm bg-[#161616] border border-white/10 space-y-4 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-sm bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 mt-1">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Alamat Lengkap
                  </span>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight leading-snug">
                    {settings?.brandName || 'RAISE BARBERSHOP DUMAI'}
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {settings?.address ||
                      'Jl. Pangeran Diponegoro, Sukajadi, Kecamatan Dumai Kota, Kota Dumai, Riau.'}
                  </p>
                  {settings?.addressDetails && (
                    <p className="text-[11px] text-gray-400 italic pt-1">
                      {settings.addressDetails}
                    </p>
                  )}
                </div>
              </div>

              {/* Direct Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <a
                  href={
                    settings?.googleMapsDirectionsUrl ||
                    'https://maps.google.com/?q=Jl.+Pangeran+Diponegoro,+Sukajadi,+Dumai+Kota,+Kota+Dumai,+Riau'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-sm bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-gray-200 shadow-md transition-all"
                >
                  <Navigation className="w-3.5 h-3.5 text-black" />
                  <span>DIRECTIONS</span>
                </a>

                <a
                  href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                    'Halo Raise Barbershop Dumai, saya ingin menanyakan informasi layanan & lokasi.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-sm bg-white/5 border border-white/20 hover:border-white/40 text-white font-bold uppercase tracking-widest text-xs shadow-md transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-white" />
                  <span>WHATSAPP</span>
                </a>
              </div>
            </div>

            {/* Opening Hours Card */}
            <div className="p-6 rounded-sm bg-[#161616] border border-white/10 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest">
                  <Clock className="w-4 h-4 text-white" />
                  <span>Jam Operasional</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Buka Hari Ini</span>
                </div>
              </div>

              <div className="space-y-2">
                {hours.map((h) => {
                  const isToday = h.dayKey === todayKey;
                  return (
                    <div
                      key={h.dayKey}
                      className={`flex items-center justify-between py-2 px-3 rounded-sm text-xs transition-colors ${
                        isToday
                          ? 'bg-white/10 border border-white/20 text-white font-bold'
                          : 'text-gray-400 hover:bg-white/5'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {h.dayName}
                        {isToday && (
                          <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 bg-white text-black rounded-xs font-black">
                            Hari Ini
                          </span>
                        )}
                      </span>
                      <span>
                        {h.isOpen ? `${h.openTime} – ${h.closeTime}` : 'Tutup'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="text-[11px] text-gray-400 pt-1 border-t border-white/10">
                * Khusus hari Jumat, kami buka pukul 13.00 WIB setelah ibadah Shalat Jumat.
              </p>
            </div>
          </div>

          {/* Right Column: Google Maps Embed (7 cols) */}
          <div className="lg:col-span-7 h-full min-h-[420px] rounded-sm overflow-hidden border border-white/10 shadow-2xl bg-[#161616] relative">
            <iframe
              src={
                settings?.googleMapsEmbedUrl ||
                'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15951.139889623868!2d101.44280785!3d1.67499735!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d3af07d174bb0f%3A0x82f232490ec31c77!2sJl.%20Pangeran%20Diponegoro%2C%20Sukajadi%2C%20Kec.%20Dumai%20Kota%2C%20Kota%20Dumai%2C%20Riau!5e0!3m2!1sid!2sid!4v1708500000000!5m2!1sid!2sid'
              }
              title="Lokasi Raise Barbershop Dumai"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '440px' }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full filter invert-[0.9] hue-rotate-180 contrast-125"
            />

            {/* Map Overlay Badge */}
            <div className="absolute top-4 left-4 p-3 rounded-sm bg-[#0D0D0D]/90 backdrop-blur-md border border-white/10 shadow-xl max-w-xs pointer-events-none">
              <p className="text-xs font-black text-white uppercase tracking-tight">RAISE BARBERSHOP DUMAI</p>
              <p className="text-[10px] text-gray-400">Jl. Pangeran Diponegoro, Sukajadi, Dumai Kota</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
