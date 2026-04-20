export const trimCanvas = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const l = pixels.data.length;
  const bound = { top: 0, left: 0, right: 0, bottom: 0 };
  let x, y, first = true;

  for (let i = 0; i < l; i += 4) {
    if (pixels.data[i + 3] !== 0) { 
      x = (i / 4) % canvas.width;
      y = Math.floor((i / 4) / canvas.width);

      if (first) {
        bound.top = y; bound.bottom = y; bound.left = x; bound.right = x;
        first = false;
      } else {
        if (y < bound.top) bound.top = y;
        if (y > bound.bottom) bound.bottom = y;
        if (x < bound.left) bound.left = x;
        if (x > bound.right) bound.right = x;
      }
    }
  }

  if (first) return canvas;

  const trimHeight = bound.bottom - bound.top + 1;
  const trimWidth = bound.right - bound.left + 1;
  const trimmed = document.createElement('canvas');
  trimmed.width = trimWidth;
  trimmed.height = trimHeight;
  trimmed.getContext('2d')?.drawImage(canvas, bound.left, bound.top, trimWidth, trimHeight, 0, 0, trimWidth, trimHeight);

  return trimmed;
};