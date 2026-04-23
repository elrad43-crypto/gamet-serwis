import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateInquiryNumber } from '@/lib/inquiry-number'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, message, productId, productName, quantity } = body

    if (!name?.trim() || !email?.trim() || !productName?.trim()) {
      return Response.json({ error: 'Imię, email i nazwa produktu są wymagane' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Nieprawidłowy adres email' }, { status: 400 })
    }

    const qty = parseInt(String(quantity)) || 1
    if (qty < 1) {
      return Response.json({ error: 'Ilość musi być co najmniej 1' }, { status: 400 })
    }

    const number = generateInquiryNumber()

    const inquiry = await prisma.inquiry.create({
      data: {
        number,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        message: message?.trim() || null,
        productId: productId || null,
        productName: productName.trim(),
        quantity: qty,
      },
    })

    return Response.json({ success: true, number: inquiry.number }, { status: 201 })
  } catch (error) {
    console.error('Błąd zapisu zapytania:', error)
    return Response.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}
