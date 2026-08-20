import React, { useState } from 'react';
import { Sparkles, X, Scissors, Calendar, ExternalLink } from 'lucide-react';
import { GalleryItem } from '../types';

interface GallerySectionProps {
  gallery: GalleryItem[];
  onOpenBooking: () => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  gallery,
  onOpenBooking,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [lightboxImage, setLightboxImage] = useState<GalleryItem | null>(null);

  const categories = ['All', 'Fade', 'Crop', 'Classic', 'Texture', 'Styling', 'Shave', 'Barbershop'];

  const filteredItems = gallery.filter((item) => {
    if (selectedCategory === 'All') return true;
    return item.category === selectedCategory;
  });

  return (
    <section id="gallery" className="py-24 bg-[#0D0D0D] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center space-x-2">
              <div className="h-px w-8 bg-white" />
              <span className="text-xs uppercase tracking-[0.3em] font-bold text-gray-400">
                Haircut Lookbook
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
              LOOKBOOK & GALLERY
            </h2>
            <p className="text-sm sm:text-base text-gray-400">
              Inspirasi gaya potongan rambut terkini hasil karya para barber di Raise Barbershop Dumai.
            </p>
          </div>

          <button
            onClick={onOpenBooking}
            className="self-start md:self-auto flex items-center gap-2 px-6 py-3.5 rounded-sm bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all cursor-pointer shadow-lg"
          >
            <Calendar className="w-4 h-4 text-black" />
            <span>BOOK YOUR STYLE</span>
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-white text-black font-black shadow-md'
                  : 'bg-[#161616] text-gray-400 hover:bg-white/5 hover:text-white border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setLightboxImage(item)}
              className="group relative h-80 rounded-sm overflow-hidden bg-[#161616] cursor-pointer border border-white/10 hover:border-white/30 shadow-lg transition-all"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95 contrast-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

              {/* Tag */}
              <div className="absolute top-3 left-3 bg-[#0D0D0D]/90 backdrop-blur-md px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest text-white border border-white/10">
                {item.category}
              </div>

              {/* Details Overlay */}
              <div className="absolute bottom-0 inset-x-0 p-4 space-y-1 transform translate-y-1 group-hover:translate-y-0 transition-transform">
                <h4 className="text-sm font-black text-white uppercase tracking-tight leading-snug">
                  {item.title}
                </h4>
                {item.barberName && (
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Scissors className="w-3 h-3 text-white" />
                    <span>Cut by {item.barberName}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-[#0D0D0D] border border-white/10 rounded-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-sm bg-[#161616] text-gray-300 hover:text-white border border-white/20 flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-h-[70vh] overflow-hidden bg-black flex items-center justify-center">
              <img
                src={lightboxImage.imageUrl}
                alt={lightboxImage.title}
                className="max-h-[70vh] w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161616]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {lightboxImage.category}
                </span>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">
                  {lightboxImage.title}
                </h3>
                {lightboxImage.barberName && (
                  <p className="text-xs text-gray-400 mt-1">
                    Stylist: {lightboxImage.barberName}
                  </p>
                )}
              </div>

              <button
                onClick={() => {
                  setLightboxImage(null);
                  onOpenBooking();
                }}
                className="px-5 py-2.5 rounded-sm bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-gray-200 cursor-pointer flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-black" />
                <span>BOOK THIS STYLE</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
