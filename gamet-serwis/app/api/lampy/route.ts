import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { lampaFormSchema } from '@/lib/validators/lampa'
import { expandSerialNumbers, SerialRangeError } from '@/lib/orion/serial-range'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Brak autoryzacji' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = lampaFormSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? 'Nieprawidłowe dane formularza' },
        { status: 400 }
      )
    }
    const { wariantCode, voltage, lengthMm, orderRef, customerName, serialNumbers, productionDate, notes } =
      parsed.data

    let serials: string[]
    try {
      serials = expandSerialNumbers(serialNumbers)
    } catch (error) {
      const message = error instanceof SerialRangeError ? error.message : 'Nieprawidłowy zakres numerów seryjnych'
      return Response.json({ error: message }, { status: 400 })
    }

    const wariant = await prisma.wariantOrion.findUnique({ where: { code: wariantCode } })
    if (!wariant) {
      return Response.json({ error: `Nieznany wariant: ${wariantCode}` }, { status: 400 })
    }

    const existing = await prisma.lampa.findMany({
      where: { serialNumber: { in: serials } },
      select: { serialNumber: true },
    })
    if (existing.length > 0) {
      return Response.json(
        { error: `Numer(y) seryjny(e) już istnieją: ${existing.map((l) => l.serialNumber).join(', ')}` },
        { status: 400 }
      )
    }

    let klient = await prisma.klient.findFirst({
      where: { name: { equals: customerName, mode: 'insensitive' } },
    })
    if (!klient) {
      klient = await prisma.klient.create({ data: { name: customerName } })
    }

    const createdById = session.user.id as string

    await prisma.lampa.createMany({
      data: serials.map((serialNumber) => ({
        serialNumber,
        model: 'ORION',
        variantCode: wariant.code,
        color: wariant.color,
        voltage,
        lengthMm: lengthMm ? parseInt(lengthMm, 10) : null,
        orderRef: orderRef || null,
        customerId: klient.id,
        productionDate: productionDate ? new Date(productionDate) : null,
        notes: notes || null,
        createdById,
      })),
    })

    return Response.json({ serialNumbers: serials, count: serials.length }, { status: 201 })
  } catch (error) {
    console.error('Błąd tworzenia lampy:', error)
    return Response.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
