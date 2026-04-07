'use client'

import Link from 'next/link';
import { useState } from 'react';
import { registrarUsuario } from '@/app/actions/auth';

export default function RegisterPage() {
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'error' | 'success' } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMensaje(null);
    
    const result = await registrarUsuario(formData);
    
    if (result?.error) {
      setMensaje({ texto: result.error, tipo: 'error' });
      setLoading(false);
    } else if (result?.success) {
      setMensaje({ texto: result.success, tipo: 'success' });
      // No seteamos loading en false para que el usuario no mande mil veces el form si ya tuvo éxito
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-purple-950 via-neutral-950 to-black text-white p-4 text-center">
      
      <header className="mb-6">
        <Link href="/">
          <h1 className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-400 bg-clip-text text-transparent">
            Multi-Foto
          </h1>
        </Link>
        <p className="text-neutral-400 text-sm font-medium italic">Creá tu cuenta y empezá a guardar</p>
      </header>

      <div className="bg-neutral-800 p-6 rounded-2xl shadow-2xl border border-neutral-700 w-[320px] shrink-0 text-left">
        <h2 className="text-xl font-bold mb-6 text-center text-white">Registrarse</h2>
        
        {/* Mensajes de Feedback */}
        {mensaje && (
          <div className={`text-[11px] p-3 rounded-xl mb-4 text-center font-bold border ${
            mensaje.tipo === 'error' 
              ? 'bg-red-500/10 border-red-500/50 text-red-500' 
              : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
          }`}>
            {mensaje.texto}
          </div>
        )}

        <form action={handleSubmit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Nombre</label>
            <input name="nombre" type="text" placeholder="Tu nombre" className="bg-neutral-950 border border-neutral-700 text-white p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm w-full" required />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Email</label>
            <input name="email" type="email" placeholder="tu@email.com" className="bg-neutral-950 border border-neutral-700 text-white p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm w-full" required />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Contraseña</label>
            <input name="password" type="password" placeholder="••••••••" className="bg-neutral-950 border border-neutral-700 text-white p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm w-full" required />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Confirmar Contraseña</label>
            <input name="confirmPassword" type="password" placeholder="••••••••" className="bg-neutral-950 border border-neutral-700 text-white p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm w-full" required />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-bold py-3 rounded-xl text-md transition-all active:scale-95 shadow-lg shadow-emerald-900/20 mt-3"
          >
            {loading ? 'Procesando...' : 'Crear Cuenta ✨'}
          </button>
        </form>

        <p className="text-center text-neutral-400 text-xs mt-6">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="text-blue-400 font-bold hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </div>

      <footer className="mt-8 text-neutral-600 text-[10px] uppercase tracking-tighter">
        Clipp © 2026 - Datos Protegidos
      </footer>
    </main>
  );
}