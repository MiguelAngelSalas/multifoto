import Link from "next/link";

export default function EmailVerifiedSuccessPage() {
  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Efecto de luz de fondo (glow) para darle ese toque premium */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full bg-neutral-800 p-8 rounded-3xl border-2 border-green-500/30 shadow-[0_0_40px_-10px_rgba(34,197,94,0.3)] text-center animate-in fade-in zoom-in slide-in-from-bottom-4 duration-500 relative z-10">
        
        {/* Ícono de éxito rotando sutilmente al entrar */}
        <div className="w-24 h-24 bg-green-500/20 border-4 border-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-[spin_0.5s_ease-out]">
          <svg 
            className="w-12 h-12 text-green-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Título principal */}
        <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">
          ¡Cuenta Verificada!
        </h1>

        {/* Mensaje descriptivo */}
        <p className="text-gray-300 mb-8 text-sm leading-relaxed font-medium">
          Tu dirección de correo electrónico ha sido confirmada exitosamente. Ya tenés acceso total a la plataforma.
        </p>

        {/* Botón de acción */}
        <Link 
          href="/dashboard" 
          className="block w-full bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-xl shadow-lg uppercase text-[12px] tracking-widest transition-all active:scale-95 border-b-4 border-green-800 active:border-b-0 active:translate-y-1"
        >
          Ir al Panel Principal
        </Link>

        <div className="mt-6">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
            Redirigiendo... o haz clic en el botón
          </p>
        </div>

      </div>
      
    </div>
  );
}