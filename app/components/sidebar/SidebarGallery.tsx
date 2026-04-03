"use client";

import React, { useRef } from 'react';

interface SidebarGalleryProps {
  archivos: string[];
  activa: string | null;
  setActiva: (src: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  modo: string;
  quitarFondo: (src: string) => Promise<string | null>;
  procesando: boolean;
  seleccionadas: string[];
  toggleSeleccion: (src: string) => void;
  procesarLoteIA: () => Promise<void>;
}

export const SidebarGallery = ({ 
  archivos, 
  activa, 
  setActiva, 
  onFileUpload, 
  modo, 
  quitarFondo, 
  procesando,
  seleccionadas, 
  toggleSeleccion, 
  procesarLoteIA 
}: SidebarGalleryProps) => {

  return (
    <div className="space-y-3">
      {/* Cabecera con Acción de Lote */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">
          Galería {archivos.length > 0 && `(${archivos.length})`}
        </span>
        
        {seleccionadas.length > 0 && (
          <button 
            onClick={procesarLoteIA}
            disabled={procesando}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white transition-all animate-in fade-in zoom-in duration-200 disabled:opacity-50"
          >
            <span className="text-[9px] font-black uppercase italic">
              ✨ Procesar {seleccionadas.length}
            </span>
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide min-h-[75px] items-center px-1">
        {/* Botón de Carga */}
        <label className="w-14 h-14 min-w-[56px] bg-white text-black rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-green-500 transition-all shadow-lg group shrink-0">
          <span className="text-xl font-black group-hover:scale-125 transition-transform">+</span>
          <input 
            // CLAVE: El ID para poder limpiarlo desde onVaciar en el componente padre
            id="main-file-input"
            type="file" 
            accept="image/*" 
            multiple 
            className="hidden" 
            onChange={onFileUpload} 
          />
        </label>

        {/* Lista de Imágenes */}
        {archivos.map((src, index) => {
          const isSelected = activa === src;
          const isChecked = seleccionadas.includes(src);
          const isCurrentProcessing = procesando && isSelected;

          return (
            <div key={`${src}-${index}`} className="relative group min-w-[56px]">
              {/* Checkbox de Selección */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSeleccion(src);
                }}
                className={`absolute -top-1 -left-1 w-5 h-5 rounded-md z-20 flex items-center justify-center border transition-all ${
                  isChecked 
                    ? 'bg-green-500 border-green-400 text-black' 
                    : 'bg-black/50 border-neutral-600 text-transparent hover:border-green-500'
                }`}
              >
                {isChecked ? '✓' : ''}
              </button>

              <img 
                src={src} 
                onClick={() => setActiva(src)} 
                className={`w-14 h-14 object-cover rounded-xl cursor-pointer border-2 transition-all ${
                  isSelected 
                    ? 'border-green-500 scale-105 shadow-md shadow-green-500/20' 
                    : isChecked 
                      ? 'border-green-800 opacity-80'
                      : 'border-neutral-800 opacity-50 hover:opacity-100 hover:border-neutral-600'
                }`} 
                alt="Thumbnail" 
              />
              
              {/* Acción de IA Individual */}
              {modo === 'sticker' && (
                <button 
                  type="button"
                  disabled={procesando}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    quitarFondo(src); 
                  }}
                  className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full shadow-2xl flex items-center justify-center text-[10px] border-2 border-neutral-900 transition-all z-10 ${
                    isCurrentProcessing 
                      ? 'bg-neutral-800 animate-spin border-green-500' 
                      : 'bg-yellow-500 text-black hover:scale-110 active:scale-95'
                  }`}
                >
                  {isCurrentProcessing ? "◌" : "✨"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};