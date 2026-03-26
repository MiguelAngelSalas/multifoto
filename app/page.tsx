"use client";

import React, { useState, useRef, useEffect } from 'react';
import Cropper from 'react-cropper';

// === INTERFACES ===
interface FotoRecorte {
  id: string;
  src: string;
  w: number;
  h: number;
}

export default function GeneradorMultiFotoPC() {
  // === ESTADOS ===
  const [archivos, setArchivos] = useState<string[]>([]);
  const [activa, setActiva] = useState<string | null>(null);
  
  const [ancho, setAncho] = useState<number>(4);
  const [alto, setAlto] = useState<number>(4);
  const [cantidad, setCantidad] = useState<number>(1);
  const [margen, setMargen] = useState<number>(10);
  
  const [fotosEnHoja, setFotosEnHoja] = useState<FotoRecorte[]>([]);
  const cropperRef = useRef<any>(null); 

  // === REACT-CROPPER BINDING FIX ===
  // Sincroniza el recuadro de recorte cuando cambias los inputs de cm
  useEffect(() => {
    const cropper = cropperRef.current?.cropper;
    if (cropper && activa) {
      const safeAlto = alto > 0 ? alto : 1;
      const safeAncho = ancho > 0 ? ancho : 1;
      const newRatio = safeAncho / safeAlto;
      cropper.setAspectRatio(newRatio);
    }
  }, [ancho, alto, activa]);

  // === SUBIDA DE ARCHIVOS ===
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
          if (event.target?.result) {
            const newSrc = event.target.result as string;
            setArchivos(prev => [...prev, newSrc]);
            setActiva(newSrc);
          }
        };
        reader.readAsDataURL(file);
      }
    });
    e.target.value = ''; 
  };

  // === MOTOR DE RECORTES ===
  const agregarALaHoja = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) {
      alert("Primero seleccioná una foto de la galería.");
      return;
    }

    const canvas = cropper.getCroppedCanvas({
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
      fillColor: '#fff'
    });

    if (!canvas) return;

    const urlAltaCalidad = canvas.toDataURL('image/png');
    
    const nuevasFotos: FotoRecorte[] = Array.from({ length: cantidad }).map(() => ({
      id: crypto.randomUUID(),
      src: urlAltaCalidad,
      w: ancho,
      h: alto
    }));

    setFotosEnHoja(prev => [...prev, ...nuevasFotos]);
  };

  // === EDICIÓN EN LA HOJA ===
  const rotarFoto = (id: string, currentSrc: string, currentW: number, currentH: number) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.height;
      canvas.height = img.width;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(90 * Math.PI / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const newSrc = canvas.toDataURL('image/png');
      
      setFotosEnHoja(prev => prev.map(foto => 
        foto.id === id ? { ...foto, src: newSrc, w: currentH, h: currentW } : foto
      ));
    };
    img.src = currentSrc;
  };

  const borrarFoto = (e: React.MouseEvent<HTMLImageElement>, id: string) => {
    e.preventDefault(); 
    setFotosEnHoja(prev => prev.filter(f => f.id !== id));
  };

  const vaciarTodo = () => {
    setFotosEnHoja([]);
    setArchivos([]);
    setActiva(null);
  };

  // === MOTOR MATEMÁTICO DE PAGINACIÓN ===
  const calcularPaginas = (): FotoRecorte[][] => {
    const paginas: FotoRecorte[][] = [];
    let paginaActual: FotoRecorte[] = [];
    let currentX = 0;
    let currentY = 0;
    let maxRowHeight = 0;
    
    const gap = 0.2; // 2mm
    const usableW = 21 - ((margen / 10) * 2); 
    const usableH = 29.7 - ((margen / 10) * 2); 

    fotosEnHoja.forEach(foto => {
      const fw = foto.w;
      const fh = foto.h;

      if (currentX + fw > usableW + 0.05) {
        currentX = 0;
        currentY += maxRowHeight + gap;
        maxRowHeight = 0;
      }

      if (currentY + fh > usableH + 0.05) {
        paginas.push(paginaActual);
        paginaActual = [];
        currentX = 0;
        currentY = 0;
        maxRowHeight = 0;
      }

      paginaActual.push(foto);
      currentX += fw + gap;
      maxRowHeight = Math.max(maxRowHeight, fh);
    });

    if (paginaActual.length > 0) paginas.push(paginaActual);
    if (paginas.length === 0) paginas.push([]); 
    
    return paginas;
  };

  const paginasRenderizadas = calcularPaginas();

  return (
    <div className="flex h-screen bg-neutral-900 text-white overflow-hidden font-sans print:block print:bg-white print:h-auto print:overflow-visible">
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white !important; }
        }
      `}} />

      {/* === PANEL IZQUIERDO === */}
      <div className="w-[420px] bg-neutral-800 p-5 flex flex-col shrink-0 overflow-y-auto border-r-4 border-green-500 z-10 print:hidden">
        
        {/* BRANDING / LOGO */}
        <div className="flex flex-col items-center justify-center mb-6 select-none">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-16 h-16 mb-2 drop-shadow-md transition-transform hover:scale-110">
            <circle cx="50" cy="50" r="48" fill="none" stroke="#22C55E" strokeWidth="4"/>
            <rect x="25" y="25" width="20" height="30" fill="#22C55E" rx="2" transform="rotate(-15 35 40)"/>
            <rect x="55" y="15" width="30" height="20" fill="#22C55E" rx="2" transform="rotate(15 70 25)"/>
            <rect x="65" y="50" width="20" height="30" fill="#22C55E" rx="2" transform="rotate(-10 75 65)"/>
            <rect x="30" y="60" width="30" height="20" fill="#22C55E" rx="2" transform="rotate(10 45 70)"/>
            <circle cx="50" cy="50" r="10" fill="#fff"/>
          </svg>
          <h2 className="text-2xl font-bold text-green-500 text-center tracking-wide uppercase">Multi-Foto</h2>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <div className="text-center">
            <label className="text-xs text-gray-400">Ancho (cm)</label><br/>
            <input type="number" value={ancho} onChange={(e) => setAncho(Number(e.target.value) || 0)} step="0.1" className="w-16 p-2 text-center rounded bg-neutral-900 border border-neutral-600 focus:outline-none focus:border-green-500 transition-colors" />
          </div>
          <div className="text-center">
            <label className="text-xs text-gray-400">Alto (cm)</label><br/>
            <input type="number" value={alto} onChange={(e) => setAlto(Number(e.target.value) || 0)} step="0.1" className="w-16 p-2 text-center rounded bg-neutral-900 border border-neutral-600 focus:outline-none focus:border-green-500 transition-colors" />
          </div>
          <div className="text-center">
            <label className="text-xs text-gray-400">Cantidad</label><br/>
            <input type="number" value={cantidad} onChange={(e) => setCantidad(Number(e.target.value) || 1)} min="1" className="w-16 p-2 text-center rounded bg-neutral-900 border border-neutral-600 focus:outline-none focus:border-green-500 transition-colors" />
          </div>
          <div className="text-center">
            <label className="text-xs text-gray-400">Margen (mm)</label><br/>
            <input type="number" value={margen} onChange={(e) => setMargen(Number(e.target.value) || 0)} min="0" className="w-16 p-2 text-center rounded bg-neutral-900 border border-neutral-600 focus:outline-none focus:border-green-500 transition-colors" />
          </div>
        </div>

        <input type="file" id="input-archivo" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
        <label htmlFor="input-archivo" className="block text-center bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl cursor-pointer shadow-lg active:scale-95 transition-all mb-4">
          📸 Elegir Fotos
        </label>

        <div className="flex gap-2 overflow-x-auto mb-4 pb-2 min-h-[68px]">
          {archivos.map((src, i) => (
            <img 
              key={i} src={src} alt="thumb"
              onClick={() => setActiva(src)}
              className={`w-[60px] h-[60px] object-cover rounded cursor-pointer border-2 transition-all shrink-0 ${activa === src ? 'border-green-500 scale-105' : 'border-neutral-600 hover:border-neutral-400'}`}
            />
          ))}
        </div>

        <div className={`w-full h-[300px] bg-black rounded overflow-hidden relative mb-4 ${activa ? 'block' : 'hidden'}`}>
          {activa && (
            <Cropper
              src={activa}
              style={{ height: '100%', width: '100%' }}
              aspectRatio={ancho / (alto || 1)}
              guides={true}
              viewMode={1}
              autoCropArea={0.8}
              dragMode="move"
              background={false}
              ref={cropperRef}
            />
          )}
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={agregarALaHoja} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded transition-colors shadow-lg">
            ➕ Agregar
          </button>
          <button onClick={vaciarTodo} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded transition-colors shadow-lg">
            🗑️ Vaciar
          </button>
        </div>

        <button onClick={() => window.print()} className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-4 rounded text-lg transition-colors shadow-lg mt-auto">
          🖨️ Imprimir PDF
        </button>

        <div className="bg-neutral-800 p-3 rounded mt-4 text-xs text-gray-300 border border-neutral-700">
          <strong>Controles en la hoja:</strong><br/>
          🖱️ <b>Clic Izq:</b> Rotar foto 90°<br/>
          🖱️ <b>Clic Der:</b> Borrar foto
        </div>
      </div>

      {/* === PANEL DERECHO (LIENZO) === */}
      <div className="flex-1 bg-neutral-900 p-8 flex flex-col items-center overflow-y-auto gap-8 pb-32 print:block print:p-0 print:bg-white print:overflow-visible print:w-full print:h-auto">
        {paginasRenderizadas.map((pagina, pageIndex) => (
          <div 
            key={pageIndex}
            className="bg-white box-border shrink-0 flex flex-wrap content-start shadow-[0_0_20px_rgba(0,0,0,0.8)] select-none overflow-hidden print:shadow-none print:m-0 print:break-after-page print:w-[210mm] print:h-[297mm]"
            style={{ 
              width: '210mm', 
              height: '297mm', 
              padding: `${margen}mm`, 
              gap: '2mm'
            }}
          >
            {pagina.map(foto => (
              <img 
                key={foto.id}
                src={foto.src}
                alt="recorte"
                onClick={() => rotarFoto(foto.id, foto.src, foto.w, foto.h)}
                onContextMenu={(e) => borrarFoto(e, foto.id)}
                className="block border border-gray-300 object-contain cursor-pointer transition-colors box-border hover:border-blue-500 hover:border-2"
                /* MEDIDAS SAGRADAS: minWidth y flexShrink evitan que el margen de la hoja achique la foto */
                style={{ 
                  width: `${foto.w}cm`, 
                  height: `${foto.h}cm`,
                  minWidth: `${foto.w}cm`,
                  minHeight: `${foto.h}cm`,
                  flexShrink: 0,
                  maxWidth: '100%', 
                  maxHeight: '100%' 
                }}
                title="Izq: Rotar | Der: Borrar"
              />
            ))}
          </div>
        ))}
      </div>

    </div>
  );
}