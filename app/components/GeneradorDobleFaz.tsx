"use client";

import React, { useState, useMemo } from 'react';

const HOJA_A4 = { w: 21, h: 29.7 };

export default function GeneradorDobleFaz() {
  // --- ESTADOS DE CONFIGURACIÓN ---
  const [ancho, setAncho] = useState<number | "">(5);
  const [alto, setAlto] = useState<number | "">(5);
  const [margen, setMargen] = useState<number | "">(1);
  const [gap, setGap] = useState<number | "">(0.5);

  // --- ESTADOS DE IMÁGENES ---
  const [frenteSrc, setFrenteSrc] = useState<string | null>(null);
  const [dorsoSrc, setDorsoSrc] = useState<string | null>(null);

  // --- HANDLERS DE ARCHIVOS ---
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, lado: 'frente' | 'dorso') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const url = URL.createObjectURL(e.target.files[0]);
    lado === 'frente' ? setFrenteSrc(url) : setDorsoSrc(url);
    e.target.value = ''; // Resetear input
  };

  const limpiar = () => {
    setFrenteSrc(null);
    setDorsoSrc(null);
  };

  // --- MATEMÁTICA DE GRILLA (Calculada automáticamente al cambiar medidas) ---
  const grilla = useMemo(() => {
    const w = Number(ancho);
    const h = Number(alto);
    const m = Number(margen);
    const g = Number(gap);

    if (w <= 0 || h <= 0) return [];

    const areaUtilW = HOJA_A4.w - (m * 2);
    const areaUtilH = HOJA_A4.h - (m * 2);
    
    const columnas = Math.floor((areaUtilW + g) / (w + g)) || 0;
    const filas = Math.floor((areaUtilH + g) / (h + g)) || 0;
    
    const items = [];
    for (let f = 0; f < filas; f++) {
      for (let c = 0; c < columnas; c++) {
        items.push({
          id: `${f}-${c}`,
          x: m + c * (w + g), // Posición X en cm
          y: m + f * (h + g), // Posición Y en cm
        });
      }
    }
    return items;
  }, [ancho, alto, margen, gap]);

  // --- FUNCIONES DE CONVERSIÓN A PORCENTAJE (Para diseño responsive) ---
  const toPctW = (cm: number) => `${(cm / HOJA_A4.w) * 100}%`;
  const toPctH = (cm: number) => `${(cm / HOJA_A4.h) * 100}%`;

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col font-sans print:bg-white print:text-black">
      
      {/* 🛠️ BARRA DE HERRAMIENTAS (Oculta al imprimir) */}
      <div className="p-6 bg-neutral-800 border-b border-neutral-700 shadow-xl print:hidden flex flex-wrap gap-8 items-end justify-between z-10 relative">
        
        {/* Controles de Medidas */}
        <div className="flex gap-4">
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-gray-400 mb-1">Medida (An x Al) cm</label>
            <div className="flex bg-neutral-900 border border-neutral-600 rounded-lg overflow-hidden">
              <input type="number" value={ancho} onChange={e => setAncho(e.target.value === "" ? "" : Number(e.target.value))} className="w-16 bg-transparent p-2 text-center text-green-500 font-black outline-none" />
              <span className="flex items-center text-gray-500 bg-neutral-800 px-2 font-bold">X</span>
              <input type="number" value={alto} onChange={e => setAlto(e.target.value === "" ? "" : Number(e.target.value))} className="w-16 bg-transparent p-2 text-center text-green-500 font-black outline-none" />
            </div>
          </div>
          
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-gray-400 mb-1">Separación cm</label>
            <input type="number" step="0.1" value={gap} onChange={e => setGap(e.target.value === "" ? "" : Number(e.target.value))} className="w-20 bg-neutral-900 border border-neutral-600 p-2 text-center text-blue-400 font-black outline-none rounded-lg" />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-gray-400 mb-1">Margen cm</label>
            <input type="number" step="0.1" value={margen} onChange={e => setMargen(e.target.value === "" ? "" : Number(e.target.value))} className="w-20 bg-neutral-900 border border-neutral-600 p-2 text-center text-purple-400 font-black outline-none rounded-lg" />
          </div>
        </div>

        {/* Subida de Imágenes */}
        <div className="flex gap-4">
          <label className="flex flex-col items-center justify-center bg-green-900/30 border border-green-600 hover:bg-green-800/50 text-green-400 px-4 py-2 rounded-xl cursor-pointer transition-colors">
            <span className="text-xs font-black uppercase tracking-widest">📷 Subir Frente</span>
            <input type="file" className="hidden" accept="image/*" onChange={e => handleUpload(e, 'frente')} />
          </label>
          <label className="flex flex-col items-center justify-center bg-blue-900/30 border border-blue-600 hover:bg-blue-800/50 text-blue-400 px-4 py-2 rounded-xl cursor-pointer transition-colors">
            <span className="text-xs font-black uppercase tracking-widest">📷 Subir Dorso</span>
            <input type="file" className="hidden" accept="image/*" onChange={e => handleUpload(e, 'dorso')} />
          </label>
        </div>

        {/* Acciones Finales */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-black text-white leading-none">{grilla.length}</p>
            <p className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Unidades / Hoja</p>
          </div>
          <button onClick={limpiar} className="p-3 bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white rounded-xl transition-colors font-bold">🗑️</button>
          <button onClick={() => window.print()} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-widest shadow-[0_0_20px_rgba(79,70,229,0.4)]">
            🖨️ Imprimir
          </button>
        </div>
      </div>

      {/* 📄 ÁREA DE HOJAS (El motor visual) */}
      <div className="flex-1 overflow-auto bg-neutral-950 p-10 print:p-0 flex flex-col md:flex-row items-center justify-center gap-10 print:gap-0 print:block">
        
        {/* PÁGINA 1: FRENTE */}
        <div className="flex flex-col items-center print:block">
          <div className="mb-4 bg-green-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest print:hidden shadow-[0_0_15px_rgba(22,163,74,0.5)]">
            Hoja 1: Frente
          </div>
          <div 
            className="bg-white relative shadow-2xl print:shadow-none print:w-[210mm] print:h-[297mm] print:break-after-page"
            style={{ width: '400px', aspectRatio: '21 / 29.7' }} // En pantalla se escala solo, en print usa mm
          >
            {grilla.map(item => (
              <div 
                key={`f-${item.id}`}
                className="absolute border border-green-500/20 border-dashed bg-neutral-100 flex items-center justify-center overflow-hidden"
                style={{
                  left: toPctW(item.x),
                  top: toPctH(item.y),
                  width: toPctW(Number(ancho)),
                  height: toPctH(Number(alto)),
                }}
              >
                {frenteSrc ? (
                  <img src={frenteSrc} className="w-full h-full object-cover" alt="frente" />
                ) : (
                  <span className="text-green-500 font-bold text-[8px]">FRENTE</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* PÁGINA 2: DORSO (ESPEJADA) */}
        <div className="flex flex-col items-center print:block">
          <div className="mb-4 bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest print:hidden shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            Hoja 2: Dorso
          </div>
          <div 
            className="bg-white relative shadow-2xl print:shadow-none print:w-[210mm] print:h-[297mm]"
            style={{ width: '400px', aspectRatio: '21 / 29.7' }}
          >
            {grilla.map(item => {
              // LA MAGIA DE IMPRENTA: Calculamos X espejado
              const w = Number(ancho);
              const xDorso = HOJA_A4.w - item.x - w;

              return (
                <div 
                  key={`d-${item.id}`}
                  className="absolute border border-blue-500/20 border-dashed bg-neutral-100 flex items-center justify-center overflow-hidden"
                  style={{
                    left: toPctW(xDorso), // Aplicamos el porcentaje al dorso
                    top: toPctH(item.y),
                    width: toPctW(w),
                    height: toPctH(Number(alto)),
                  }}
                >
                  {dorsoSrc ? (
                    <img src={dorsoSrc} className="w-full h-full object-cover" alt="dorso" />
                  ) : (
                    <span className="text-blue-500 font-bold text-[8px]">DORSO</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}