import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { generateTicketNumber } from '@/lib/ticket-number'
import { sendTicketConfirmation } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      clientName,
      clientEmail,
      clientPhone,
      companyName,
      lampModel,
      serialNumber,
      purchaseDate,
      description,
    } = body

    if (!clientName || !clientEmail || !lampModel || !description) {
      return Response.json(
        { error: 'Brakuj�ce wymagane pola' },
        { status: 400 }
      )
    }

    const number = generateTicketNumber()

    const ticket = await prisma.ticket.create({
      data: {
        number,
        clientName,
        clientEmail,
        clientPhone: clientPhone || null,
        companyName: companyName || null,
        lampModel,
        serialNumber: serialNumber || null,
        purchaseDate: purchaseDate || null,
        description,
      },
    })

    // Wy�lij email potwierdzaj�cy
    try {
      await sendTicketConfirmation({
        to: clientEmail,
        clientName,
        ticketNumber: number,
        lampModel,
        description,
      })
    } catch (emailError) {
      console.error('B��d wysy�ania emaila potwierdzaj�cego:', emailError)
    }

    return Response.json({ ticket }, { status: 201 })
  } catch (error) {
    console.error('B��d tworzenia zg�oszenia:', error)
    return Response.json({ error: 'B��d serwera' }, { status: 500 })
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Brak autoryzacji' }, { status: 401 })
  }

  const tickets = await prisma.ticket.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      attachments: true,
      _count: { select: { notes: true } },
    },
  })

  return Response.json({ tickets })
}
