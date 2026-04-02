import React from 'react';

interface SidebarGalleryProps {
  archivos: string[];
  activa: string | null;
  setActiva: (src: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  modo: string;
  quitarFondo: (src: string) => void;
  procesando: boolean;
}

export const SidebarGallery = ({ 
  archivos, 
  activa, 
  setActiva, 
  onFileUpload, 
  modo, 
  quitarFondo, 
  procesando 
}: SidebarGalleryProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide min-h-[70px]">
      {/* Botón de Carga */}
      <label className="w-14 h-14 min-w-[56px] bg-white text-black rounded-lg flex items-center justify-center cursor-pointer hover:bg-green-500 transition-all text-xl font-bold shadow-lg">
        + <input type="file" accept="image/*" multiple className="hidden" onChange={onFileUpload} />
      </label>

      {/* Lista de Imágenes */}
      {archivos.map((src) => {
        const isSelected = activa === src;
        const isCurrentProcessing = procesando && isSelected;

        return (
          <div key={src} className="relative group min-w-[56px]">
            <img 
              src={src} 
              onClick={() => setActiva(src)} 
              className={`w-14 h-14 object-cover rounded-lg cursor-pointer border-2 transition-all ${
                isSelected 
                  ? 'border-green-500 scale-105 shadow-md shadow-green-500/20' 
                  : 'border-neutral-700 opacity-60 hover:opacity-100'
              }`} 
              alt="Thumbnail" 
            />
            
            {/* Accion de IA para Stickers */}
            {modo === 'sticker' && (
              <button 
                type="button"
                disabled={procesando}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  quitarFondo(src); 
                }}
                className={`absolute -top-1 -right-1 w-5 h-5 rounded-full shadow-xl flex items-center justify-center text-[10px] border border-neutral-900 transition-all z-10 ${
                  isCurrentProcessing 
                    ? 'bg-neutral-600 animate-pulse' 
                    : 'bg-yellow-500 text-black hover:scale-110'
                }`}
              >
                {isCurrentProcessing ? "⏳" : "✨"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};