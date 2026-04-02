import React from 'react';

export const StickerItem = ({ f, modo, borderRadius, outlineStyle, isDragging, handlers }: any) => {
  return (
    <div 
      onMouseDown={(e) => handlers.onMouseDown(e, f)}
      onMouseUp={(e) => handlers.onMouseUp(e, f)}
      onContextMenu={(e) => { e.preventDefault(); handlers.onBorrar(f.id); }}
      className={`transition-shadow ${modo === 'sticker' ? 'cursor-move active:z-50' : 'cursor-pointer active:scale-95'}`}
      style={{ 
        width: `${f.w}cm`, 
        height: `${f.h}cm`, 
        borderRadius, 
        outline: outlineStyle, 
        outlineOffset: '1px',
        position: modo === 'sticker' ? 'absolute' : 'relative',
        left: modo === 'sticker' ? `${f.x ?? 0}px` : 'auto',
        top: modo === 'sticker' ? `${f.yRelativo ?? f.y ?? 0}px` : 'auto',
        zIndex: isDragging ? 50 : 1,
        userSelect: 'none',
        transition: isDragging ? 'none' : 'transform 0.2s ease'
      }}
    >
      {modo !== 'sticker' && (
        <div className="absolute inset-0 z-10" onClick={() => handlers.onRotar(f.id, f.src, f.w, f.h)} />
      )}
      <img src={f.src} draggable={false} className="w-full h-full object-contain pointer-events-none" alt="sticker" />
    </div>
  );
};