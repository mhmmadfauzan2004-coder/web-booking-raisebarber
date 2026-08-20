import React from 'react';
import { Star, Scissors, Sparkles, CheckCircle2, User, ChevronRight } from 'lucide-react';
import { Barber } from '../types';

interface BarberSectionProps {
  barbers: Barber[];
  onSelectBarberToBook: (barberId: string) => void;
}

export const BarberSection: React.FC<BarberSectionProps> = ({
  barbers,
  onSelectBarberToBook,
}) => {
  return (
    <section id="barbers" className="py-24 bg-[#0D0D0D] relative border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-px w-8 bg-white" />
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-gray-400">
              Master Craftsmen
            </span>
            <div className="h-px w-8 bg-white" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            MEET OUR BARBERS
          </h2>
          <p className="text-sm sm:text-base text-gray-400">
            Tim barber profesional yang berdedikasi menciptakan potongan rambut presisi dan kenyamanan grooming tertinggi.
          </p>
        </div>

        {/* Barbers Roster Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {barbers.map((barber) => (
            <div
              key={barber.id}
              className="group bg-[#161616] border border-white/10 hover:border-white/30 rounded-sm overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Photo & Availability Badge */}
              <div className="relative h-64 sm:h-56 overflow-hidden bg-[#0D0D0D]">
                <img
                  src={barber.photoUrl}
                  alt={barber.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 filter grayscale contrast-125"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-transparent to-transparent opacity-90" />

                {/* Status Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#0D0D0D]/90 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest text-gray-300">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      barber.isAvailableToday && barber.isActive
                        ? 'bg-emerald-400'
                        : 'bg-zinc-500'
                    }`}
                  />
                  <span>
                    {barber.isAvailableToday && barber.isActive ? 'AVAILABLE' : 'OFFLINE'}
                  </span>
                </div>

                {/* Rating Badge */}
                <div className="absolute top-3 right-3 bg-[#0D0D0D]/90 backdrop-blur-md border border-white/10 px-2 py-1 rounded-sm text-xs font-black text-white flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-white text-white" />
                  <span>{barber.rating.toFixed(1)}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">
                      {barber.name}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                      {barber.role}
                    </p>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                    {barber.bio}
                  </p>

                  {/* Specializations Tags */}
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {barber.specialization.slice(0, 3).map((spec, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-sm bg-[#0D0D0D] border border-white/10 text-[10px] text-gray-400 font-semibold"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Book With Barber Action */}
                <div className="pt-3 border-t border-white/10">
                  <button
                    onClick={() => onSelectBarberToBook(barber.id)}
                    className="w-full py-2.5 px-3 rounded-sm bg-white text-black hover:bg-gray-200 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <span>RESERVE BARBER</span>
                    <ChevronRight className="w-3.5 h-3.5 text-black" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
