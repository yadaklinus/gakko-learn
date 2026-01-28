// lib/prisma.ts
import { PrismaClient } from '@prisma/client' // Adjust path to match your output
import 'dotenv/config'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL
})

const prismaClientSingleton = () => {
  return new PrismaClient({adapter})
}

// Global declaration for TypeScript in dev mode

const prisma = prismaClientSingleton()

export default prisma

