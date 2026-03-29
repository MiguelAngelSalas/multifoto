"use client";

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { PageCanvas } from './components/PageCanvas';
import { useImageProcessor } from './hooks/useImageProcesor';

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
  
  const cropperRef = useRef<any>(null);
  const { createBlobUrl, revokeUrl } = useImageProcessor();

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
    const url = await createBlobUrl(cropper.getCroppedCanvas({ imageSmoothingQuality: 'medium' }));
    const nuevas = Array.from({ length: Math.max(1, cantidad) }).map(() => ({
      id: crypto.randomUUID(),
      src: url,
      w: ancho,
      h: alto,
      rotacion: 0
    }));
    setFotosEnHoja(prev => [...prev, ...nuevas]);
  }, [cantidad, ancho, alto, createBlobUrl]);

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
    const uW = 21 - ((margen / 10) * 2); 
    const uH = 29.7 - ((margen / 10) * 2);

    fotosEnHoja.forEach(f => {
      if (curX + f.w > uW + 0.05) { curX = 0; curY += maxH + gap; maxH = 0; }
      if (curY + f.h > uH + 0.05) { res.push(actual); actual = []; curX = 0; curY = 0; maxH = 0; }
      actual.push(f);
      curX += f.w + gap;
      maxH = Math.max(maxH, f.h);
    });
    if (actual.length > 0) res.push(actual);
    return res.length > 0 ? res : [[]];
  }, [fotosEnHoja, margen]);

  return (
    <div className="flex h-screen bg-neutral-900 text-white overflow-hidden select-none print:block print:bg-white print:h-auto">
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { 
            size: A4 portrait; 
            margin: 0 !important; 
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            height: auto !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:hidden { display: none !important; }

          .print\\:break-after-page { 
            display: flex !important;
            flex-wrap: wrap !important;
            align-content: flex-start !important;
            /* Medidas A4 Clavadas */
            width: 210mm !important;
            height: 297mm !important;
            page-break-after: always !important;
            break-after: page !important;
            margin: 0 !important;
            /* Esto obliga a que el padding se respete en la impresión */
            box-sizing: border-box !important;
            background-color: white !important;
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
      />
      
      <PageCanvas 
        paginas={paginasCalculadas} esCircular={esCircular} conBorde={conBorde} 
        margen={margen} onBorrar={onBorrar} onRotar={onRotar} 
      />
    </div>
  );
}