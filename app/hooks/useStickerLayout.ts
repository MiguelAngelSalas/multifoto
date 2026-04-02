import { useMemo } from 'react';

// Constantes para evitar números mágicos
const CM_TO_PX = 38;
const SAFETY_MARGIN_CM = 0.2;
const DRIFT_TOLERANCE_CM = 0.05;

export const useStickerLayout = (fotosEnHoja: any[], modo: string, margen: number, tamanoHoja: any) => {
  
  // Función interna para el cálculo de grilla fija (Modo Plancha)
  const calculateFixedGrid = () => {
    const pages: any[][] = [];
    let currentPage: any[] = [];
    let curX = 0; 
    let curY = 0; 
    let rowMaxHeight = 0;
    const gap = 0.3; // cm entre fotos

    // Definición del área útil de la hoja (cm)
    const marginCm = margen / 10;
    const usableWidth = tamanoHoja.w - (marginCm * 2) - SAFETY_MARGIN_CM;
    const usableHeight = tamanoHoja.h - (marginCm * 2) - SAFETY_MARGIN_CM;

    fotosEnHoja.forEach(foto => {
      // ¿Cabe en la fila actual? Si no, salto de línea
      if (curX + foto.w > usableWidth + DRIFT_TOLERANCE_CM) {
        curX = 0;
        curY += rowMaxHeight + gap;
        rowMaxHeight = 0;
      }

      // ¿Cabe en la página actual? Si no, nueva página
      if (curY + foto.h > usableHeight + DRIFT_TOLERANCE_CM) {
        pages.push(currentPage);
        currentPage = [];
        curX = 0;
        curY = 0;
        rowMaxHeight = 0;
      }

      currentPage.push(foto);
      curX += foto.w + gap;
      rowMaxHeight = Math.max(rowMaxHeight, foto.h);
    });

    if (currentPage.length > 0) pages.push(currentPage);
    return pages.length > 0 ? pages : [[]];
  };

  // Función interna para el cálculo por coordenadas (Modo Sticker)
  const calculateFreePositioning = () => {
    const pages: any[][] = [];
    const pageHeightPx = tamanoHoja.h * CM_TO_PX;

    fotosEnHoja.forEach(foto => {
      const pageIndex = Math.floor((foto.y || 0) / pageHeightPx);
      
      if (!pages[pageIndex]) pages[pageIndex] = [];
      
      pages[pageIndex].push({
        ...foto,
        yRelativo: (foto.y || 0) % pageHeightPx
      });
    });

    // Filtramos páginas vacías para evitar saltos innecesarios
    return pages.length > 0 ? pages.map(p => p || []) : [[]];
  };

  return useMemo(() => {
    // Selección de estrategia según el modo
    return modo === 'sticker' 
      ? calculateFreePositioning() 
      : calculateFixedGrid();

  }, [fotosEnHoja, margen, tamanoHoja, modo]);
};