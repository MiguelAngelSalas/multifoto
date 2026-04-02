import { useState, useCallback } from 'react';
/**
 * Hook encargado de la lógica de arrastre (Drag & Drop).
 * Separa los eventos del mouse de la lógica de renderizado.
 */
export const useCanvasDraggable = (modo: string, onMoverSticker: any, onRotar: any) => {
  const [arrastrandoId, setArrastrandoId] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [haMovido, setHaMovido] = useState(false);

  // Iniciar arrastre
  const handleMouseDown = useCallback((e: React.MouseEvent, f: any) => {
    // Ignorar si es click derecho o si no estamos en modo sticker
    if (e.button === 2 || modo !== 'sticker') return;

    const rect = e.currentTarget.getBoundingClientRect();
    setOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setArrastrandoId(f.id);
    setHaMovido(false);
  }, [modo]);

  // Procesar movimiento
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!arrastrandoId || modo !== 'sticker') return;

    const sheet = (e.target as HTMLElement).closest('.canvas-sheet');
    if (!sheet) return;

    const rect = sheet.getBoundingClientRect();
    setHaMovido(true);

    // Calcular nuevas coordenadas
    let newX = e.clientX - rect.left - offset.x;
    let newY = e.clientY - rect.top - offset.y;
    
    // Límites de seguridad (ajustables)
    newX = Math.max(0, Math.min(newX, rect.width - 20)); 
    newY = Math.max(0, Math.min(newY, rect.height - 20));

    onMoverSticker(arrastrandoId, newX, newY);
  }, [arrastrandoId, modo, offset, onMoverSticker]);

  // Finalizar arrastre (o rotar si fue un click simple)
  const handleMouseUp = useCallback((e: React.MouseEvent, f: any) => {
    if (!arrastrandoId) return;

    // Si el usuario solo hizo click (no movió el mouse), rotamos
    if (!haMovido && arrastrandoId === f.id && modo === 'sticker') {
      onRotar(f.id, f.src, f.w, f.h);
    }
    
    setArrastrandoId(null);
  }, [arrastrandoId, haMovido, modo, onRotar]);

  // Cancelar si el mouse sale del área de trabajo
  const handleMouseLeave = useCallback(() => {
    setArrastrandoId(null);
  }, []);

  return {
    arrastrandoId,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave, // Agregado para mayor seguridad
  };
};