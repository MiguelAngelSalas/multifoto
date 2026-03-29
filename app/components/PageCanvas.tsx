"use client";

import React, { memo } from 'react';

interface FotoRecorte {
  id: string;
  src: string;
  w: number;
  h: number;
}

interface PageCanvasProps {
  paginas: FotoRecorte[][];
  esCircular: boolean;
  conBorde: boolean;
  margen: number;
  onBorrar: (id: string) => void;
  // Actualizamos aquí para que coincida con el padre:
  onRotar: (id: string, src: string, w: number, h: number) => void;
}

export const PageCanvas = memo(({ 
  paginas, 
  esCircular, 
  conBorde, 
  margen, 
  onBorrar,
  onRotar
}: PageCanvasProps) => {

  const outlineStyle = conBorde ? '1.5px dashed #666' : '1px solid #eee';
  const borderRadius = esCircular ? '50%' : '0';

  return (
    <div className="flex-1 bg-neutral-900 p-8 flex flex-col items-center overflow-y-auto gap-8 pb-32 print:block print:p-0 print:bg-white">
      {paginas.map((pagina, pIdx) => (
        <div 
          key={pIdx} 
          className="bg-white shrink-0 flex flex-wrap content-start shadow-2xl print:shadow-none print:break-after-page" 
          style={{ 
            width: '210mm', 
            height: '297mm', 
            padding: `${margen}mm`, 
            gap: '3mm' 
          }}
        >
          {pagina.map((f) => (
            <img 
              key={f.id} 
              src={f.src} 
              // PASAMOS LOS 4 ARGUMENTOS AQUÍ:
              onClick={() => onRotar(f.id, f.src, f.w, f.h)}
              onContextMenu={(e) => {
                e.preventDefault();
                onBorrar(f.id);
              }}
              style={{ 
                width: `${f.w}cm`, 
                height: `${f.h}cm`, 
                minWidth: `${f.w}cm`, 
                minHeight: `${f.h}cm`,
                borderRadius: borderRadius, 
                outline: outlineStyle, 
                outlineOffset: conBorde ? '1.5px' : '-1px', 
                objectFit: 'cover',
                backgroundColor: 'white',
              }} 
              className="cursor-pointer hover:opacity-80 active:scale-95 transition-opacity"
              alt="foto-A4"
            />
          ))}
        </div>
      ))}
    </div>
  );
});

PageCanvas.displayName = 'PageCanvas';