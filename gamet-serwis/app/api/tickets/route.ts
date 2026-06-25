import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { generateTicketNumber } from '@/lib/ticket-number'
import { sendTicketConfirmation, sendInternalTicketNotification } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      clientName,
      clientEmail,
      clientPhone,
      companyName,
      shippingStreet,
      shippingPostalCode,
      shippingCity,
      lampModel,
      serialNumber,
      purchaseDate,
      description,
    } = body

    if (!clientName || !clientEmail || !lampModel || !description) {
      return Response.json(
        { error: 'Brakujące wymagane pola' },
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
        shippingStreet: shippingStreet || null,
        shippingPostalCode: shippingPostalCode || null,
        shippingCity: shippingCity || null,
        lampModel,
        serialNumber: serialNumber || null,
        purchaseDate: purchaseDate || null,
        description,
      },
    })

    // Wyślij email potwierdzający do klienta
    try {
      await sendTicketConfirmation({
        to: clientEmail,
        clientName,
        ticketNumber: number,
        lampModel,
        description,
      })
    } catch (emailError) {
      console.error('Błąd wysyłania emaila potwierdzającego:', emailError)
    }

    // Wyślij powiadomienie do serwisu
    try {
      await sendInternalTicketNotification({
        ticketNumber: number,
        clientName,
        clientEmail,
        clientPhone,
        companyName,
        shippingStreet,
        shippingPostalCode,
        shippingCity,
        lampModel,
        serialNumber,
        description,
      })
    } catch (emailError) {
      console.error('Błąd wysyłania powiadomienia do serwisu:', emailError)
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
    orderBy: { createdAt: 'desc' },
    include: {
      attachments: true,
      _count: { select: { notes: true } },
    },
  })

  return Response.json({ tickets })
}
