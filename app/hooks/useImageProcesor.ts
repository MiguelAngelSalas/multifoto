import { useCallback } from 'react';

export const useImageProcessor = () => {
  // Seguimos usando Blobs para que la App vuele y el PDF sea liviano
  const createBlobUrl = useCallback((canvas: HTMLCanvasElement): Promise<string> => {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          // Generamos el link temporal
          const url = URL.createObjectURL(blob);
          resolve(url);
        }
      }, 'image/png');
    });
  }, []);

  // COMENTAMOS O ELIMINAMOS LA LÓGICA DE REVOKE AUTOMÁTICO
  const revokeUrl = useCallback((url: string) => {
    // Por ahora no revocamos nada manualmente para evitar que 
    // las imágenes se rompan al reordenar las hojas.
    // console.log("Revocación manual desactivada para evitar errores de renderizado");
  }, []);

  return { createBlobUrl, revokeUrl };
};