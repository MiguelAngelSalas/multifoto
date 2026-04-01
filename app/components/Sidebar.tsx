"use client";
import Link from 'next/link';
import React, { memo, useEffect } from 'react';
import Cropper from 'react-cropper';

export const Sidebar = memo(({ 
  ancho, setAncho, alto, setAlto, cantidad, setCantidad, margen, setMargen,
  conBorde, setConBorde, esCircular, setEsCircular, 
  archivos, activa, setActiva, cropperRef, onAgregar, onVaciar,
  onFileUpload, zoomIn, zoomOut,
  colorHoja = "#ffffff", 
  setColorHoja,
  tamanoHoja,
  setTamanoHoja,
  opcionesTamano,
  modo, setModo,
  bordeSticker, setBordeSticker,
  // Props de IA recibidas desde el page.tsx
  quitarFondo,
  procesando
}: any) => {

  useEffect(() => {
    const cropper = cropperRef.current?.cropper;
    if (cropper && activa) {
      if (modo === 'plancha') {
        cropper.setAspectRatio(ancho / alto);
      } else {
        cropper.setAspectRatio(NaN); 
      }
    }
  }, [ancho, alto, activa, modo]);

  const manejarAccionPrincipal = () => {
    if (modo === 'png') {
      const cropper = cropperRef.current?.cropper;
      if (!cropper) return;
      const canvas = cropper.getCroppedCanvas();
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
      
      {/* HEADER */}
      <div className="p-4 pb-2 bg-neutral-800">
        <Link href="/">
          <h2 className="text-xl font-black text-green-500 italic uppercase mb-3 text-center tracking-tighter cursor-pointer">
            Multi-Foto
          </h2>
        </Link>

        <div className="flex gap-1 p-1 bg-neutral-900 rounded-lg border border-neutral-700">
          <button type="button" onClick={() => setModo('plancha')} className={`flex-1 py-2 rounded-md font-bold text-[8px] uppercase transition-all ${modo === 'plancha' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500'}`}>📏 Plancha</button>
          <button type="button" onClick={() => setModo('sticker')} className={`flex-1 py-2 rounded-md font-bold text-[8px] uppercase transition-all ${modo === 'sticker' ? 'bg-yellow-500 text-black shadow-lg' : 'text-gray-500'}`}>⭐ Sticker</button>
          <button type="button" onClick={() => setModo('png')} className={`flex-1 py-2 rounded-md font-bold text-[8px] uppercase transition-all ${modo === 'png' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500'}`}>✂️ PNG</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pt-1 space-y-4 scrollbar-thin scrollbar-thumb-neutral-600">
        
        {/* Galería con Botón IA condicional */}
        <div className="space-y-1.5">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <label className="w-14 h-14 min-w-[56px] bg-white text-black rounded-lg flex items-center justify-center cursor-pointer hover:bg-green-500 transition-all text-xl font-bold shadow-lg">
              + <input type="file" accept="image/*" multiple className="hidden" onChange={onFileUpload} />
            </label>
            {archivos.map((src: string, i: number) => (
              <div key={i} className="relative group min-w-[56px]">
                <img 
                  src={src} 
                  onClick={() => setActiva(src)} 
                  className={`w-14 h-14 object-cover rounded-lg cursor-pointer border-2 transition-all ${activa === src ? 'border-green-500 scale-105 shadow-md shadow-green-500/20' : 'border-neutral-700 opacity-60'}`} 
                  alt="thumb" 
                />
                
                {/* Varita mágica: Solo aparece en modo Sticker */}
                {modo === 'sticker' && (
                  <button 
                    type="button"
                    disabled={procesando}
                    onClick={(e) => { e.stopPropagation(); quitarFondo(src); }}
                    className={`absolute -top-1 -right-1 w-5 h-5 rounded-full shadow-xl flex items-center justify-center text-[10px] border border-neutral-900 transition-all hover:scale-110 active:scale-90 z-20 ${procesando ? 'bg-neutral-600 animate-pulse' : 'bg-yellow-500 text-black'}`}
                  >
                    {procesando && activa === src ? "⏳" : "✨"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Visor con Overlay de Carga */}
        <div className="w-full h-[400px] bg-neutral-900 rounded-2xl overflow-hidden relative border-2 border-neutral-700 shadow-inner group">
          {activa ? (
            <>
              <Cropper src={activa} style={{ height: '100%', width: '100%' }} aspectRatio={modo === 'plancha' ? ancho / alto : NaN} guides={true} viewMode={1} ref={cropperRef} background={false} autoCropArea={1} dragMode="move" zoomable={true} zoomOnWheel={true} />
              
              {/* Overlay de procesamiento */}
              {procesando && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-3">
                   <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                   <span className="text-yellow-500 font-black text-[10px] uppercase tracking-widest animate-pulse">Quitando Fondo...</span>
                </div>
              )}

              <div className="absolute bottom-3 right-3 flex flex-col gap-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                <button type="button" onClick={zoomIn} className="w-8 h-8 bg-white text-black font-black rounded-full shadow-xl flex items-center justify-center">+</button>
                <button type="button" onClick={zoomOut} className="w-8 h-8 bg-white text-black font-black rounded-full shadow-xl flex items-center justify-center">-</button>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-neutral-600 text-[8px] font-bold uppercase tracking-widest px-10 text-center italic">Cargá una imagen para {modo}</div>
          )}
        </div>

        {/* 🟡 SECCIÓN STICKERS */}
        {modo === 'sticker' && (
          <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/30 space-y-2 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <label className="text-[9px] text-yellow-500 uppercase font-black tracking-widest">Contorno Blanco</label>
              <span className="text-yellow-500 font-mono text-[10px]">{bordeSticker}mm</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="0" 
              step="0.5" 
              value={bordeSticker} 
              onChange={(e) => setBordeSticker(Number(e.target.value))} 
              className="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-yellow-500" 
            />
          </div>
        )}

        {/* 🟢 SECCIÓN PLANCHA */}
        {modo === 'plancha' && (
          <div className="grid grid-cols-2 gap-2 p-3 bg-neutral-900/50 rounded-xl border border-neutral-700 animate-in fade-in duration-200">
            <div className="flex flex-col text-center">
              <label className="text-[8px] text-gray-500 uppercase font-bold mb-0.5">Ancho (cm)</label>
              <input type="number" value={ancho} onChange={e => setAncho(Number(e.target.value))} className="w-full p-1.5 rounded-md border border-neutral-600 focus:border-green-500 text-white bg-neutral-800 font-bold text-[10px]" />
            </div>
            <div className="flex flex-col text-center">
              <label className="text-[8px] text-gray-500 uppercase font-bold mb-0.5">Alto (cm)</label>
              <input type="number" value={alto} onChange={e => setAlto(Number(e.target.value))} className="w-full p-1.5 rounded-md border border-neutral-600 focus:border-green-500 text-white bg-neutral-800 font-bold text-[10px]" />
            </div>
          </div>
        )}

        {/* CONFIGURACIÓN COMÚN */}
        {modo !== 'png' && (
          <div className="p-3 bg-neutral-900/50 rounded-xl border border-neutral-700 space-y-3">
             <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col text-center">
                  <label className="text-[8px] text-gray-500 uppercase font-bold mb-0.5">Copias</label>
                  <input type="number" value={cantidad} onChange={e => setCantidad(Number(e.target.value))} className="w-full p-1.5 rounded-md border border-neutral-600 text-white bg-neutral-800 text-[10px] font-bold" />
                </div>
                <div className="flex flex-col text-center">
                  <label className="text-[8px] text-gray-500 uppercase font-bold mb-0.5">Margen Hoja</label>
                  <input type="number" value={margen} onChange={e => setMargen(Number(e.target.value))} className="w-full p-1.5 rounded-md border border-neutral-600 text-white bg-neutral-800 text-[10px] font-bold" />
                </div>
             </div>
             <div className="grid grid-cols-4 gap-1">
                {opcionesTamano && Object.values(opcionesTamano).map((t: any) => (
                  <button key={t.nombre} type="button" onClick={() => setTamanoHoja(t)} className={`py-1.5 rounded-md font-black text-[9px] transition-all ${tamanoHoja?.nombre === t.nombre ? 'bg-white text-black' : 'bg-neutral-700 text-gray-500'}`}>{t.nombre}</button>
                ))}
             </div>
             <div className="flex items-center justify-between pt-2 border-t border-neutral-700">
                <input type="color" value={colorHoja} onChange={(e) => setColorHoja?.(e.target.value)} className="w-8 h-8 rounded-md cursor-pointer bg-neutral-700 border border-neutral-600 p-0.5" />
                <div className="flex gap-1">
                  <button type="button" onClick={() => setConBorde(!conBorde)} className={`px-2 py-1.5 rounded-md text-[8px] font-bold uppercase border ${conBorde ? 'border-green-500 text-green-500 bg-green-500/10' : 'border-neutral-700 text-neutral-600'}`}>Guía</button>
                  <button type="button" onClick={() => setEsCircular(!esCircular)} className={`px-2 py-1.5 rounded-md text-[8px] font-bold uppercase border ${esCircular ? 'border-blue-500 text-blue-500 bg-blue-500/10' : 'border-neutral-700 text-neutral-600'}`}>Círculo</button>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="p-4 bg-neutral-800 border-t border-neutral-700 space-y-2 mt-auto">
        <div className="flex gap-2">
          <button type="button" onClick={manejarAccionPrincipal} disabled={procesando} className={`flex-1 font-black py-3 rounded-xl shadow-xl uppercase text-[9px] tracking-widest transition-all text-white disabled:opacity-50 ${modo === 'sticker' ? 'bg-yellow-600' : modo === 'png' ? 'bg-blue-600' : 'bg-green-600'}`}>
            {modo === 'sticker' ? '⭐ Añadir Sticker' : modo === 'png' ? '⬇️ Bajar PNG' : 'Añadir'}
          </button>
          <button type="button" onClick={onVaciar} className="px-4 bg-neutral-700 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center text-sm">🗑️</button>
        </div>
        {modo !== 'png' && (
          <button type="button" onClick={() => window.print()} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3.5 rounded-xl text-[10px] uppercase italic shadow-2xl border-b-4 border-indigo-900 active:border-b-0 active:translate-y-0.5 transition-all">
            🖨️ Imprimir {tamanoHoja?.nombre}
          </button>
        )}
      </div>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';