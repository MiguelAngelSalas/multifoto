"use client";
import React, { memo, useEffect } from 'react';
import Link from 'next/link';
import Cropper from 'react-cropper';
import { SidebarGallery } from './SidebarGallery';
import { StickerControls } from './StickerControls';
import { SheetSettings } from './SheetSettings';

interface SidebarProps {
  config: any;
  galeria: any;
  editor: any;
  opcionesHoja: any;
}

export const Sidebar = memo(({ config, galeria, editor, opcionesHoja }: SidebarProps) => {
  const { modo, setModo, tamanoHoja, setTamanoHoja } = config;
  const { archivos, activa, setActiva, onFileUpload, onVaciar, quitarFondo, procesando } = galeria;
  const { cropperRef, onAgregar } = editor;

  // Ajuste del Aspect Ratio dinámico
  useEffect(() => {
    const cropper = cropperRef.current?.cropper;
    if (cropper && activa) {
      cropper.setAspectRatio(modo === 'plancha' ? config.ancho / config.alto : NaN);
    }
  }, [config.ancho, config.alto, activa, modo, cropperRef]);

  const manejarAccionPrincipal = () => {
    // Seguridad extra: Si no hay imagen activa, no hacemos nada
    if (!activa) return;

    if (modo === 'png') {
      const canvas = cropperRef.current?.cropper.getCroppedCanvas();
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = `recorte-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } else {
      onAgregar();
    }
  };

  return (
    <aside className="w-[380px] bg-neutral-800 flex flex-col h-screen border-r-4 border-green-500 z-10 print:hidden shadow-2xl overflow-hidden scale-[0.9] origin-top">
      
      {/* HEADER & MODOS */}
      <div className="p-4 pb-2 bg-neutral-800">
        <Link href="/">
          <h2 className="text-xl font-black text-green-500 italic uppercase mb-3 text-center tracking-tighter cursor-pointer">
            Multi-Foto
          </h2>
        </Link>
        <div className="flex gap-1 p-1 bg-neutral-900 rounded-lg border border-neutral-700">
          {['plancha', 'sticker', 'png'].map((m) => (
            <button 
              key={m} 
              onClick={() => setModo(m)} 
              className={`flex-1 py-2 rounded-md font-bold text-[8px] uppercase transition-all ${
                modo === m 
                  ? (m === 'sticker' ? 'bg-yellow-500 text-black shadow-lg' : m === 'png' ? 'bg-blue-600 text-white shadow-lg' : 'bg-green-600 text-white shadow-lg') 
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              {m === 'plancha' ? '📏 Plancha' : m === 'sticker' ? '⭐ Sticker' : '✂️ PNG'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pt-1 space-y-4 scrollbar-thin scrollbar-thumb-neutral-600">
        
        {/* Galería con el ID para limpieza física */}
        <SidebarGallery {...galeria} modo={modo} />

        {/* Visor de Recorte */}
        <div className="w-full h-[350px] bg-neutral-900 rounded-2xl overflow-hidden relative border-2 border-neutral-700 group">
          {activa ? (
            <>
              <Cropper 
                src={activa} 
                style={{ height: '100%', width: '100%' }} 
                guides={true} 
                viewMode={1} 
                ref={cropperRef} 
                background={false} 
                autoCropArea={1} 
                dragMode="move" 
                zoomable={true} 
                zoomOnWheel={true} 
              />
              {procesando && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-3">
                   <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                   <span className="text-yellow-500 font-black text-[10px] uppercase tracking-widest animate-pulse">Procesando...</span>
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-neutral-600 text-[8px] font-bold uppercase px-10 text-center italic">
              Cargá una imagen para {modo}
            </div>
          )}
        </div>

        {/* CONTROLES DINÁMICOS POR MODO */}
        {modo === 'sticker' && (
          <StickerControls 
            ancho={config.anchoSticker} setAncho={config.setAnchoSticker} 
            alto={config.altoSticker} setAlto={config.setAltoSticker} 
            borde={config.bordeSticker} setBorde={config.setBordeSticker} 
          />
        )}

        {modo === 'plancha' && (
          <div className="grid grid-cols-2 gap-2 p-3 bg-neutral-900/50 rounded-xl border border-neutral-700 animate-in fade-in duration-200">
            <div className="flex flex-col text-center">
              <label className="text-[8px] text-gray-500 uppercase font-bold mb-0.5">Ancho Fijo (cm)</label>
              <input type="number" value={config.ancho} onChange={e => config.setAncho(Number(e.target.value))} className="w-full p-1.5 rounded-md border border-neutral-600 focus:border-green-500 text-white bg-neutral-800 font-bold text-[10px]" />
            </div>
            <div className="flex flex-col text-center">
              <label className="text-[8px] text-gray-500 uppercase font-bold mb-0.5">Alto Fijo (cm)</label>
              <input type="number" value={config.alto} onChange={e => config.setAlto(Number(e.target.value))} className="w-full p-1.5 rounded-md border border-neutral-600 focus:border-green-500 text-white bg-neutral-800 font-bold text-[10px]" />
            </div>
          </div>
        )}

        {modo !== 'png' && (
          <SheetSettings 
            cantidad={config.cantidad} 
            setCantidad={config.setCantidad}
            margen={config.margen} 
            setMargen={config.setMargen}
            tamanoHoja={tamanoHoja} 
            setTamanoHoja={setTamanoHoja}
            opcionesTamano={opcionesHoja}
            colorHoja={config.colorHoja}
            setColorHoja={config.setColorHoja}
          />
        )}
      </div>

      {/* FOOTER ACCIONES - EL FIX ESTÁ ACÁ */}
      <div className="p-4 bg-neutral-800 border-t border-neutral-700 space-y-2 mt-auto">
        <div className="flex gap-2">
          <button 
            type="button" 
            // FIX: Solo permite el click si hay una imagen 'activa'
            onClick={() => activa && manejarAccionPrincipal()} 
            // FIX: Deshabilitado visual y funcionalmente si no hay 'activa'
            disabled={procesando || !activa} 
            className={`flex-1 font-black py-3 rounded-xl shadow-xl uppercase text-[9px] tracking-widest transition-all text-white disabled:opacity-30 disabled:cursor-not-allowed ${
              modo === 'sticker' ? 'bg-yellow-600 hover:bg-yellow-500' : modo === 'png' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'
            }`}
          >
            {modo === 'sticker' ? '⭐ Añadir Sticker' : modo === 'png' ? '⬇️ Bajar PNG' : 'Añadir'}
          </button>
          <button 
            type="button" 
            onClick={onVaciar} 
            className="px-4 bg-neutral-700 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center text-sm"
          >
            🗑️
          </button>
        </div>
        {modo !== 'png' && (
          <button 
            type="button" 
            onClick={() => window.print()} 
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3.5 rounded-xl text-[10px] uppercase italic shadow-2xl border-b-4 border-indigo-900 active:border-b-0 active:translate-y-0.5 transition-all"
          >
            🖨️ Imprimir {tamanoHoja?.nombre}
          </button>
        )}
      </div>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';