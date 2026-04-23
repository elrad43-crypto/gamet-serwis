import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { InquiryActions } from './inquiry-actions'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  NEW: { label: 'Nowe', color: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: 'W trakcie', color: 'bg-yellow-100 text-yellow-700' },
  ANSWERED: { label: 'Odpowiedziane', color: 'bg-green-100 text-green-700' },
  CLOSED: { label: 'Zamknięte', color: 'bg-gray-100 text-gray-500' },
}

export default async function ZapytanieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    include: { product: { select: { name: true, slug: true } } },
  })

  if (!inquiry) notFound()

  const s = STATUS_LABELS[inquiry.status] ?? { label: inquiry.status, color: 'bg-gray-100 text-gray-600' }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4">
        <Link href="/admin/zapytania" className="text-red-600 hover:underline text-sm">
          ← Powrót do listy
        </Link>
      </div>

      {/* Nagłówek */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Numer zapytania</p>
            <h1 className="text-2xl font-mono font-bold text-red-600">{inquiry.number}</h1>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${s.color}`}>
            {s.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div>
            <span className="text-gray-500">Klient:</span>{' '}
            <span className="font-medium">{inquiry.name}</span>
          </div>
          <div>
            <span className="text-gray-500">Email:</span>{' '}
            <a href={`mailto:${inquiry.email}`} className="text-red-600 hover:underline">
              {inquiry.email}
            </a>
          </div>
          {inquiry.phone && (
            <div>
              <span className="text-gray-500">Telefon:</span>{' '}
              <a href={`tel:${inquiry.phone}`} className="text-red-600 hover:underline">
                {inquiry.phone}
              </a>
            </div>
          )}
          <div>
            <span className="text-gray-500">Ilość:</span>{' '}
            <span className="font-medium">{inquiry.quantity} szt.</span>
          </div>
          <div>
            <span className="text-gray-500">Produkt:</span>{' '}
            <span className="font-medium">{inquiry.productName}</span>
            {inquiry.product?.slug && (
              <Link
                href={`/sklep/${inquiry.product.slug}`}
                target="_blank"
                className="ml-2 text-xs text-gray-400 hover:text-red-600"
              >
                → sklep
              </Link>
            )}
          </div>
          <div>
            <span className="text-gray-500">Data:</span>{' '}
            <span>
              {new Date(inquiry.createdAt).toLocaleDateString('pl-PL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {inquiry.message && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
              Wiadomość od klienta
            </p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{inquiry.message}</p>
          </div>
        )}

        {inquiry.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
              Notatka wewnętrzna
            </p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
              {inquiry.notes}
            </p>
          </div>
        )}
      </div>

      {/* Akcje */}
      <InquiryActions
        inquiryId={inquiry.id}
        currentStatus={inquiry.status}
        currentNotes={inquiry.notes}
      />
    </div>
  )
}
