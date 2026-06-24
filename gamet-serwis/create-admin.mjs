import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"
import "dotenv/config"

const email = process.argv[2]
const password = process.argv[3]
const name = process.argv[4]

if (!email || !password || !name) {
  console.error("Uzycie: node create-admin.mjs <email> <haslo> <imie>")
  process.exit(1)
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const existing = await prisma.adminUser.findUnique({ where: { email } })
if (existing) {
  console.error("Uzytkownik o tym emailu juz istnieje:", email)
  process.exit(1)
}

const hashed = await bcrypt.hash(password, 12)
const user = await prisma.adminUser.create({
  data: { email, password: hashed, name },
})
console.log("Utworzono konto admina:", user.email, "(" + user.name + ")")
await pool.end()
