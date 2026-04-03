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
  
  // NUEVO: Estado para selección múltiple en la galería
  const [seleccionadas, setSeleccionadas] = useState<string[]>([]);
  
  const cropperRef = useRef<any>(null);
  const { createBlobUrl, revokeUrl } = useImageProcessor();
  const paginasCalculadas = useStickerLayout(fotosEnHoja, modo, margen, tamanoHoja);

  // --- Función de Selección ---
  const toggleSeleccion = useCallback((url: string) => {
    setSeleccionadas(prev => 
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    );
  }, []);

  // --- Acciones de Imagen ---
  const quitarFondo = useCallback(async (imageSrc: string) => {
    setProcesando(true);
    try {
      const blob = await removeBackground(imageSrc, { model: 'isnet' });
      const url = URL.createObjectURL(blob);
      setArchivos(prev => [url, ...prev]);
      setActiva(url);
      return url;
    } catch (e) { 
      console.error("Error en IA:", e);
      return null;
    } finally { 
      setProcesando(false); 
    }
  }, []);

  // NUEVO: Procesar todas las seleccionadas una por una
  const procesarLoteIA = useCallback(async () => {
    if (seleccionadas.length === 0) return;
    const aProcesar = [...seleccionadas];
    setSeleccionadas([]); // Limpiamos selección al empezar
    
    for (const url of aProcesar) {
      await quitarFondo(url);
    }
  }, [seleccionadas, quitarFondo]);

  // --- Manejo de Archivos ---
  const onFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const nuevasUrls = Array.from(e.target.files).map(file => URL.createObjectURL(file));
    setArchivos(prev => [...prev, ...nuevasUrls]);
    setActiva(nuevasUrls[0]);
    e.target.value = '';
  }, []);

  const onVaciar = useCallback(() => {
    // 1. Limpiamos la memoria de los Blobs (lo que ya hacías)
    archivos.forEach(revokeUrl);
    
    // 2. Vaciamos TODOS los estados de fotos
    setFotosEnHoja([]);
    setArchivos([]);
    setSeleccionadas([]);
    
    // 3. LA CLAVE: Matamos la imagen "activa" o "seleccionada"
    // Si no reseteás esto, al tocar "Añadir" el sistema usa la que quedó acá.
    setActiva(null); 

    // 4. El "Golpe de Gracia" al input físico (por el ID que pusimos)
    const input = document.getElementById('main-file-input') as HTMLInputElement;
    if (input) {
      input.value = ""; 
    }

    console.log("Sistema Clipp: Limpieza profunda completada.");
  }, [archivos, revokeUrl, setActiva]);

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

    // --- LÓGICA DE POSICIONAMIENTO DINÁMICO ---
    const margenPx = margen * (CM_TO_PX / 10); // mm a px
    const anchoHojaPx = tamanoHoja.w * CM_TO_PX;
    const stickerWidthPx = wF * CM_TO_PX;
    const stickerHeightPx = hF * CM_TO_PX;
    const gap = 10; // Espacio entre stickers en px

    // Calculamos cuántos entran por fila realmente (usando el ancho disponible)
    const areaUtilWidth = anchoHojaPx - (margenPx * 2);
    const fotosPorFila = Math.floor(areaUtilWidth / (stickerWidthPx + gap)) || 1;

    const nuevas = Array.from({ length: Math.max(1, cantidad) }).map((_, i) => {
      const index = fotosEnHoja.length + i;
      
      // X: Empezamos desde el margen izquierdo
      const xPos = margenPx + (index % fotosPorFila) * (stickerWidthPx + gap);
      
      // Y: Calculamos la posición global (puede caer en cualquier hoja)
      // También empezamos respetando el margen superior
      const yPos = margenPx + Math.floor(index / fotosPorFila) * (stickerHeightPx + gap);

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
    // Agregamos tamanoHoja y margen a las dependencias para que el cálculo sea exacto
  }, [cantidad, ancho, alto, anchoSticker, altoSticker, modo, fotosEnHoja.length, createBlobUrl, bordeSticker, tamanoHoja, margen]);

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
        galeria={{ 
          archivos, activa, setActiva, onFileUpload, onVaciar, 
          quitarFondo, procesando,
          seleccionadas, toggleSeleccion, procesarLoteIA // <--- Mandamos las nuevas acciones
        }}
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