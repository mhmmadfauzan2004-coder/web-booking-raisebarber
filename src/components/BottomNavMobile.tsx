import React from 'react';
import { Home, Scissors, Search, Calendar } from 'lucide-react';

interface BottomNavMobileProps {
  onOpenBooking: () => void;
  onOpenLookup: () => void;
}

export const BottomNavMobile: React.FC<BottomNavMobileProps> = ({
  onOpenBooking,
  onOpenLookup,
}) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0D0D0D]/95 backdrop-blur-xl border-t border-white/10 px-3 py-2 flex items-center justify-between shadow-2xl">
      <button
        onClick={() => scrollTo('home')}
        className="flex flex-col items-center justify-center p-1.5 text-gray-400 hover:text-white"
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Home</span>
      </button>

      <button
        onClick={() => scrollTo('services')}
        className="flex flex-col items-center justify-center p-1.5 text-gray-400 hover:text-white"
      >
        <Scissors className="w-5 h-5" />
        <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Layanan</span>
      </button>

      <button
        onClick={onOpenLookup}
        className="flex flex-col items-center justify-center p-1.5 text-gray-400 hover:text-white"
      >
        <Search className="w-5 h-5 text-white" />
        <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Cek Booking</span>
      </button>

      <button
        onClick={onOpenBooking}
        className="flex items-center gap-1.5 px-4 py-2 rounded-sm bg-white text-black font-black text-xs uppercase tracking-widest active:scale-95 shadow-md"
      >
        <Calendar className="w-4 h-4 text-black" />
        <span>BOOK</span>
      </button>
    </div>
  );
};
