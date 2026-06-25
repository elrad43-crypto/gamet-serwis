import { prisma } from '@/lib/prisma'

export async function generateTicketNumber(): Promise<string> {
  const result = await prisma.$queryRaw<{ value: bigint }[]>`SELECT nextval('ticket_number_seq') AS value`
  const seq = result[0].value
  const year = new Date().getFullYear()
  return `SRW/${String(seq).padStart(5, '0')}/${year}`
}
