"use client";
import Link from 'next/link';

import React, { memo, useEffect } from 'react';
import Cropper from 'react-cropper';

export const Sidebar = memo(({ 
  ancho, setAncho, alto, setAlto, cantidad, setCantidad, margen, setMargen,
  conBorde, setConBorde, esCircular, setEsCircular, 
  archivos, activa, setActiva, cropperRef, onAgregar, onVaciar,
  onFileUpload, zoomIn, zoomOut 
}: any) => {

  // === ESTE ES EL FIX: Sincroniza el recuadro con los inputs ===
  useEffect(() => {
    const cropper = cropperRef.current?.cropper;
    if (cropper && activa) {
      // Forzamos al recuadro a tomar la nueva proporción
      cropper.setAspectRatio(ancho / alto);
      // Opcional: Esto hace que el recuadro se auto-ajuste al máximo posible con la nueva medida
      cropper.setCropBoxData(cropper.getCanvasData()); 
    }
  }, [ancho, alto, activa, cropperRef]);

  return (
    <div className="w-[420px] bg-neutral-800 p-5 flex flex-col shrink-0 overflow-y-auto border-r-4 border-green-500 z-10 print:hidden shadow-2xl">
      <Link href="/">
        <h2 className="text-2xl font-black text-green-500 italic uppercase mb-6 text-center tracking-tighter cursor-pointer hover:opacity-80 transition-opacity">
          Multi-Foto
        </h2>
      </Link>      
      <div className="grid grid-cols-2 gap-3 mb-4 text-black font-bold">
        <div className="text-center">
          <label className="text-[10px] text-white uppercase">Ancho (cm)</label>
          <input type="number" value={ancho} onChange={e => setAncho(Number(e.target.value))} className="w-full p-2 rounded outline-none border-2 border-white focus:border-green-500 text-white bg-neutral-700" />
        </div>
        <div className="text-center">
          <label className="text-[10px] text-white uppercase">Alto (cm)</label>
          <input type="number" value={alto} onChange={e => setAlto(Number(e.target.value))} className="w-full p-2 rounded outline-none border-2 border-white focus:border-green-500 text-white bg-neutral-700" />
        </div>
        <div className="text-center">
          <label className="text-[10px] text-white uppercase">Cant.</label>
          <input type="number" value={cantidad} onChange={e => setCantidad(Number(e.target.value))} className="w-full p-2 border-2 rounded text-white bg-neutral-700 outline-none border-white" />
        </div>
        <div className="text-center">
          <label className="text-[10px] text-white uppercase">Margen (mm)</label>
          <input type="number" value={margen} onChange={e => setMargen(Number(e.target.value))} className="w-full p-2 rounded border-2 text-white bg-neutral-700 outline-none border-white" />
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-6">
        <button onClick={() => setConBorde(!conBorde)} className={`p-3 rounded-lg border-2 font-bold text-[10px] uppercase transition-all ${conBorde ? 'bg-green-600 border-green-400' : 'bg-neutral-700 border-neutral-600 text-gray-400'}`}>✂️ Troquelado</button>
        <button onClick={() => setEsCircular(!esCircular)} className={`p-3 rounded-lg border-2 font-bold text-[10px] uppercase transition-all ${esCircular ? 'bg-blue-600 border-blue-400' : 'bg-neutral-700 border-neutral-600 text-gray-400'}`}>🔵 Circular</button>
      </div>

      <input type="file" id="up" accept="image/*" multiple className="hidden" onChange={onFileUpload} />
      <label htmlFor="up" className="block text-center bg-white text-black font-black py-4 rounded-xl cursor-pointer mb-4 uppercase text-sm">📁 Cargar Fotos</label>

      <div className="flex gap-2 overflow-x-auto mb-4 pb-2">
        {archivos.map((src: string, i: number) => (
          <img key={i} src={src} onClick={() => setActiva(src)} className={`w-[64px] h-[64px] object-cover rounded-lg cursor-pointer border-2 ${activa === src ? 'border-green-500 scale-110' : 'border-neutral-600'}`} alt="thumb" />
        ))}
      </div>

      <div className={`w-full h-[380px] bg-black rounded-xl overflow-hidden relative mb-4 border-2 border-neutral-700 ${activa ? 'block' : 'hidden'}`}>
        {activa && (
          <>
            <Cropper 
              src={activa} 
              style={{ height: '100%', width: '100%' }} 
              aspectRatio={ancho/alto} 
              guides={true} 
              viewMode={1} 
              ref={cropperRef} 
              background={false} 
              autoCropArea={1} 
              dragMode="move"
              zoomable={true} 
              zoomOnWheel={true} 
              wheelZoomRatio={0.1}
            />
            <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-30">
              <button onClick={zoomIn} className="w-12 h-12 bg-green-500 text-white font-black rounded-full border-2 border-white shadow-xl hover:bg-green-400 active:scale-90 transition-all text-2xl flex items-center justify-center">+</button>
              <button onClick={zoomOut} className="w-12 h-12 bg-red-500 text-white font-black rounded-full border-2 border-white shadow-xl hover:bg-red-400 active:scale-90 transition-all text-2xl flex items-center justify-center">-</button>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={onAgregar} className="flex-1 bg-green-600 hover:bg-green-500 font-black py-4 rounded-xl shadow-lg uppercase text-sm">Añadir</button>
        <button onClick={onVaciar} className="flex-1 bg-neutral-700 hover:bg-red-600 font-bold py-4 rounded-xl transition-all uppercase text-sm">Vaciar</button>
      </div>

      <button onClick={() => window.print()} className="w-full bg-blue-600 hover:bg-blue-500 font-black py-5 rounded-2xl text-xl mt-auto uppercase italic shadow-xl tracking-tighter">🖨️ Imprimir Plancha A4</button>
    </div>
  );
});

Sidebar.displayName = 'Sidebar';