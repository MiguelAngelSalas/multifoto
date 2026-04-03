/**
 * ImageService: Capa de servicios pura para manipulación de Canvas.
 */
export const ImageService = {
  /**
   * Rota físicamente los píxeles de una imagen 90 grados.
   */
  async rotateImage(src: string): Promise<string> {
    // Validación inicial: Si no hay src, ni intentamos cargar
    if (!src || src === "") {
      throw new Error("El SRC proporcionado para rotar está vacío.");
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // IMPORTANTE para evitar problemas de seguridad en navegadores modernos
      img.crossOrigin = "anonymous"; 
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error("No se pudo obtener el contexto 2D"));

          // Intercambio de dimensiones
          canvas.width = img.height;
          canvas.height = img.width;

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Transformación centrada
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((90 * Math.PI) / 180);
          ctx.drawImage(img, -img.width / 2, -img.height / 2);

          // Resolvemos con toDataURL para que sea una cadena persistente (base64)
          // Esto es más pesado que un Blob pero sobrevive mejor a los refrescos de Turbopack
          resolve(canvas.toDataURL('image/png', 1.0));
        } catch (err) {
          reject(new Error("Error procesando el canvas de rotación"));
        }
      };

      img.onerror = () => {
        console.error("Fallo la carga de imagen en ImageService.rotateImage. URL:", src);
        reject(new Error("Error al cargar la imagen para rotar. El link puede ser inválido o haber expirado."));
      };
      
      // 2. ASIGNAMOS EL SRC AL FINAL
      img.src = src;
    });
  },

  /**
   * Crea un efecto de sticker (Die-cut) expandiendo la silueta en 360°.
   */
  async applyStickerBorder(sourceCanvas: HTMLCanvasElement, borderSize: number): Promise<HTMLCanvasElement> {
    const thickness = Math.round(borderSize * 5); 
    
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) throw new Error("Canvas context not found");

    tempCanvas.width = sourceCanvas.width + (thickness * 2);
    tempCanvas.height = sourceCanvas.height + (thickness * 2);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Paso 1: Generar el borde blanco
    ctx.globalCompositeOperation = 'source-over';
    for (let angle = 0; angle < 360; angle += 10) { // Subí a 10° para mejor performance
      const rad = (angle * Math.PI) / 180;
      const x = thickness + Math.cos(rad) * thickness;
      const y = thickness + Math.sin(rad) * thickness;
      ctx.drawImage(sourceCanvas, x, y);
    }

    // Paso 2: Convertir a blanco
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Paso 3: Imagen original
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(sourceCanvas, thickness, thickness);

    return tempCanvas;
  }
};