import React from 'react';
import { Scissors, Instagram, MessageCircle, MapPin, Phone, ShieldCheck, Heart } from 'lucide-react';
import { WebsiteSettings } from '../types';

interface FooterProps {
  settings?: WebsiteSettings;
  onOpenBooking: () => void;
  onOpenLookup: () => void;
  onNavigateAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenBooking,
  onOpenLookup,
  onNavigateAdmin,
}) => {
  const cleanPhone = (settings?.whatsapp || '085271211746').replace(/\D/g, '').replace(/^0/, '62');

  return (
    <footer className="bg-[#0D0D0D] border-t border-white/10 text-gray-400 text-xs pb-20 sm:pb-8 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-[#161616] border border-white/20 flex items-center justify-center text-white">
                <Scissors className="w-5 h-5 -rotate-45 text-white" />
              </div>
              <div>
                <span className="font-heading font-black tracking-widest text-lg text-white block leading-tight">
                  RAISE
                </span>
                <span className="text-[10px] tracking-[0.25em] text-gray-400 uppercase font-bold block">
                  BARBERSHOP DUMAI
                </span>
              </div>
            </div>

            <p className="text-gray-400 text-xs leading-relaxed">
              {settings?.tagline || 'Hair Cut & Shave'}. Tempat grooming pria berkelas di pusat Kota Dumai dengan standar ketelitian tinggi dan kenyamanan maksimal.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <a
                href={settings?.instagramUrl || 'https://instagram.com/raisebarbershop'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-sm bg-[#161616] hover:bg-white/10 border border-white/10 hover:border-white/40 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                title="Instagram @raisebarbershop"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-sm bg-[#161616] hover:bg-white/10 border border-white/10 hover:border-white/40 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                title="WhatsApp 0852-7121-1746"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-widest">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  Services & Pricing
                </a>
              </li>
              <li>
                <a href="#barbers" className="hover:text-white transition-colors">
                  Meet Our Barbers
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-white transition-colors">
                  Haircut Lookbook
                </a>
              </li>
              <li>
                <a href="#location" className="hover:text-white transition-colors">
                  Location & Hours
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenLookup}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Cek Status Booking
                </button>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-widest">
              Jam Operasional
            </h4>
            <div className="space-y-1.5 text-gray-300">
              <p className="flex justify-between">
                <span>Senin – Kamis:</span>
                <span className="font-bold text-white">09.00 – 22.00</span>
              </p>
              <p className="flex justify-between">
                <span>Jumat:</span>
                <span className="font-bold text-white">13.00 – 22.00</span>
              </p>
              <p className="flex justify-between">
                <span>Sabtu – Minggu:</span>
                <span className="font-bold text-white">09.00 – 22.00</span>
              </p>
            </div>
            <p className="text-[11px] text-gray-500 pt-1">
              Buka setiap hari tanpa libur. Booking online disarankan untuk menghindari antrean.
            </p>
          </div>

          {/* Contact & Address */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-widest">
              Alamat & Kontak
            </h4>
            <div className="space-y-2 text-gray-300">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <span>
                  {settings?.address ||
                    'Jl. Pangeran Diponegoro, Sukajadi, Dumai Kota, Dumai, Riau'}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-white shrink-0" />
                <span>{settings?.phone || '0852-7121-1746'}</span>
              </p>
              <p className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-white shrink-0" />
                <span>{settings?.instagramUsername || '@raisebarbershop'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} {settings?.brandName || 'RAISE BARBERSHOP DUMAI'}. All Rights Reserved.
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateAdmin}
              className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer uppercase tracking-widest font-bold"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
