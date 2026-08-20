import React from 'react';
import { Star, Quote, CheckCircle2, Scissors } from 'lucide-react';
import { Review } from '../types';
import { formatDateShort } from '../utils/format';

interface ReviewSectionProps {
  reviews: Review[];
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ reviews }) => {
  if (reviews.length === 0) return null;

  return (
    <section className="py-24 bg-[#0D0D0D] relative border-t border-white/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-px w-8 bg-white" />
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-gray-400">
              Verified Reviews
            </span>
            <div className="h-px w-8 bg-white" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            WHAT CLIENTS SAY
          </h2>
          <p className="text-sm sm:text-base text-gray-400">
            Kepuasan pelanggan adalah prioritas utama setiap sentuhan gunting dan pisau cukur kami.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-sm bg-[#161616] border border-white/10 flex flex-col justify-between space-y-4 hover:border-white/30 transition-colors shadow-lg"
            >
              <div className="space-y-3">
                {/* Rating Stars */}
                <div className="flex items-center gap-1 text-white">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-white" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-gray-300 italic leading-relaxed">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>{rev.customerName}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" title="Verified Customer" />
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium block">
                    Barber: {rev.barberName} &bull; {rev.serviceName}
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">
                  {formatDateShort(rev.date)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
