import React from 'react';

interface SheetSettingsProps {
  cantidad: number;
  setCantidad: (n: number) => void;
  margen: number;
  setMargen: (n: number) => void;
  tamanoHoja: any;
  setTamanoHoja: (t: any) => void;
  opcionesTamano: any;
  colorHoja?: string;
  setColorHoja?: (c: string) => void;
}

export const SheetSettings = ({ 
  cantidad, setCantidad, 
  margen, setMargen, 
  tamanoHoja, setTamanoHoja, 
  opcionesTamano,
  colorHoja,
  setColorHoja
}: SheetSettingsProps) => {

  const handleMargenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setMargen(val < 0 ? 0 : val); // Evitamos márgenes negativos
  };

  return (
    <div className="p-3 bg-neutral-900/50 rounded-xl border border-neutral-700 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col text-center">
          <label className="text-[8px] text-gray-400 uppercase font-bold mb-0.5 tracking-wider">Copias</label>
          <input 
            type="number" 
            min="1"
            value={cantidad} 
            onChange={e => setCantidad(Math.max(1, Number(e.target.value)))} 
            className="w-full p-1.5 rounded-md border border-neutral-600 text-white bg-neutral-800 text-[10px] font-bold focus:border-green-500 outline-none transition-colors" 
          />
        </div>
        <div className="flex flex-col text-center">
          <label className="text-[8px] text-gray-400 uppercase font-bold mb-0.5 tracking-wider">Margen Hoja (mm)</label>
          <input 
            type="number" 
            value={margen} 
            onChange={handleMargenChange} 
            className="w-full p-1.5 rounded-md border border-neutral-600 text-white bg-neutral-800 text-[10px] font-bold focus:border-green-500 outline-none transition-colors" 
          />
        </div>
      </div>
      
      {/* Selector de Tamaño de Papel */}
      <div className="grid grid-cols-4 gap-1">
        {opcionesTamano && Object.values(opcionesTamano).map((t: any) => (
          <button 
            key={t.nombre} 
            type="button"
            onClick={() => setTamanoHoja(t)} 
            className={`py-1.5 rounded-md font-black text-[9px] transition-all border ${
              tamanoHoja?.nombre === t.nombre 
                ? 'bg-white text-black border-white' 
                : 'bg-neutral-800 text-gray-500 border-neutral-700 hover:text-white'
            }`}
          >
            {t.nombre}
          </button>
        ))}
      </div>

      {/* Agregamos el color aquí para centralizar la config de la hoja */}
      {setColorHoja && (
        <div className="flex items-center justify-between pt-2 border-t border-neutral-700/50">
          <label className="text-[8px] text-gray-500 uppercase font-bold">Fondo de Hoja</label>
          <input 
            type="color" 
            value={colorHoja} 
            onChange={(e) => setColorHoja(e.target.value)} 
            className="w-6 h-6 rounded-md cursor-pointer bg-neutral-700 border border-neutral-600 p-0.5 overflow-hidden" 
          />
        </div>
      )}
    </div>
  );
};