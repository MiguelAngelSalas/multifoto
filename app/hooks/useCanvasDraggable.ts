import { useState, useCallback } from 'react';

export const useCanvasDraggable = (
  modo: string, 
  onMoverSticker: (id: string, x: number, y: number) => void, 
  onRotar: any
) => {
  const [arrastrandoId, setArrastrandoId] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [haMovido, setHaMovido] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent, f: any) => {
    if (e.button === 2 || modo !== 'sticker') return;

    const root = document.getElementById('print-root');
    if (!root) return;
    const rootRect = root.getBoundingClientRect();

    // El offset es: dónde está el mouse respecto al 0,0 global MENOS donde ya está el sticker
    setOffset({
      x: e.clientX - rootRect.left - (f.x || 0),
      y: (e.clientY + root.scrollTop) - rootRect.top - (f.y || 0)
    });

    setArrastrandoId(f.id);
    setHaMovido(false);
  }, [modo]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!arrastrandoId || modo !== 'sticker') return;

    // Usamos el contenedor padre de TODAS las hojas como referencia fija
    const root = document.getElementById('print-root');
    if (!root) return;

    const rootRect = root.getBoundingClientRect();
    setHaMovido(true);

    // Calculamos la posición GLOBAL (X e Y) sumando el scroll
    // Esto hace que la "regla" empiece en el borde de la Hoja 1 y siga hasta el infinito
    const x = e.clientX - rootRect.left - offset.x;
    const y = (e.clientY + root.scrollTop) - rootRect.top - offset.y;

    // IMPORTANTE: Como ahora mandamos el Y global, el pIdx ya no hace falta
    // porque el Y ya incluye el alto de las hojas anteriores.
    onMoverSticker(arrastrandoId, x, y); 
  }, [arrastrandoId, modo, offset, onMoverSticker]);

  const handleMouseUp = useCallback((e: React.MouseEvent, f: any) => {
    if (!arrastrandoId) return;

    if (!haMovido && f && f.id === arrastrandoId && modo === 'sticker') {
      onRotar(f.id, f.src, f.w, f.h);
    }
    
    setArrastrandoId(null);
  }, [arrastrandoId, haMovido, modo, onRotar]);

  const handleMouseLeave = useCallback(() => {
    setArrastrandoId(null);
  }, []);

  return {
    arrastrandoId,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
  };
};