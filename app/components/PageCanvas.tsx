"use client";

import React, { memo } from 'react';
import { FotoRecorte } from '../types';
import { useCanvasDraggable } from '../hooks/useCanvasDraggable';
import { StickerItem } from './StickerItem';

interface PageCanvasProps {
  paginas: FotoRecorte[][];
  config: {
    esCircular: boolean;
    conBorde: boolean;
    margen: number;
    modo: string;
    tamanoHoja: { nombre: string, w: number, h: number };
    colorHoja: string;
  };
  actions: {
    onBorrar: (id: string) => void;
    onRotar: (id: string, src: string, w: number, h: number) => void; 
    onMoverSticker: (id: string, x: number, y: number) => void; 
  };
}

export const PageCanvas = memo(({ paginas, config, actions }: PageCanvasProps) => {
  const { esCircular, conBorde, margen, modo, tamanoHoja, colorHoja } = config;
  const { onBorrar, onRotar, onMoverSticker } = actions;

  const { 
    arrastrandoId, 
    handleMouseDown, 
    handleMouseMove, 
    handleMouseUp, 
    handleMouseLeave 
  } = useCanvasDraggable(modo || 'plancha', onMoverSticker, onRotar);

  const borderRadius = esCircular ? '50%' : '0';
  const outlineStyle = conBorde ? '1.5px dashed #666' : 'none';

  return (
    <div 
      id="print-root"
      className="flex-1 bg-neutral-900 p-8 flex flex-col items-center overflow-y-auto gap-8 pb-32 print:block print:p-0 print:m-0 print:bg-white print:overflow-visible"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseLeave} 
      onMouseLeave={handleMouseLeave}
    >
      <style jsx global>{`
        @media print {
          @page { 
            margin: 0 !important; 
            size: ${tamanoHoja.w}cm ${tamanoHoja.h}cm; 
          }
          html, body { 
            margin: 0 !important; 
            padding: 0 !important; 
            background: white !important; 
            height: auto !important; 
            overflow: visible !important; 
          }
          #print-root { 
            display: block !important; 
            padding: 0 !important; 
            margin: 0 !important; 
            width: 100% !important;
          }
          .canvas-sheet { 
            display: ${modo === 'sticker' ? 'block' : 'flex'} !important;
            flex-wrap: wrap !important;
            align-content: flex-start !important;
            margin: 0 auto !important; 
            padding: ${margen}mm !important; 
            box-shadow: none !important; 
            page-break-after: always !important; 
            width: ${tamanoHoja.w}cm !important; 
            height: ${tamanoHoja.h}cm !important; 
            background-color: ${colorHoja || '#ffffff'} !important;
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            border: none !important;
          }
          /* Esto evita que los stickers se amontonen a la izquierda en modo plancha */
          .canvas-sheet > div {
            display: inline-block !important;
            vertical-align: top !important;
          }
          .print\:hidden, nav, aside, .sidebar { 
            display: none !important; 
          }
        }
      `}</style>

      {paginas.map((pagina, pIdx) => (
        <div 
          key={pIdx} 
          className="canvas-sheet shrink-0 shadow-2xl print:shadow-none relative" 
          style={{ 
            width: `${tamanoHoja.w}cm`, 
            height: `${tamanoHoja.h}cm`, 
            padding: `${margen}mm`, 
            boxSizing: 'border-box',
            backgroundColor: colorHoja || '#ffffff',
            display: modo === 'sticker' ? 'block' : 'flex',
            flexWrap: modo === 'sticker' ? undefined : 'wrap', 
            alignContent: 'flex-start',
            gap: modo === 'sticker' ? '0' : '3mm',
          }}
        >
          {pagina.map((f) => (
            <StickerItem 
              key={f.id}
              f={f}
              modo={modo}
              borderRadius={borderRadius}
              outlineStyle={outlineStyle}
              isDragging={arrastrandoId === f.id}
              handlers={{
                onMouseDown: handleMouseDown,
                onMouseUp: handleMouseUp,
                onBorrar: onBorrar,
                onRotar: onRotar
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
});

PageCanvas.displayName = 'PageCanvas';