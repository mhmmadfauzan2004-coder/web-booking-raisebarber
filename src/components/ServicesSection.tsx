import React, { useState } from 'react';
import { Clock, Scissors, Sparkles, Check, ChevronRight } from 'lucide-react';
import { Service, ServiceCategory } from '../types';
import { formatRupiah } from '../utils/format';

interface ServicesSectionProps {
  services: Service[];
  categories: ServiceCategory[];
  onSelectServiceToBook: (serviceId: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  categories,
  onSelectServiceToBook,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeDetailService, setActiveDetailService] = useState<Service | null>(null);

  const filteredServices = services.filter((s) => {
    if (!s.isActive) return false;
    if (selectedCategory === 'all') return true;
    return s.categoryId === selectedCategory;
  });

  return (
    <section id="services" className="py-24 bg-[#0D0D0D] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-px w-8 bg-white" />
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-gray-400">
              Signature Grooming
            </span>
            <div className="h-px w-8 bg-white" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            SERVICES & PRICING
          </h2>
          <p className="text-sm sm:text-base text-gray-400">
            Pilihan paket potongan rambut presisi, hot towel shave, dan perawatan maskulin terbaik di Dumai.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-white text-black font-black shadow-md'
                : 'bg-[#161616] text-gray-300 hover:bg-white/5 hover:text-white border border-white/10'
            }`}
          >
            All Services ({services.length})
          </button>
          {categories.map((cat) => {
            const count = services.filter((s) => s.categoryId === cat.id && s.isActive).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-white text-black font-black shadow-md'
                    : 'bg-[#161616] text-gray-300 hover:bg-white/5 hover:text-white border border-white/10'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="group bg-[#161616] border border-white/10 hover:border-white/30 rounded-sm overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Photo & Duration Badge */}
              <div className="relative h-52 overflow-hidden bg-[#0D0D0D]">
                <img
                  src={service.photoUrl}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90 contrast-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-transparent to-transparent" />

                {/* Duration Badge */}
                <div className="absolute top-3 left-3 bg-[#0D0D0D]/90 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-sm text-[11px] font-bold text-gray-200 flex items-center gap-1.5 shadow-md">
                  <Clock className="w-3 h-3 text-white" />
                  <span>{service.duration} Mins</span>
                </div>

                {service.featured && (
                  <div className="absolute top-3 right-3 bg-white text-black font-black px-2.5 py-1 rounded-sm text-[10px] uppercase tracking-widest flex items-center gap-1 shadow-md">
                    <span>POPULAR</span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 block mb-1">
                    {service.categoryName}
                  </span>
                  <h3 className="text-xl font-black text-white group-hover:text-gray-200 transition-colors uppercase tracking-tight">
                    {service.name}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 mt-2 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Price & Action */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 block font-bold">
                      Tarif
                    </span>
                    <span className="text-xl font-black text-white">
                      {formatRupiah(service.price)}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectServiceToBook(service.id)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-sm bg-white text-black hover:bg-gray-200 text-xs font-black uppercase tracking-widest shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    <span>RESERVE</span>
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
