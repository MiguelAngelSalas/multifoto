/**
 * ImageService: Capa de servicios pura para manipulación de Canvas.
 * No depende de React ni de estados, solo procesa datos de entrada.
 */
export const ImageService = {
  /**
   * Rota físicamente los píxeles de una imagen 90 grados.
   */
  async rotateImage(src: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous"; 
      
      // 1. Definimos el ONLOAD PRIMERO
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error("No se pudo obtener el contexto 2D"));

        // Intercambio de dimensiones para que no se corte la imagen
        canvas.width = img.height;
        canvas.height = img.width;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Transformación centrada
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((90 * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        resolve(canvas.toDataURL('image/png', 1.0));
      };

      img.onerror = () => reject(new Error("Error al cargar la imagen para rotar"));
      
      // 2. ASIGNAMOS EL SRC AL FINAL
      img.src = src;
    });
  },

  /**
   * Crea un efecto de sticker (Die-cut) expandiendo la silueta en 360°.
   */
  async applyStickerBorder(sourceCanvas: HTMLCanvasElement, borderSize: number): Promise<HTMLCanvasElement> {
    // Aumentamos la precisión: el grosor depende del tamaño del canvas original
    // borderSize viene en mm, lo ideal es convertirlo a píxeles proporcionales
    const thickness = Math.round(borderSize * 5); 
    
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) throw new Error("Canvas context not found");

    tempCanvas.width = sourceCanvas.width + (thickness * 2);
    tempCanvas.height = sourceCanvas.height + (thickness * 2);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Paso 1: Generar el borde blanco dibujando la imagen en múltiples ángulos
    // Usamos pasos de 5° para que el borde no parezca "dentado" en alta resolución
    ctx.globalCompositeOperation = 'source-over';
    for (let angle = 0; angle < 360; angle += 5) {
      const rad = (angle * Math.PI) / 180;
      const x = thickness + Math.cos(rad) * thickness;
      const y = thickness + Math.sin(rad) * thickness;
      ctx.drawImage(sourceCanvas, x, y);
    }

    // Paso 2: Convertir toda esa masa de pixeles en blanco puro
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Paso 3: Dibujar la imagen original encima
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(sourceCanvas, thickness, thickness);

    return tempCanvas;
  }
};