import * as dotenv from 'dotenv';
import path from 'path';

// Forzamos que lea .env.local para que Prisma "vea" a Neon en la terminal
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Usamos la variable que acabamos de cargar con dotenv
    url: process.env.DATABASE_URL,
  },
});