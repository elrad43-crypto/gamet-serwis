import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { generateTicketNumber } from '@/lib/ticket-number'
import { sendTicketConfirmation } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      institutionName,
      unitName,
      contactPerson,
      contactEmail,
      contactPhone,
      equipmentType,
      equipmentModel,
      serialNumber,
      equipmentYear,
      description,
      priority,
    } = body

    if (
      !institutionName ||
      !contactPerson ||
      !contactEmail ||
      !contactPhone ||
      !equipmentType ||
      !equipmentModel ||
      !description
    ) {
      return Response.json({ error: 'Brakujące wymagane pola' }, { status: 400 })
    }

    const number = generateTicketNumber()

    const ticket = await prisma.ticket.create({
      data: {
        number,
        institutionName,
        unitName: unitName || null,
        contactPerson,
        contactEmail,
        contactPhone,
        equipmentType,
        equipmentModel,
        serialNumber: serialNumber || null,
        equipmentYear: equipmentYear || null,
        description,
        priority: priority || 'NORMAL',
      },
    })

    try {
      await sendTicketConfirmation({
        to: contactEmail,
        contactPerson,
        institutionName,
        ticketNumber: number,
        equipmentType,
        equipmentModel,
        description,
        priority: priority || 'NORMAL',
      })
    } catch (emailError) {
      console.error('Błąd wysyłania emaila potwierdzającego:', emailError)
    }

    return Response.json({ ticket }, { status: 201 })
  } catch (error) {
    console.error('Błąd tworzenia zgłoszenia:', error)
    return Response.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Brak autoryzacji' }, { status: 401 })
  }

  const tickets = await prisma.ticket.findMany({
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    include: {
      attachments: true,
      _count: { select: { notes: true } },
    },
  })

  return Response.json({ tickets })
}
