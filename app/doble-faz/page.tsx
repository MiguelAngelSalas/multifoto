"use client";

import Link from 'next/link';
import React, { useState, useMemo } from 'react';

// Medidas reales A4 en cm
const HOJA_A4 = { w: 21, h: 29.7 };

export default function GeneradorDobleFazPro() {
  const [ancho, setAncho] = useState<number | "">(5);
  const [alto, setAlto] = useState<number | "">(5);
  const [margen, setMargen] = useState<number | "">(1);
  const [gap, setGap] = useState<number | "">(0.5);
  const [mostrarGuias, setMostrarGuias] = useState(true);

  const [imgFrente, setImgFrente] = useState<string | null>(null);
  const [imgDorso, setImgDorso] = useState<string | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, lado: 'frente' | 'dorso') => {
    if (!e.target.files?.[0]) return;
    const url = URL.createObjectURL(e.target.files[0]);
    lado === 'frente' ? setImgFrente(url) : setImgDorso(url);
    e.target.value = ''; 
  };

  const limpiarTodo = () => {
    setImgFrente(null);
    setImgDorso(null);
    setAncho(5);
    setAlto(5);
  };

  const { celdas, lineasH, lineasV } = useMemo(() => {
    const w = Number(ancho);
    const h = Number(alto);
    const m = Number(margen);
    const g = Number(gap);

    if (w <= 0 || h <= 0) return { celdas: [], lineasH: [], lineasV: [] };

    const areaUtilW = HOJA_A4.w - (m * 2);
    const areaUtilH = HOJA_A4.h - (m * 2);
    
    const columnas = Math.floor((areaUtilW + g) / (w + g)) || 1;
    const filas = Math.floor((areaUtilH + g) / (h + g)) || 1;
    
    const items = [];
    const setH = new Set<number>();
    const setV = new Set<number>();

    for (let f = 0; f < filas; f++) {
      const y = m + f * (h + g);
      setH.add(y);
      setH.add(y + h);

      for (let c = 0; c < columnas; c++) {
        const x = m + c * (w + g);
        items.push({ id: `cell-${f}-${c}`, x, y });
        setV.add(x);
        setV.add(x + w);
      }
    }
    return { celdas: items, lineasH: Array.from(setH), lineasV: Array.from(setV) };
  }, [ancho, alto, margen, gap]);

  const toPctW = (cm: number) => `${(cm / HOJA_A4.w) * 100}%`;
  const toPctH = (cm: number) => `${(cm / HOJA_A4.h) * 100}%`;

  return (
    <div className="min-h-screen bg-neutral-900 text-white font-sans flex flex-col print:bg-white print:text-black">
      
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 0 !important; size: A4; }
          html, body { margin: 0 !important; padding: 0 !important; background: white !important; overflow: visible !important; }
          header, footer, .print\\:hidden { display: none !important; }
          main { padding: 0 !important; display: block !important; }
          .hoja-impresion {
            width: 210mm !important;
            height: 297mm !important;
            box-shadow: none !important;
            border: none !important;
            page-break-after: always !important; 
            margin: 0 auto !important;
            position: relative !important;
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
          }
        }
      `}} />

      <header className="p-6 bg-neutral-800 border-b border-neutral-700 shadow-2xl flex flex-wrap gap-8 items-end justify-between print:hidden z-20">
        <div className="flex flex-col gap-2">
          <Link href="/">
            <h2 className="text-xl font-black text-green-500 italic uppercase tracking-tighter cursor-pointer hover:text-green-400 transition-colors">
              Multi-Foto
            </h2>
          </Link>
          <Link href="/editor">
            <h2 className="text-[10px] font-black text-gray-400 hover:text-white uppercase tracking-widest cursor-pointer transition-colors">
              ← Volver al Editor
            </h2>
          </Link>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Medida (cm)</label>
            <div className="flex bg-neutral-900 border border-neutral-600 rounded-lg overflow-hidden">
              <input type="number" value={ancho} onChange={e => setAncho(e.target.value === "" ? "" : Number(e.target.value))} className="w-14 bg-transparent p-2 text-center text-green-400 font-bold outline-none" placeholder="W" />
              <span className="flex items-center text-gray-600 font-bold px-1">x</span>
              <input type="number" value={alto} onChange={e => setAlto(e.target.value === "" ? "" : Number(e.target.value))} className="w-14 bg-transparent p-2 text-center text-green-400 font-bold outline-none" placeholder="H" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Espacio / Margen</label>
            <div className="flex gap-2">
              <input type="number" step="0.1" value={gap} onChange={e => setGap(e.target.value === "" ? "" : Number(e.target.value))} className="w-16 bg-neutral-900 border border-neutral-600 rounded-lg p-2 text-center text-blue-400 font-bold" title="Separación entre fotos" />
              <input type="number" step="0.1" value={margen} onChange={e => setMargen(e.target.value === "" ? "" : Number(e.target.value))} className="w-16 bg-neutral-900 border border-neutral-600 rounded-lg p-2 text-center text-purple-400 font-bold" title="Margen de hoja" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <label className="flex flex-col items-center justify-center bg-green-600/10 border border-green-600/50 hover:bg-green-600 hover:text-white text-green-500 px-4 py-2 rounded-xl cursor-pointer transition-all">
            <span className="text-[10px] font-black uppercase tracking-widest">Subir Frente</span>
            <input type="file" className="hidden" accept="image/*" onChange={e => handleUpload(e, 'frente')} />
          </label>
          <label className="flex flex-col items-center justify-center bg-blue-600/10 border border-blue-600/50 hover:bg-blue-600 hover:text-white text-blue-500 px-4 py-2 rounded-xl cursor-pointer transition-all">
            <span className="text-[10px] font-black uppercase tracking-widest">Subir Dorso</span>
            <input type="file" className="hidden" accept="image/*" onChange={e => handleUpload(e, 'dorso')} />
          </label>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right mr-2">
            <span className="block text-2xl font-black leading-none">{celdas.length}</span>
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">Fotos / Hoja</span>
          </div>

          <button 
            onClick={() => setMostrarGuias(!mostrarGuias)} 
            className={`p-3 rounded-xl transition-colors font-bold text-[10px] uppercase border-2 ${mostrarGuias ? 'bg-neutral-100 text-black border-neutral-100' : 'bg-neutral-800 text-gray-400 border-neutral-600'}`}
          >
            {mostrarGuias ? '✂️ Ocultar Guías' : '✂️ Mostrar Guías'}
          </button>

          <button onClick={limpiarTodo} className="p-3 bg-neutral-700 hover:bg-red-600 rounded-xl transition-colors">🗑️</button>
          <button onClick={() => window.print()} className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">
            🖨️ Imprimir pliego
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-12 bg-neutral-950 flex flex-col lg:flex-row items-center justify-center gap-16 print:p-0 print:block print:bg-white">
        
        {/* HOJA 1: FRENTE */}
        <section className="flex flex-col items-center gap-4 print:block">
          <div className="px-4 py-1 bg-green-600 text-[10px] font-black uppercase rounded-full print:hidden">Cara A: Frente</div>
          <div className="hoja-impresion bg-white relative shadow-[0_0_50px_rgba(0,0,0,0.5)] print:shadow-none overflow-hidden" style={{ width: '380px', aspectRatio: '21 / 29.7' }}>
            
            {/* ✂️ MOTOR VECTORIAL DE LÍNEAS (INDESTRUCTIBLE) */}
            {mostrarGuias && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                {lineasH.map(y => <line key={`h-f-${y}`} x1="0" y1={toPctH(y)} x2="100%" y2={toPctH(y)} stroke="black" strokeWidth="1.5" />)}
                {lineasV.map(x => <line key={`v-f-${x}`} x1={toPctW(x)} y1="0" x2={toPctW(x)} y2="100%" stroke="black" strokeWidth="1.5" />)}
              </svg>
            )}
            
            {celdas.map(cell => (
              <div 
                key={`f-${cell.id}`}
                // El fondo es transparente si no hay foto, así podés ver la grilla armada.
                className={`absolute overflow-hidden z-10 ${imgFrente ? 'bg-white' : 'bg-transparent'}`} 
                style={{
                  left: toPctW(cell.x), top: toPctH(cell.y),
                  width: toPctW(Number(ancho)), height: toPctH(Number(alto)),
                }}
              >
                {imgFrente ? <img src={imgFrente} className="w-full h-full object-cover" alt="Frente" /> : <div className="w-full h-full flex items-center justify-center text-[8px] text-green-600 bg-green-50/50 font-bold italic border border-green-400 border-dashed">FRENTE</div>}
              </div>
            ))}
          </div>
        </section>

        {/* HOJA 2: DORSO */}
        <section className="flex flex-col items-center gap-4 print:block break-before-page">
          <div className="px-4 py-1 bg-blue-600 text-[10px] font-black uppercase rounded-full print:hidden">Cara B: Dorso Espejado</div>
          <div className="hoja-impresion bg-white relative shadow-[0_0_50px_rgba(0,0,0,0.5)] print:shadow-none overflow-hidden" style={{ width: '380px', aspectRatio: '21 / 29.7' }}>
            
            {/* ✂️ MOTOR VECTORIAL DE LÍNEAS (ESPEJADO) */}
            {mostrarGuias && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                {lineasH.map(y => <line key={`h-d-${y}`} x1="0" y1={toPctH(y)} x2="100%" y2={toPctH(y)} stroke="black" strokeWidth="1.5" />)}
                {lineasV.map(x => {
                  const xEspejado = toPctW(HOJA_A4.w - x);
                  return <line key={`v-d-${x}`} x1={xEspejado} y1="0" x2={xEspejado} y2="100%" stroke="black" strokeWidth="1.5" />;
                })}
              </svg>
            )}

            {celdas.map(cell => {
              const w = Number(ancho);
              const xDorso = HOJA_A4.w - cell.x - w;

              return (
                <div 
                  key={`d-${cell.id}`}
                  className={`absolute overflow-hidden z-10 ${imgDorso ? 'bg-white' : 'bg-transparent'}`}
                  style={{
                    left: toPctW(xDorso), top: toPctH(cell.y),
                    width: toPctW(w), height: toPctH(Number(alto)),
                  }}
                >
                  {imgDorso ? <img src={imgDorso} className="w-full h-full object-cover" alt="Dorso" /> : <div className="w-full h-full flex items-center justify-center text-[8px] text-blue-600 bg-blue-50/50 font-bold italic border border-blue-400 border-dashed">DORSO</div>}
                </div>
              );
            })}
          </div>
        </section>

      </main>
    </div>
  );
}