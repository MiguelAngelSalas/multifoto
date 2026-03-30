📸 Multi-Foto A4 Generator

Multi-Foto es una herramienta web de alto rendimiento diseñada para la creación y optimización de planchas de impresión en distintos formatos. Permite a fotógrafos y comercios organizar múltiples recortes en una grilla inteligente con precisión milimétrica.
🚀 Live Demo: multifoto.vercel.app

🛠️ Tech Stack & Architecture:

El proyecto está construido sobre las versiones más recientes del ecosistema React para garantizar el máximo rendimiento y una experiencia de usuario fluida.

Core Framework
Next.js 16 (App Router): Utilizado para la estructura de rutas y optimización de carga.

React 19: Aprovechando las últimas mejoras en el manejo del DOM y hooks.

TypeScript: Garantizando un desarrollo robusto con tipado estático en toda la lógica de paginación.

Styling & UI
Tailwind CSS v4: Implementado para un diseño responsivo y ultra-ligero mediante su motor de procesamiento de alto rendimiento.

PostCSS: Configurado para optimizar la salida de estilos final.

Procesamiento de imange
React-Cropper & Cropper.js 2.1: El motor principal para el recorte de alta precisión. Se seleccionó la versión 2.1 por su estabilidad y soporte nativo para manipulación de lienzos (canvas).


🧠 Desafíos Técnicos y Soluciones:

1. Gestión de Memoria y Performance (Blob URLs vs Base64)
Uno de los mayores retos fue manejar múltiples recortes de alta resolución sin degradar la performance del navegador.

Problema: El uso de strings Base64 saturaba el estado de React y provocaba lag en la renderización.

Solución: Implementamos una arquitectura basada en Blob Object URLs. Esto permite que el navegador maneje referencias binarias livianas, logrando una interfaz fluida incluso con decenas de fotos. Se incluyó un sistema de limpieza automática (revokeObjectURL) para evitar fugas de memoria.

2. Motor de Paginación Dinámica
El sistema calcula en tiempo real la disposición de las fotos basándose en:

Márgenes configurables en milímetros.

Algoritmo de "First-Fit" para el empaquetado de imágenes.

Detección automática de saltos de página para exportación limpia a PDF.

3. Rotación Lógica de 90°
A diferencia de las rotaciones CSS convencionales que rompen el flujo del documento, implementamos una rotación de estado. Al rotar una imagen, el motor intercambia las dimensiones width y height, forzando al algoritmo de paginación a recalcular la posición de todas las piezas, garantizando que el PDF resultante sea una copia exacta de lo visto en pantalla.

🖨️ Optimización para Impresión:

El proyecto incluye una capa de estilos @media print personalizada que:

Fuerza el tamaño de página A4 (210mm x 297mm).

Elimina artefactos de la interfaz web (Sidebars, botones).

Garantiza que el padding de usuario se traduzca en márgenes de impresión reales.

Instalacion y uso:

Clona el repo:
git clone https://github.com/tu-usuario/multi-foto.git

Instala dependencias:
npm install

Corre el servidor de desarrollo:
npm run dev



🗺️ Roadmap & Changelog
Este proyecto sigue una filosofía de utilidad abierta: las funciones básicas siempre serán gratuitas y sin fricción, utilizando el registro de usuario solo para funcionalidades avanzadas de persistencia y personalización.

🟢 Versión 1.0 (Actual - "The Core")
Recorte de Precisión: Integración con Cropper.js para selección exacta de área.

Rotación Lógica: Sistema de rotación de 90° que recalcula la grilla A4 automáticamente sin deformar la imagen.

Motor de Paginación: Algoritmo que distribuye fotos en múltiples hojas A4 respetando márgenes y gaps.

Exportación PDF: Generación de archivos listos para imprimir con fidelidad 1:1 respecto a la pantalla.

Performance: Gestión de memoria mediante Blobs para evitar el lag de procesamiento.

🟡 Versión 1.1 (Próximamente - "Advanced Control")
Manipulación Dinámica del Crop: Implementación de modificadores de teclado (Shift/Alt) para permitir el estiramiento manual del lienzo de corte, rompiendo la relación de aspecto fija cuando sea necesario.

Soporte Multi-Formato: Incorporación de lienzos A3 y otros tamaños de papel profesional, manteniendo la densidad de píxeles para impresiones de gran formato sin pérdida de calidad.

Gestión de Espaciado: Control manual del gap entre imágenes para optimizar el guillotinado o troquelado.

🔵 Versión 2.0 (Ecosistema & Registro)
Infraestructura de Usuarios: Implementación de registro por Email (Backend ready). El sistema quedará preparado para la persistencia de datos en la nube sin afectar la interfaz limpia actual.

Self-Promotion Hub: Espacio para la difusión de proyectos hermanos (Clipp y otros) mediante banners integrados de forma orgánica.

Analítica de Uso: Medición de formatos más utilizados para priorizar el desarrollo de nuevos presets.