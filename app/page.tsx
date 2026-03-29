"use client";

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { PageCanvas } from './components/PageCanvas';
import { useImageProcessor } from './hooks/useImageProcesor';

export default function GeneradorMultiFotoPC() {
  // === ESTADOS ===
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

  // === GESTIÓN DE MEMORIA ===
  const onVaciar = useCallback(() => {
    // Liberamos memoria de los objetos creados
    fotosEnHoja.forEach(f => revokeUrl(f.src));
    archivos.forEach(a => revokeUrl(a));
    setFotosEnHoja([]); 
    setArchivos([]); 
    setActiva(null);
  }, [fotosEnHoja, archivos, revokeUrl]);

  // === CARGA DE ARCHIVOS ===
  const onFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    Array.from(e.target.files).forEach(file => {
      const url = URL.createObjectURL(file);
      setArchivos(prev => [...prev, url]);
      setActiva(url);
    });
    e.target.value = '';
  }, []);

  // === AÑADIR A LA HOJA ===
  const onAgregar = useCallback(async () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    
    // Generamos el recorte con alta calidad y lo pasamos a Blob URL
    const url = await createBlobUrl(cropper.getCroppedCanvas({ imageSmoothingQuality: 'high' }));
    
    const nuevas = Array.from({ length: Math.max(1, cantidad) }).map(() => ({
      id: crypto.randomUUID(),
      src: url,
      w: ancho,
      h: alto
    }));
    setFotosEnHoja(prev => [...prev, ...nuevas]);
  }, [cantidad, ancho, alto, createBlobUrl]);

  // === BORRAR FOTO (CLICK DERECHO) ===
  const onBorrar = useCallback((id: string) => {
    setFotosEnHoja(prev => {
      const target = prev.find(f => f.id === id);
      if (target) revokeUrl(target.src); // Limpieza de memoria
      return prev.filter(f => f.id !== id);
    });
  }, [revokeUrl]);

  // === ROTAR FOTO EN LIENZO (CLICK IZQUIERDO) ===
  const onRotar = useCallback((id: string, currentSrc: string, currentW: number, currentH: number) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Invertimos dimensiones
      canvas.width = img.height; 
      canvas.height = img.width;
      const ctx = canvas.getContext('2d')!;
      
      // Lógica de rotación 90°
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      
      canvas.toBlob((blob) => {
        if (!blob) return;
        // Limpiamos la URL vieja antes de crear la nueva
        if (currentSrc.startsWith('blob:')) revokeUrl(currentSrc);
        
        const newUrl = URL.createObjectURL(blob);
        
        setFotosEnHoja(prev => prev.map(f => 
          f.id === id ? { ...f, src: newUrl, w: currentH, h: currentW } : f
        ));
      }, 'image/png');
    };
    img.src = currentSrc;
  }, [revokeUrl]);

  // === ZOOM CROPPER ===
  const zoomIn = useCallback(() => cropperRef.current?.cropper.zoom(0.1), []);
  const zoomOut = useCallback(() => cropperRef.current?.cropper.zoom(-0.1), []);

  // === MOTOR DE PAGINACIÓN OPTIMIZADO ===
  const paginasCalculadas = useMemo(() => {
    const res: any[][] = [];
    let actual: any[] = [];
    let curX = 0; let curY = 0; let maxH = 0;
    const gap = 0.3; // Espacio entre fotos en cm
    const uW = 21 - ((margen / 10) * 2); // Ancho útil en cm
    const uH = 29.7 - ((margen / 10) * 2); // Alto útil en cm

    fotosEnHoja.forEach(f => {
      // ¿Entra en el ancho de la fila?
      if (curX + f.w > uW + 0.05) { 
        curX = 0; 
        curY += maxH + gap; 
        maxH = 0; 
      }
      // ¿Entra en el alto de la página?
      if (curY + f.h > uH + 0.05) { 
        res.push(actual); 
        actual = []; 
        curX = 0; curY = 0; maxH = 0; 
      }
      actual.push(f);
      curX += f.w + gap;
      maxH = Math.max(maxH, f.h);
    });
    
    if (actual.length > 0) res.push(actual);
    return res.length > 0 ? res : [[]];
  }, [fotosEnHoja, margen]);

  return (
    <div className="flex h-screen bg-neutral-900 text-white overflow-hidden select-none print:block">
      {/* Sidebar Blindado con React.memo */}
      <Sidebar 
        ancho={ancho} setAncho={setAncho} 
        alto={alto} setAlto={setAlto}
        cantidad={cantidad} setCantidad={setCantidad} 
        margen={margen} setMargen={setMargen}
        conBorde={conBorde} setConBorde={setConBorde} 
        esCircular={esCircular} setEsCircular={setEsCircular}
        archivos={archivos} activa={activa} setActiva={setActiva} 
        cropperRef={cropperRef}
        onAgregar={onAgregar} onVaciar={onVaciar} onFileUpload={onFileUpload}
        zoomIn={zoomIn} zoomOut={zoomOut}
      />
      
      {/* Canvas Blindado con React.memo */}
      <PageCanvas 
        paginas={paginasCalculadas} 
        esCircular={esCircular} 
        conBorde={conBorde} 
        margen={margen} 
        onBorrar={onBorrar}
        onRotar={onRotar} 
      />
    </div>
  );
}