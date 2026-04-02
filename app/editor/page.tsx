"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Sidebar } from '../components/sidebar/Sidebar';
import { PageCanvas } from '../components/PageCanvas';
import { useImageProcessor } from '../hooks/useImageProcesor';
import { useStickerLayout } from '../hooks/useStickerLayout';
import { ImageService } from '../utils/imageServices';
import { removeBackground } from '@imgly/background-removal';

const TAMANOS_HOJA = {
  A4: { nombre: 'A4', w: 21, h: 29.7 },
  A3: { nombre: 'A3', w: 29.7, h: 42 },
};

// Constante de conversión para mantener consistencia
const CM_TO_PX = 38;

export default function GeneradorMultiFotoPC() {
  // --- Estados de UI y Configuración ---
  const [archivos, setArchivos] = useState<string[]>([]);
  const [activa, setActiva] = useState<string | null>(null);
  const [ancho, setAncho] = useState(4);
  const [alto, setAlto] = useState(4);
  const [anchoSticker, setAnchoSticker] = useState(6); 
  const [altoSticker, setAltoSticker] = useState(6);
  const [cantidad, setCantidad] = useState(1);
  const [margen, setMargen] = useState(10);
  const [conBorde, setConBorde] = useState(false);
  const [esCircular, setEsCircular] = useState(false);
  const [fotosEnHoja, setFotosEnHoja] = useState<any[]>([]);
  const [colorHoja, setColorHoja] = useState("#ffffff");
  const [tamanoHoja, setTamanoHoja] = useState(TAMANOS_HOJA.A4);
  const [modo, setModo] = useState<'plancha' | 'png' | 'sticker'>('plancha');
  const [bordeSticker, setBordeSticker] = useState(2); 
  const [procesando, setProcesando] = useState(false);
  
  const cropperRef = useRef<any>(null);
  const { createBlobUrl, revokeUrl } = useImageProcessor();
  const paginasCalculadas = useStickerLayout(fotosEnHoja, modo, margen, tamanoHoja);

  // --- Manejo de Archivos ---
  const onFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const nuevasUrls = Array.from(e.target.files).map(file => URL.createObjectURL(file));
    setArchivos(prev => [...prev, ...nuevasUrls]);
    setActiva(nuevasUrls[0]);
    e.target.value = ''; // Reset para permitir subir la misma foto
  }, []);

  const onVaciar = useCallback(() => {
    archivos.forEach(revokeUrl);
    setFotosEnHoja([]);
    setArchivos([]);
    setActiva(null);
  }, [archivos, revokeUrl]);

  // --- Acciones de Imagen ---
  const quitarFondo = useCallback(async (imageSrc: string) => {
    if (procesando) return;
    setProcesando(true);
    try {
      const blob = await removeBackground(imageSrc, { model: 'isnet' });
      const url = URL.createObjectURL(blob);
      setArchivos(prev => [url, ...prev]);
      setActiva(url);
    } catch (e) { 
      console.error(e);
      alert("Error con la IA al quitar fondo"); 
    } finally { 
      setProcesando(false); 
    }
  }, [procesando]);

  const onAgregar = useCallback(async () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    let canvas = cropper.getCroppedCanvas({ imageSmoothingQuality: 'high', fillColor: 'transparent' });

    if (modo === 'sticker' && bordeSticker > 0) {
      canvas = await ImageService.applyStickerBorder(canvas, bordeSticker);
    }

    const url = await createBlobUrl(canvas);
    const wF = modo === 'sticker' ? anchoSticker : ancho;
    const hF = modo === 'sticker' ? altoSticker : alto;

    const nuevas = Array.from({ length: Math.max(1, cantidad) }).map((_, i) => {
      const index = fotosEnHoja.length + i;
      // Posicionamiento inicial automático para Stickers
      const xPos = (index % 4) * (wF * CM_TO_PX + 20);
      const yPos = Math.floor(index / 4) * (hF * CM_TO_PX + 20);

      return {
        id: crypto.randomUUID(),
        src: url,
        w: wF, 
        h: hF,
        x: xPos,
        y: yPos,
        tipo: modo 
      };
    });

    setFotosEnHoja(prev => [...prev, ...nuevas]);
  }, [cantidad, ancho, alto, anchoSticker, altoSticker, modo, fotosEnHoja.length, createBlobUrl, bordeSticker]);

  const onRotar = useCallback(async (id: string, currentSrc: string) => {
    const nuevaUrl = await ImageService.rotateImage(currentSrc);
    setFotosEnHoja(prev => prev.map(f => f.id === id ? { ...f, src: nuevaUrl, w: f.h, h: f.w } : f));
  }, []);

  const onMoverSticker = useCallback((id: string, x: number, y: number) => {
    setFotosEnHoja(prev => prev.map(f => f.id === id ? { ...f, x, y } : f));
  }, []);

  const onBorrar = useCallback((id: string) => {
    setFotosEnHoja(prev => {
      const target = prev.find(f => f.id === id);
      if (target && !target.src.startsWith('data:')) revokeUrl(target.src);
      return prev.filter(f => f.id !== id);
    });
  }, [revokeUrl]);

  return (
    <div className="flex h-screen bg-neutral-900 text-white overflow-hidden select-none print:block print:bg-white print:h-auto">
      <Sidebar 
        config={{
          ancho, setAncho, alto, setAlto, 
          anchoSticker, setAnchoSticker, altoSticker, setAltoSticker,
          cantidad, setCantidad, margen, setMargen,
          conBorde, setConBorde, esCircular, setEsCircular,
          colorHoja, setColorHoja, tamanoHoja, setTamanoHoja,
          modo, setModo, bordeSticker, setBordeSticker
        }}
        galeria={{ archivos, activa, setActiva, onFileUpload, onVaciar, quitarFondo, procesando }}
        editor={{ cropperRef, onAgregar }}
        opcionesHoja={TAMANOS_HOJA}
      />
      
      <PageCanvas 
        paginas={paginasCalculadas}
        config={{ esCircular, conBorde, margen, colorHoja, tamanoHoja, modo }}
        actions={{ onBorrar, onRotar, onMoverSticker }}
      />
    </div>
  );
}