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