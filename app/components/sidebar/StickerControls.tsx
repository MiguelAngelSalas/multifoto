// components/sidebar/StickerControls.tsx
import React from 'react';

export const StickerControls = ({ ancho, setAncho, alto, setAlto, borde, setBorde }: any) => (
  <div className="space-y-3 animate-in zoom-in-95 duration-200">
    <div className="grid grid-cols-2 gap-2 p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
      <div className="flex flex-col text-center">
        <label className="text-[8px] text-yellow-600 uppercase font-bold mb-0.5">Ancho Sticker (cm)</label>
        <input 
          type="number" 
          value={ancho} 
          onChange={e => setAncho(Number(e.target.value))} 
          className="w-full p-1.5 rounded-md border border-yellow-500/50 text-white bg-neutral-800 font-bold text-[10px] focus:outline-none focus:border-yellow-500" 
        />
      </div>
      <div className="flex flex-col text-center">
        <label className="text-[8px] text-yellow-600 uppercase font-bold mb-0.5">Alto Sticker (cm)</label>
        <input 
          type="number" 
          value={alto} 
          onChange={e => setAlto(Number(e.target.value))} 
          className="w-full p-1.5 rounded-md border border-yellow-500/50 text-white bg-neutral-800 font-bold text-[10px] focus:outline-none focus:border-yellow-500" 
        />
      </div>
    </div>
    
    <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/30 space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[9px] text-yellow-500 uppercase font-black tracking-widest">Contorno Blanco</label>
        <span className="text-yellow-500 font-mono text-[10px] font-bold">{borde}mm</span>
      </div>
      <input 
        type="range" 
        min="0" 
        max="10" 
        step="0.5" 
        value={borde} 
        onChange={(e) => setBorde(Number(e.target.value))} 
        className="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-yellow-500" 
      />
    </div>
  </div>
);