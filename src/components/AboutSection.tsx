import React from 'react';
import { ShieldCheck, Sparkles, Scissors, Award, Clock, Droplets, CheckCircle2 } from 'lucide-react';
import { WebsiteSettings } from '../types';

interface AboutSectionProps {
  settings?: WebsiteSettings;
  onOpenBooking: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ settings, onOpenBooking }) => {
  const defaultFeatures = [
    'Barber profesional dan berpengalaman dengan penguasaan teknik potong modern & klasik.',
    'Sanitasi ketat dan sterilisasi pisau cukur (blade baru sekali pakai) untuk tiap pelanggan.',
    'Ruangan bersih, full AC, wangi aromaterapi, dan suasana maskulin bernuansa modern industrial.',
    'Hot towel compress aromaterapi untuk melancarkan sirkulasi darah dan membuka pori-pori.',
    'Produk grooming dan pomade premium pilihan untuk hasil penataan maksimal tahan lama.',
    'Sistem reservasi online real-time tanpa repot antre berjam-jam.',
  ];

  const features = settings?.aboutFeatures && settings.aboutFeatures.length > 0
    ? settings.aboutFeatures
    : defaultFeatures;

  return (
    <section id="about" className="py-24 bg-[#0D0D0D] relative border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Visual Composite */}
          <div className="relative">
            <div className="relative rounded-sm overflow-hidden border border-white/10 shadow-2xl bg-[#161616]">
              <img
                src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=80"
                alt="Raise Barbershop Craftsmanship"
                className="w-full h-[460px] object-cover filter brightness-90 contrast-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/30 to-transparent" />

              {/* Floating Badge */}
              <div className="absolute bottom-6 left-6 right-6 p-5 rounded-sm bg-[#161616]/95 backdrop-blur-md border border-white/10 shadow-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">
                    Dumai City Standard
                  </span>
                  <p className="text-sm font-black text-white uppercase tracking-tight">
                    HAIR CUT & SHAVE EXPERTS
                  </p>
                </div>
                <div className="w-10 h-10 rounded-sm bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <Award className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Accent decorative border */}
            <div className="absolute -top-3 -left-3 w-20 h-20 border-t-2 border-l-2 border-white/30 rounded-none pointer-events-none" />
            <div className="absolute -bottom-3 -right-3 w-20 h-20 border-b-2 border-r-2 border-white/30 rounded-none pointer-events-none" />
          </div>

          {/* Right Column: Narrative & Standards */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="h-px w-8 bg-white" />
              <span className="text-xs uppercase tracking-[0.3em] font-bold text-gray-400">
                The Philosophy
              </span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight leading-tight">
              {settings?.aboutTitle || 'RAISE YOUR STANDARD'}
            </h2>

            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              {settings?.aboutText ||
                'Raise Barbershop Dumai didirikan dengan satu tujuan: memberikan standar tertinggi perawatan rambut dan grooming bagi pria di Kota Dumai. Kami memadukan teknik pemotongan presisi modern dengan kenyamanan barbershop premium — mulai dari peralatan higienis tersanitasi, handuk hangat aromaterapi, hingga sentuhan pomade berkualitas tinggi.'}
            </p>

            {/* Checklist */}
            <div className="space-y-3 pt-2">
              {features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-sm bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-300 leading-snug">
                    {feat}
                  </p>
                </div>
              ))}
            </div>

            {/* Call to action */}
            <div className="pt-4">
              <button
                onClick={onOpenBooking}
                className="px-6 py-3.5 rounded-sm bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all cursor-pointer shadow-lg active:scale-95"
              >
                BOOK YOUR APPOINTMENT
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
