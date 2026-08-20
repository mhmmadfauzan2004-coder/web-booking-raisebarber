import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X, RefreshCw } from 'lucide-react';

interface ImageUploadFieldProps {
  label?: string;
  value: string;
  onChange: (dataUrl: string) => void;
  placeholder?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
  helperText?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label = 'Foto / Gambar',
  value,
  onChange,
  placeholder = 'Pilih foto dari galeri atau HP',
  className = '',
  aspectRatio = 'auto',
  helperText = 'Format JPG, PNG, WEBP. Maks 10MB (otomatis dioptimalkan).',
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [processing, setProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Silakan pilih file gambar yang valid (JPG, PNG, WEBP)');
      return;
    }

    setProcessing(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) {
        setProcessing(false);
        return;
      }

      // Optimize image size using offscreen canvas to avoid massive payload strings
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          onChange(compressedDataUrl);
        } else {
          onChange(result);
        }
        setProcessing(false);
      };

      img.onerror = () => {
        onChange(result);
        setProcessing(false);
      };

      img.src = result;
    };

    reader.onerror = () => {
      alert('Gagal membaca file gambar');
      setProcessing(false);
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square max-h-48'
      : aspectRatio === 'video'
      ? 'aspect-video max-h-44'
      : aspectRatio === 'portrait'
      ? 'aspect-[3/4] max-h-56'
      : 'min-h-[120px] max-h-48';

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-gray-300 font-bold block text-xs">{label}</label>
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Hapus Foto</span>
            </button>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`relative group rounded-sm overflow-hidden bg-[#0D0D0D] border border-white/15 cursor-pointer flex items-center justify-center ${aspectClass}`}
        >
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2 p-2">
            <RefreshCw className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Klik untuk Ganti Foto
            </span>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-sm p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
            isDragOver
              ? 'border-white bg-white/10 text-white'
              : 'border-white/20 bg-[#0D0D0D] hover:border-white/40 text-gray-400 hover:text-white'
          } ${aspectClass}`}
        >
          {processing ? (
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-white" />
              <span className="text-xs font-semibold text-white">Memproses Foto...</span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-sm bg-[#161616] border border-white/10 flex items-center justify-center text-white">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">
                  Upload Foto dari HP / Galeri
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">{placeholder}</p>
              </div>
              <button
                type="button"
                className="px-3.5 py-1.5 rounded-sm bg-white text-black font-black text-[11px] uppercase tracking-wider hover:bg-gray-200 transition-colors shadow-sm"
              >
                PILIH FILE FOTO
              </button>
            </>
          )}
        </div>
      )}

      {helperText && <p className="text-[10px] text-gray-500">{helperText}</p>}
    </div>
  );
};
