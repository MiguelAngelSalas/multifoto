import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-purple-950 via-neutral-950 to-black text-white p-6 text-center">
      
      {/* 1. Encabezados (Hero) */}
      <header className="mb-12">
        <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-400 bg-clip-text text-transparent leading-tight">
          Multi-Foto A4
        </h1>
        <h2 className="text-3xl md:text-4xl text-neutral-400 max-w-4xl mx-auto font-medium leading-relaxed">
          La forma más rápida de organizar e imprimir tus fotos en planchas A4 con medidas reales. Sin registros y sin complicaciones.
        </h2>
      </header>

      {/* 2. El Div Central con los dos botones principales */}
      <div className="flex flex-col items-center bg-neutral-800 p-8 rounded-2xl shadow-2xl border border-neutral-700 max-w-lg w-full">
        <p className="text-xl md:text-2xl mb-10 text-neutral-300">
          ¿Listo para crear tu primera plancha? Solo sube tus imágenes, recorta y descarga tu PDF listo para imprimir.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          {/* Botón Principal: Editor */}
          <Link 
            href="/editor" 
            className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 px-6 text-xl rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-900/20"
          >
            Empezar Ahora 🚀
          </Link>
          
          {/* Botón Secundario: Login */}
          <Link 
            href="/login" 
            className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white font-semibold py-5 px-6 text-xl rounded-xl transition-all active:scale-95 border border-neutral-600"
          >
            Login
          </Link>
        </div>
      </div>

      {/* 3. Footer sutil */}
      <footer className="mt-16 text-neutral-500 text-sm">
        Desarrollado para fotógrafos y emprendedores.
      </footer>

    </main>
  );
}