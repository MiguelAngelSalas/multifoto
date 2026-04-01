"use client";

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Sidebar } from '../components/Sidebar';
import { PageCanvas } from '../components/PageCanvas';
import { useImageProcessor } from '../hooks/useImageProcesor';
// Importación corregida para evitar el error "not callable"
import { removeBackground } from '@imgly/background-removal';

const TAMANOS_HOJA = {
  A4: { nombre: 'A4', w: 21, h: 29.7 },
  A3: { nombre: 'A3', w: 29.7, h: 42 },
  A2: { nombre: 'A2', w: 42, h: 59.4 },
  A1: { nombre: 'A1', w: 59.4, h: 84.1 },
};

export default function GeneradorMultiFotoPC() {
  const [archivos, setArchivos] = useState<string[]>([]);
  const [activa, setActiva] = useState<string | null>(null);
  const [ancho, setAncho] = useState<number>(4);
  const [alto, setAlto] = useState<number>(4);
  const [cantidad, setCantidad] = useState<number>(1);
  const [margen, setMargen] = useState<number>(10);
  const [conBorde, setConBorde] = useState<boolean>(false);
  const [esCircular, setEsCircular] = useState<boolean>(false);
  const [fotosEnHoja, setFotosEnHoja] = useState<any[]>([]);
  const [colorHoja, setColorHoja] = useState<string>("#ffffff");
  const [tamanoHoja, setTamanoHoja] = useState(TAMANOS_HOJA.A4);

  // === ESTADOS PARA STICKERS e IA ===
  const [modo, setModo] = useState<'plancha' | 'png' | 'sticker'>('plancha');
  const [bordeSticker, setBordeSticker] = useState<number>(2); 
  const [procesando, setProcesando] = useState<boolean>(false);
  
  const cropperRef = useRef<any>(null);
  const { createBlobUrl, revokeUrl } = useImageProcessor();

  // === FUNCIÓN PARA QUITAR FONDO (IA) ===
  const quitarFondo = useCallback(async (imageSrc: string) => {
    if (procesando) return;
    setProcesando(true);
    
    try {
      // Usamos 'isnet' que es el modelo estándar compatible
      const blob = await removeBackground(imageSrc, {
        model: 'isnet',
        progress: (step, progress) => {
          console.log(`IA: ${step} ${Math.round(progress * 100)}%`);
        }
      });
      
      const url = URL.createObjectURL(blob);
      
      // Añadimos la versión transparente a la galería y la activamos
      setArchivos(prev => [url, ...prev]);
      setActiva(url);
    } catch (error) {
      console.error("Error quitando fondo:", error);
      alert("No se pudo procesar la imagen.");
    } finally {
      setProcesando(false);
    }
  }, [procesando]);

  const onVaciar = useCallback(() => {
    archivos.forEach(a => revokeUrl(a));
    const urlsUnicas = new Set(fotosEnHoja.map(f => f.src));
    urlsUnicas.forEach(url => revokeUrl(url));
    setFotosEnHoja([]); 
    setArchivos([]); 
    setActiva(null);
  }, [fotosEnHoja, archivos, revokeUrl]);

  const onFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    Array.from(e.target.files).forEach(file => {
      const url = URL.createObjectURL(file);
      setArchivos(prev => [...prev, url]);
      setActiva(url);
    });
    e.target.value = '';
  }, []);

  const onAgregar = useCallback(async () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    const croppedCanvas = cropper.getCroppedCanvas({ 
      imageSmoothingQuality: 'high',
      fillColor: 'transparent' 
    });
    
    let finalCanvas = croppedCanvas;

    if (modo === 'sticker' && bordeSticker > 0) {
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return;

      const thickness = Math.round(bordeSticker * 3.5); 
      tempCanvas.width = croppedCanvas.width + (thickness * 2);
      tempCanvas.height = croppedCanvas.height + (thickness * 2);

      ctx.shadowColor = 'white';
      ctx.shadowBlur = 0; 
      
      for (let angle = 0; angle < 360; angle += 15) {
        const x = thickness + Math.cos(angle * Math.PI / 180) * thickness;
        const y = thickness + Math.sin(angle * Math.PI / 180) * thickness;
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(croppedCanvas, x, y);
      }

      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = 'white';
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(croppedCanvas, thickness, thickness);
      
      finalCanvas = tempCanvas;
    }

    const url = await createBlobUrl(finalCanvas);
    
    const nuevas = Array.from({ length: Math.max(1, cantidad) }).map(() => ({
      id: crypto.randomUUID(),
      src: url,
      w: ancho, 
      h: alto,
      rotacion: 0
    }));

    setFotosEnHoja(prev => [...prev, ...nuevas]);
  }, [cantidad, ancho, alto, modo, bordeSticker, createBlobUrl]);

  const onBorrar = useCallback((id: string) => {
    setFotosEnHoja(prev => {
      const target = prev.find(f => f.id === id);
      if (!target) return prev;
      const urlABorrar = target.src;
      const contadorReferencias = prev.filter(f => f.src === urlABorrar).length;
      if (contadorReferencias === 1) revokeUrl(urlABorrar); 
      return prev.filter(f => f.id !== id);
    });
  }, [revokeUrl]);

  const onRotar = useCallback((id: string, currentSrc: string, currentW: number, currentH: number) => {
    setFotosEnHoja(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, w: currentH, h: currentW, rotacion: ((f.rotacion || 0) + 90) % 360 };
      }
      return f;
    }));
  }, []);

  const paginasCalculadas = useMemo(() => {
    const res: any[][] = [];
    let actual: any[] = [];
    let curX = 0; let curY = 0; let maxH = 0;
    const gap = 0.3;
    
    const uW = tamanoHoja.w - ((margen / 10) * 2); 
    const uH = tamanoHoja.h - ((margen / 10) * 2);

    fotosEnHoja.forEach(f => {
      if (curX + f.w > uW + 0.05) { curX = 0; curY += maxH + gap; maxH = 0; }
      if (curY + f.h > uH + 0.05) { res.push(actual); actual = []; curX = 0; curY = 0; maxH = 0; }
      actual.push(f);
      curX += f.w + gap;
      maxH = Math.max(maxH, f.h);
    });
    if (actual.length > 0) res.push(actual);
    return res.length > 0 ? res : [[]];
  }, [fotosEnHoja, margen, tamanoHoja]);

  return (
    <div className="flex h-screen bg-neutral-900 text-white overflow-hidden select-none print:block print:bg-white print:h-auto">
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: ${tamanoHoja.nombre} portrait; margin: 0 !important; }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            height: auto !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden { display: none !important; }

          .print\\:break-after-page { 
            display: flex !important;
            flex-wrap: wrap !important;
            align-content: flex-start !important;
            width: ${tamanoHoja.w}cm !important;
            height: ${tamanoHoja.h}cm !important;
            page-break-after: always !important;
            break-after: page !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            background-color: ${colorHoja} !important;
            position: relative !important;
          }
        }
      `}} />

      <Sidebar 
        ancho={ancho} setAncho={setAncho} alto={alto} setAlto={setAlto}
        cantidad={cantidad} setCantidad={setCantidad} margen={margen} setMargen={setMargen}
        conBorde={conBorde} setConBorde={setConBorde} esCircular={esCircular} setEsCircular={setEsCircular}
        archivos={archivos} activa={activa} setActiva={setActiva} cropperRef={cropperRef}
        onAgregar={onAgregar} onVaciar={onVaciar} onFileUpload={onFileUpload}
        zoomIn={() => cropperRef.current?.cropper.zoom(0.1)} zoomOut={() => cropperRef.current?.cropper.zoom(-0.1)}
        colorHoja={colorHoja} setColorHoja={setColorHoja}
        tamanoHoja={tamanoHoja} setTamanoHoja={setTamanoHoja} opcionesTamano={TAMANOS_HOJA}
        modo={modo} setModo={setModo}
        bordeSticker={bordeSticker} setBordeSticker={setBordeSticker}
        // === PROPS PASADAS CORRECTAMENTE ===
        quitarFondo={quitarFondo}
        procesando={procesando}
      />
      
      <PageCanvas 
        paginas={paginasCalculadas} esCircular={esCircular} conBorde={conBorde} 
        margen={margen} onBorrar={onBorrar} onRotar={onRotar} 
        colorHoja={colorHoja} tamanoHoja={tamanoHoja} modo={modo}
      />
    </div>
  );
}