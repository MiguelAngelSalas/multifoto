import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  // 1. Agarramos el ID de la URL (?id=xxxx)
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: "Falta el ID de verificación" }, { status: 400 });
  }

  try {
    // 2. Buscamos al usuario
    const usuario = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // 3. Si ya estaba verificado, lo mandamos al login directo
    if (usuario.emailVerified) {
      return NextResponse.redirect(new URL('/login?verified=true', request.url));
    }

    // 4. Actualizamos el campo emailVerified con la fecha actual
    await prisma.usuario.update({
      where: { id },
      data: {
        emailVerified: new Date(),
      },
    });

    // 5. Redireccionamos al login con un mensaje de éxito
    return NextResponse.redirect(new URL('/login?success=true', request.url));

  } catch (error) {
    console.error("Error en Verificación:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}