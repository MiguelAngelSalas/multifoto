"use client";

import React, { useState } from 'react';
import { Sidebar } from '../components/sidebar/Sidebar';
import { PageCanvas } from '../components/PageCanvas';
import { useStickerLayout } from '../hooks/useStickerLayout';
import { useMultiFotoEditor } from '../hooks/useMultiFotoEditor'; // <-- Tu nuevo cerebro

const TAMANOS_HOJA = {
  A4: { nombre: 'A4', w: 21, h: 29.7 },
  A3: { nombre: 'A3', w: 29.7, h: 42 },
};

export default function GeneradorMultiFotoPC() {
  // 1. El único estado que queda acá es el tamaño de hoja porque afecta a varios hooks
  const [tamanoHoja, setTamanoHoja] = useState(TAMANOS_HOJA.A4);

  // 2. Traemos toda la lógica armada del Hook
  const { config, galeria, editor, canvasActions, coreStates } = useMultiFotoEditor(tamanoHoja);
  
  // 3. Calculamos la paginación con el hook que ya tenías
  const paginasCalculadas = useStickerLayout(coreStates.fotosEnHoja, coreStates.modo, coreStates.margen, tamanoHoja);

  return (
    <div className="flex h-screen bg-neutral-900 text-white overflow-hidden select-none print:block print:bg-white print:h-auto">
      <Sidebar 
        config={{ ...config, tamanoHoja, setTamanoHoja }}
        galeria={galeria}
        editor={editor}
        opcionesHoja={TAMANOS_HOJA}
      />
      
      <PageCanvas 
        paginas={paginasCalculadas}
        config={{ 
          esCircular: coreStates.esCircular, 
          conBorde: coreStates.conBorde, 
          margen: coreStates.margen, 
          colorHoja: coreStates.colorHoja, 
          tamanoHoja, 
          modo: coreStates.modo 
        }}
        actions={canvasActions}
      />
    </div>
  );
}