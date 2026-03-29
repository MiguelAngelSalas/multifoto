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
}

export const PageCanvas = memo(({ 
  paginas, esCircular, conBorde, margen, onBorrar, onRotar 
}: PageCanvasProps) => {

  const outlineStyle = conBorde ? '1.5px dashed #666' : '1px solid #eee';
  const borderRadius = esCircular ? '50%' : '0';

  return (
    <div className="flex-1 bg-neutral-900 p-8 flex flex-col items-center overflow-y-auto gap-8 pb-32 print:block print:p-0 print:bg-white print:overflow-visible">
      {paginas.map((pagina, pIdx) => (
        <div 
          key={pIdx} 
          /* CLAVE PARA IMPRESIÓN: 
            Usamos print:flex para que los márgenes (padding) y el gap se 
            mantengan idénticos a la visualización de la web.
          */
          className="bg-white shrink-0 flex flex-wrap content-start shadow-2xl print:shadow-none print:break-after-page print:flex print:flex-wrap print:content-start" 
          style={{ 
            width: '210mm', 
            height: '297mm', 
            padding: `${margen}mm`, 
            gap: '3mm',
            position: 'relative',
            boxSizing: 'border-box',
            backgroundColor: 'white'
          }}
        >
          {pagina.map((f) => {
            const estaRotada = f.rotacion % 180 !== 0;

            return (
              <div 
                key={f.id}
                onClick={() => onRotar(f.id, f.src, f.w, f.h)}
                onContextMenu={(e) => { e.preventDefault(); onBorrar(f.id); }}
                className="cursor-pointer hover:opacity-90 active:scale-95 transition-all bg-white overflow-hidden"
                style={{ 
                  width: `${f.w}cm`, 
                  height: `${f.h}cm`, 
                  minWidth: `${f.w}cm`, 
                  minHeight: `${f.h}cm`,
                  borderRadius: borderRadius, 
                  outline: outlineStyle, 
                  outlineOffset: conBorde ? '1.5px' : '-1px',
                  position: 'relative',
                  flexShrink: 0,
                  /* Evita que una foto se parta a la mitad entre dos hojas */
                  breakInside: 'avoid',
                  pageBreakInside: 'avoid'
                }}
              >
                <img 
                  src={f.src} 
                  style={{ 
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    /* Si está rotada 90/270, invertimos proporciones para llenar el contenedor */
                    width: estaRotada ? `${f.h}cm` : '100%',
                    height: estaRotada ? `${f.w}cm` : '100%',
                    objectFit: 'cover',
                    transform: `translate(-50%, -50%) rotate(${f.rotacion || 0}deg)`,
                    transition: 'none',
                    pointerEvents: 'none'
                  }} 
                  alt="foto-A4"
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