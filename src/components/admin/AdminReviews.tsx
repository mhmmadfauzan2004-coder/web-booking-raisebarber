import React from 'react';
import { Star, Trash2, CheckCircle2, MessageSquare } from 'lucide-react';
import { Review } from '../../types';
import { formatDateShort } from '../../utils/format';

interface AdminReviewsProps {
  reviews: Review[];
  onDeleteReview: (id: string) => Promise<void>;
}

export const AdminReviews: React.FC<AdminReviewsProps> = ({ reviews, onDeleteReview }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
          CUSTOMER REVIEWS & FEEDBACK
        </h2>
        <p className="text-xs text-zinc-400">
          Ulasan dan rating kepuasan yang dikirimkan oleh pelanggan setelah sesi haircut selesai ({reviews.length} ulasan)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between space-y-4 shadow-lg"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: r.rating }).map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <button
                  onClick={() => onDeleteReview(r.id)}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-600 text-zinc-400 hover:text-white transition-colors"
                  title="Hapus Ulasan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 italic leading-relaxed">
                &ldquo;{r.comment}&rdquo;
              </p>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white block">{r.customerName}</span>
                <span className="text-[10px] text-amber-400">
                  Barber: {r.barberName} &bull; {r.serviceName}
                </span>
              </div>
              <span className="text-[10px] text-zinc-500">{formatDateShort(r.date)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
