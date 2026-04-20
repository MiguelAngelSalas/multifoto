import { PrismaClient } from '../generated/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Next.js necesita esto para que Neon se pueda conectar vía WebSockets
if (!globalThis.WebSocket) {
  neonConfig.webSocketConstructor = ws;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("❌ No se encontró DATABASE_URL en el entorno");
}

// 🎉 EL CAMBIO CLAVE: PrismaNeon ahora recibe el connectionString directamente, sin usar un Pool
const adapter = new PrismaNeon({ connectionString });

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter }); // Le pasamos el adaptador limpio a Prisma 7
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;