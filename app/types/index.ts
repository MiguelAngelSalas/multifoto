export interface FotoRecorte {
  id: string;
  src: string;
  w: number;
  h: number;
  rotacion: number;
  x?: number; 
  y?: number;
  yRelativo?: number; // <--- Agregá esta línea
  tipo?: 'plancha' | 'png' | 'sticker'; // <--- Agregamos esto
}