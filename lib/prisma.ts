import * as dotenv from 'dotenv';
import path from 'path';

// Forzamos la carga del .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '../generated/client/client'; // REVISÁ QUE ESTA RUTA SEA EXACTA
import ws from 'ws';

if (!globalThis.WebSocket) {
  neonConfig.webSocketConstructor = ws;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("❌ No se encontró DATABASE_URL en el .env.local");
}

// Creamos el pool afuera del singleton para asegurar que persista
const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool as any);

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter });
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;