'use client' // Importante para manejar el estado del error

import Link from 'next/link';
import { useState } from 'react';
import { loginUsuario } from '../actions/auth'; // Crearemos esto ahora

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    
    const result = await loginUsuario(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // Si sale bien, Next.js se encarga de redireccionar desde el action
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-purple-950 via-neutral-950 to-black text-white p-4">
      
      <header className="text-center mb-8">
        <Link href="/">
          <h1 className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-400 bg-clip-text text-transparent transition-opacity hover:opacity-80 leading-tight">
            Multi-Foto
          </h1>
        </Link>
        <p className="text-neutral-400 text-sm font-medium italic">Habilitá funciones adicionales con tu registro</p>
      </header>

      <div className="bg-neutral-800 p-6 rounded-2xl shadow-2xl border border-neutral-700 w-[320px] shrink-0">
        <h2 className="text-xl font-bold mb-6 text-center text-white">Iniciar Sesión</h2>
        
        {/* MENSAJE DE ERROR (Aquí aparecerá lo del email no validado) */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-[11px] p-3 rounded-xl mb-4 text-center font-medium">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Email</label>
            <input 
              name="email"
              type="email" 
              placeholder="tu@email.com"
              className="bg-neutral-950 border border-neutral-700 text-white p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-neutral-800 text-sm w-full"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Contraseña</label>
            <input 
              name="password"
              type="password" 
              placeholder="••••••••"
              className="bg-neutral-950 border border-neutral-700 text-white p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-neutral-800 text-sm w-full"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-3 rounded-xl text-md transition-all active:scale-95 shadow-lg shadow-blue-900/20 mt-2"
          >
            {loading ? 'Cargando...' : 'Entrar 🚀'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-neutral-700"></span>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
            <span className="bg-neutral-800 px-2 text-neutral-500 font-bold">O</span>
          </div>
        </div>

        <p className="text-center text-neutral-400 text-xs">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-purple-400 hover:text-purple-300 font-bold transition-colors underline underline-offset-4 decoration-purple-500/30">
            Registrate gratis
          </Link>
        </p>
      </div>

      <footer className="mt-10 text-neutral-600 text-[10px] text-center uppercase tracking-tighter">
        Tus diseños se guardan de forma privada.
      </footer>
    </main>
  );
}