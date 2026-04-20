import { useState, useRef, useCallback } from 'react';
import { useImageProcessor } from './useImageProcesor';
import { ImageService } from '../utils/imageServices';
import { removeBackground } from '@imgly/background-removal';
import { trimCanvas } from '../utils/canvasHelper';

const CM_TO_PX = 38;

export const useMultiFotoEditor = (tamanoHoja: any) => {
  // --- ESTADOS ---
  const [archivos, setArchivos] = useState<string[]>([]);
  const [activa, setActiva] = useState<string | null>(null);
  const [ancho, setAncho] = useState<number | "">(4);
  const [alto, setAlto] = useState<number | "">(4);
  const [anchoSticker, setAnchoSticker] = useState<number | "">(6); 
  const [altoSticker, setAltoSticker] = useState<number | "">(6);
  const [cantidad, setCantidad] = useState(1);
  const [margen, setMargen] = useState(10);
  const [conBorde, setConBorde] = useState(false);
  const [esCircular, setEsCircular] = useState(false);
  const [fotosEnHoja, setFotosEnHoja] = useState<any[]>([]);
  const [colorHoja, setColorHoja] = useState("#ffffff");
  const [modo, setModo] = useState<'plancha' | 'png' | 'sticker'>('plancha');
  const [bordeSticker, setBordeSticker] = useState(2); 
  const [procesando, setProcesando] = useState(false);
  const [seleccionadas, setSeleccionadas] = useState<string[]>([]);
  //Estados Doble Faz
  const [dobleFaz, setDobleFaz] = useState(false);
  const [dorsoActiva, setDorsoActiva] = useState<string | null>(null);
  
  const cropperRef = useRef<any>(null);
  const { createBlobUrl, revokeUrl } = useImageProcessor();

  // --- ACCIONES DE GALERÍA ---
  const toggleSeleccion = useCallback((url: string) => {
    setSeleccionadas(prev => prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]);
  }, []);

  // Handler exclusivo para la foto del dorso en modo Doble Faz
  const onDorsoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const url = URL.createObjectURL(e.target.files[0]);
    setDorsoActiva(url);
    e.target.value = '';
  }, []);

  const quitarFondo = useCallback(async (imageSrc: string) => {
    setProcesando(true);
    try {
      const blob = await removeBackground(imageSrc, { model: 'isnet' });
      const url = URL.createObjectURL(blob);
      setArchivos(prev => [url, ...prev]);
      setActiva(url);
      return url;
    } catch (e) { 
      console.error("Error en IA:", e); return null;
    } finally { 
      setProcesando(false); 
    }
  }, []);

  const procesarLoteIA = useCallback(async () => {
    if (seleccionadas.length === 0) return;
    const aProcesar = [...seleccionadas];
    setSeleccionadas([]); 
    for (const url of aProcesar) { await quitarFondo(url); }
  }, [seleccionadas, quitarFondo]);

  const onFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const nuevasUrls = Array.from(e.target.files).map(file => URL.createObjectURL(file));
    setArchivos(prev => [...prev, ...nuevasUrls]);
    setActiva(nuevasUrls[0]);
    e.target.value = '';
  }, []);

  const onVaciar = useCallback(() => {
    archivos.forEach(revokeUrl);
    setFotosEnHoja([]);
    setSeleccionadas([]);
    setActiva(null); 
    const input = document.getElementById('main-file-input') as HTMLInputElement;
    if (input) input.value = ""; 
  }, [archivos, revokeUrl]);

  // --- ACCIONES DE EDICIÓN ---
  const onAgregar = useCallback(async () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    const valW = modo === 'sticker' ? anchoSticker : ancho;
    const valH = modo === 'sticker' ? altoSticker : alto;
    const tempWf = Number(valW);
    const tempHf = Number(valH);

    if (tempHf <= 0 || tempWf <= 0) {
      alert("Ingresa valores a los inputs de medidas por favor"); return;
    }

    let canvas = cropper.getCroppedCanvas({ imageSmoothingQuality: 'high', fillColor: 'transparent' });
    if (modo !== 'plancha') canvas = trimCanvas(canvas);
    if (modo === 'sticker' && bordeSticker > 0) canvas = await ImageService.applyStickerBorder(canvas, bordeSticker);
    
    const aspectRatio = canvas.width / canvas.height;
    const finalW = tempWf;
    const finalH = tempWf / aspectRatio; 

    const url = await createBlobUrl(canvas);
    const margenPx = margen * (CM_TO_PX / 10);
    const gap = 10;
    const stickerWidthPx = finalW * CM_TO_PX;
    const areaUtilWidth = (tamanoHoja.w * CM_TO_PX) - (margenPx * 2);
    const fotosPorFila = Math.floor(areaUtilWidth / (stickerWidthPx + gap)) || 1;

    const nuevas = Array.from({ length: Math.max(1, cantidad) }).map((_, i) => {
      const index = fotosEnHoja.length + i;
      return {
        id: crypto.randomUUID(),
        src: url, w: finalW, h: finalH,
        x: margenPx + (index % fotosPorFila) * (stickerWidthPx + gap),
        y: margenPx + Math.floor(index / fotosPorFila) * ((finalH * CM_TO_PX) + gap),
        tipo: modo 
      };
    });
    setFotosEnHoja(prev => [...prev, ...nuevas]);
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

  // Retornamos todo agrupado lógicamente para la vista
  return {
    config: { ancho, setAncho, alto, setAlto, anchoSticker, setAnchoSticker, altoSticker, setAltoSticker, cantidad, setCantidad, margen, setMargen, conBorde, setConBorde, esCircular, setEsCircular, colorHoja, setColorHoja, modo, setModo, bordeSticker, setBordeSticker },
    galeria: { archivos, activa, setActiva, onFileUpload, onVaciar, quitarFondo, procesando, seleccionadas, toggleSeleccion, procesarLoteIA },
    editor: { cropperRef, onAgregar },
    canvasActions: { onBorrar, onRotar, onMoverSticker },
    coreStates: { fotosEnHoja, modo, margen, esCircular, conBorde, colorHoja }
  };
};