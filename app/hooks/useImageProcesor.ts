import { useCallback } from 'react';

export const useImageProcessor = () => {
  const createBlobUrl = useCallback((canvas: HTMLCanvasElement): Promise<string> => {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(URL.createObjectURL(blob));
      }, 'image/png');
    });
  }, []);

  const revokeUrl = useCallback((url: string) => {
    if (url.startsWith('blob:')) URL.revokeObjectURL(url);
  }, []);

  return { createBlobUrl, revokeUrl };
};