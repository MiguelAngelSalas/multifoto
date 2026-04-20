'use server'
import AuthError from "next-auth"
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function registrarUsuario(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // 1. Validaciones básicas
  if (!nombre || !email || !password || !confirmPassword) {
    return { error: "Todos los campos son obligatorios." };
  }

  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden." };
  }

  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  try {
    // Debug para ver si llega la URL antes de intentar el create
    console.log("DEBUG DATABASE_URL:", process.env.DATABASE_URL ? "OK" : "VACIO");
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 2. Crear el usuario en Neon (emailVerified inicia en null)
    const usuario = await prisma.usuario.create({
      
      data: {
        nombre,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
      },
    });
    
    // 3. Enviar mail con Resend
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const { error: resendError } = await resend.emails.send({
      from: 'MultiFoto <onboarding@resend.dev>', 
      to: [email],
      subject: 'Confirma tu cuenta en Multi-Foto 🚀',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h1 style="color: #6366f1;">¡Hola, ${nombre}!</h1>
          <p>Gracias por registrarte en <strong>Multi-Foto</strong>.</p>
          <p>Hacé click en el botón para activar tu cuenta:</p>
          <a href="${baseUrl}/api/verify?id=${usuario.id}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; margin-top: 20px;">
            Confirmar mi cuenta
          </a>
        </div>
      `
    });

    if (resendError) {
      console.error("Error de Resend:", resendError);
      return { error: "Usuario creado, pero falló el envío del email." };
    }

    return { success: "¡Registro exitoso! Revisá tu email para confirmar." };

  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: "Este correo electrónico ya está registrado." };
    }
    console.error("Error en Registro:", error);
    return { error: "Ocurrió un problema en la base de datos." };
  }
}

export async function loginUsuario(formData: FormData) {
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const password = formData.get("password") as string;

  if (!email || !password) return { error: "Completá todos los campos." };

  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    console.log(usuario)
    if (!usuario) return { error: "Credenciales incorrectas." };

    const passwordMatch = await bcrypt.compare(password, usuario.password);
    if (!passwordMatch) return { error: "Credenciales incorrectas." };

    // VALIDACIÓN DE EMAIL
    if (!usuario.emailVerified) {
      return { error: "Tu cuenta no está validada. Revisá tu email." };
    }

    return { success: "Ingreso exitoso.", usuarioId: usuario.id };
    
  } catch (error) {
    if(error instanceof AuthError){
      return { error: "Error al intentar entrar." };
    }
      throw error
    
  }
}