"use client";

import React, { memo } from 'react';
import { FotoRecorte } from '../types';

interface PageCanvasProps {
  paginas: FotoRecorte[][];
  esCircular: boolean;
  conBorde: boolean;
  margen: number;
  onBorrar: (id: string) => void;
  onRotar: (id: string, src: string, w: number, h: number) => void; 
  colorHoja: string;
  tamanoHoja: { nombre: string, w: number, h: number };
  // Pasamos el modo para saber cómo renderizar
  modo?: string;
}

export const PageCanvas = memo(({ 
  paginas, esCircular, conBorde, margen, onBorrar, onRotar, colorHoja, tamanoHoja, modo 
}: PageCanvasProps) => {

  const outlineStyle = conBorde ? '1.5px dashed #666' : 'none';
  const borderRadius = esCircular ? '50%' : '0';

  return (
    <div className="flex-1 bg-neutral-900 p-8 flex flex-col items-center overflow-y-auto gap-8 pb-32 print:block print:p-0 print:bg-white print:overflow-visible">
      
      <style jsx global>{`
        @media print {
          .canvas-sheet {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {paginas.map((pagina, pIdx) => (
        <div 
          key={pIdx} 
          className="canvas-sheet shrink-0 flex flex-wrap content-start shadow-2xl print:shadow-none print:break-after-page print:flex print:flex-wrap print:content-start" 
          style={{ 
            width: `${tamanoHoja.w}cm`, 
            height: `${tamanoHoja.h}cm`, 
            padding: `${margen}mm`, 
            gap: '3mm',
            position: 'relative',
            boxSizing: 'border-box',
            backgroundColor: colorHoja || '#ffffff'
          }}
        >
          {pagina.map((f) => {
            // 1. Detectamos si la rotación es vertical (90, 270, -90, etc.)
            const estaRotadaVertical = f.rotacion % 180 !== 0;

            return (
              <div 
                key={f.id}
                onClick={() => onRotar(f.id, f.src, f.w, f.h)}
                onContextMenu={(e) => { e.preventDefault(); onBorrar(f.id); }}
                className="cursor-pointer hover:opacity-90 active:scale-95 transition-all"
                style={{ 
                  width: `${f.w}cm`, 
                  height: `${f.h}cm`, 
                  minWidth: `${f.w}cm`, 
                  minHeight: `${f.h}cm`,
                  borderRadius: borderRadius, 
                  outline: outlineStyle, 
                  outlineOffset: '1px',
                  position: 'relative',
                  flexShrink: 0,
                  backgroundColor: 'transparent',
                  overflow: 'hidden' 
                }}
              >
                <img 
                  src={f.src} 
                  style={{ 
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    
                    // 2. LA MAGIA: Si está rotada, el ancho de la imagen es el ALTO del contenedor y viceversa
                    width: estaRotadaVertical ? `${f.h}cm` : `${f.w}cm`,
                    height: estaRotadaVertical ? `${f.w}cm` : `${f.h}cm`,
                    
                    // Mantenemos cover para que llene siempre el espacio o contain según prefieras
                    objectFit: modo === 'sticker' ? 'contain' : 'cover',
                    
                    transform: `translate(-50%, -50%) rotate(${f.rotacion || 0}deg)`,
                    transition: 'transform 0.2s ease', 
                    pointerEvents: 'none'
                  }} 
                  alt="foto"
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
});

PageCanvas.displayName = 'PageCanvas';