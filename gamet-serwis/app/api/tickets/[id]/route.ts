import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { sendStatusUpdate } from '@/lib/email'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, ctx: Ctx) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Brak autoryzacji' }, { status: 401 })
  }

  const { id } = await ctx.params

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      attachments: true,
      notes: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!ticket) {
    return Response.json({ error: 'Nie znaleziono zgłoszenia' }, { status: 404 })
  }

  return Response.json({ ticket })
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Brak autoryzacji' }, { status: 401 })
  }

  const { id } = await ctx.params
  const body = await request.json()
  const { status, note, isPublic, lampModel, lampGroupCode, shipmentNumber } = body

  const ticket = await prisma.ticket.findUnique({ where: { id } })
  if (!ticket) {
    return Response.json({ error: 'Nie znaleziono zgłoszenia' }, { status: 404 })
  }

  const dataToUpdate: Record<string, unknown> = { status }
  if (lampModel !== undefined) dataToUpdate.lampModel = lampModel
  if (lampGroupCode !== undefined) dataToUpdate.lampGroupCode = lampGroupCode ?? null
  if (shipmentNumber !== undefined) dataToUpdate.shipmentNumber = shipmentNumber || null

  const updated = await prisma.ticket.update({
    where: { id },
    data: dataToUpdate,
  })

  if (note) {
    await prisma.ticketNote.create({
      data: {
        ticketId: id,
        content: note,
        isPublic: isPublic ?? false,
      },
    })
  }

  if (status !== ticket.status) {
    try {
      await sendStatusUpdate({
        to: ticket.clientEmail,
        clientName: ticket.clientName,
        ticketNumber: ticket.number,
        newStatus: status,
        note: isPublic ? note : undefined,
      })
    } catch (emailError) {
      console.error('Błąd wysyłania emaila o statusie:', emailError)
    }
  }

  return Response.json({ ticket: updated })
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Brak autoryzacji' }, { status: 401 })
  }

  const { id } = await ctx.params

  const ticket = await prisma.ticket.findUnique({ where: { id } })
  if (!ticket) {
    return Response.json({ error: 'Nie znaleziono zgłoszenia' }, { status: 404 })
  }

  await prisma.ticket.delete({ where: { id } })

  return Response.json({ ok: true })
}
