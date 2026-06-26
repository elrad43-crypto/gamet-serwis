import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendMonthlyReport } from '@/lib/email'

function isLastDayOfMonth(date: Date): boolean {
  const tomorrow = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
  return tomorrow.getDate() === 1
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  const auth = request.headers.get('authorization')
  if (!secret || auth !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const force = request.nextUrl.searchParams.get('force') === 'true'
  const today = new Date()

  if (!force && !isLastDayOfMonth(today)) {
    return Response.json({ ok: true, message: 'Not last day of month, skipping' })
  }

  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const firstOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)

  const tickets = await prisma.ticket.findMany({
    where: {
      createdAt: {
        gte: firstOfMonth,
        lt: firstOfNextMonth,
      },
    },
    orderBy: { createdAt: 'asc' },
    select: {
      number: true,
      clientName: true,
      companyName: true,
      clientEmail: true,
      clientPhone: true,
      lampModel: true,
      lampGroupCode: true,
      serialNumber: true,
      status: true,
      createdAt: true,
      description: true,
    },
  })

  await sendMonthlyReport({
    month: today.getMonth() + 1,
    year: today.getFullYear(),
    tickets,
  })

  return Response.json({
    ok: true,
    message: `Report sent for ${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`,
    ticketCount: tickets.length,
  })
}
