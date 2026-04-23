import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import TicketActions from './ticket-actions'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  NEW: { label: 'Nowe', color: 'bg-blue-100 text-blue-700' },
  DIAGNOSED: { label: 'Zdiagnozowane', color: 'bg-purple-100 text-purple-700' },
  IN_REPAIR: { label: 'W naprawie', color: 'bg-yellow-100 text-yellow-700' },
  WAITING_FOR_PARTS: { label: 'Czeka na części', color: 'bg-orange-100 text-orange-700' },
  READY_FOR_PICKUP: { label: 'Gotowe do odbioru', color: 'bg-teal-100 text-teal-700' },
  COMPLETED: { label: 'Zakończone', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Anulowane', color: 'bg-gray-100 text-gray-600' },
}

const EQUIPMENT_LABELS: Record<string, string> = {
  LAMP: 'Lampa ostrzegawcza',
  SPEAKER: 'Głośnik / nagłośnienie',
  GENERATOR: 'Generator prądu',
  SIREN: 'Syrena alarmowa',
  SIGNALLER: 'Sygnalizator świetlny',
  OTHER: 'Inne urządzenie',
}

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  LOW: { label: 'Niski', color: 'bg-gray-100 text-gray-600' },
  NORMAL: { label: 'Normalny', color: 'bg-blue-100 text-blue-700' },
  HIGH: { label: 'Wysoki', color: 'bg-orange-100 text-orange-700' },
  CRITICAL: { label: 'KRYTYCZNY', color: 'bg-red-100 text-red-700' },
}

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      notes: { orderBy: { createdAt: 'asc' } },
      attachments: true,
    },
  })

  if (!ticket) notFound()

  const s =
    STATUS_LABELS[ticket.status] || { label: ticket.status, color: 'bg-gray-100 text-gray-600' }
  const p =
    PRIORITY_LABELS[ticket.priority] || { label: ticket.priority, color: 'bg-gray-100 text-gray-600' }
  const eqLabel = EQUIPMENT_LABELS[ticket.equipmentType] || ticket.equipmentType

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4">
        <Link href="/admin/zgloszenia" className="text-red-600 hover:underline text-sm">
          ← Powrót do listy
        </Link>
      </div>

      {/* Nagłówek */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Numer zgłoszenia</p>
            <h1 className="text-2xl font-mono font-bold text-red-600">{ticket.number}</h1>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${p.color}`}>
              {p.label}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${s.color}`}>
              {s.label}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div>
            <span className="text-gray-500">Jednostka:</span>{' '}
            <span className="font-medium">{ticket.institutionName}</span>
          </div>
          {ticket.unitName && (
            <div>
              <span className="text-gray-500">Oddział:</span>{' '}
              <span>{ticket.unitName}</span>
            </div>
          )}
          <div>
            <span className="text-gray-500">Osoba kontaktowa:</span>{' '}
            <span className="font-medium">{ticket.contactPerson}</span>
          </div>
          <div>
            <span className="text-gray-500">Email:</span>{' '}
            <a
              href={`mailto:${ticket.contactEmail}`}
              className="text-red-600 hover:underline"
            >
              {ticket.contactEmail}
            </a>
          </div>
          <div>
            <span className="text-gray-500">Telefon:</span>{' '}
            <a href={`tel:${ticket.contactPhone}`} className="text-red-600 hover:underline">
              {ticket.contactPhone}
            </a>
          </div>
          <div>
            <span className="text-gray-500">Typ sprzętu:</span>{' '}
            <span className="font-medium">{eqLabel}</span>
          </div>
          <div>
            <span className="text-gray-500">Model:</span>{' '}
            <span className="font-medium">{ticket.equipmentModel}</span>
          </div>
          {ticket.serialNumber && (
            <div>
              <span className="text-gray-500">Nr seryjny:</span>{' '}
              <span>{ticket.serialNumber}</span>
            </div>
          )}
          {ticket.equipmentYear && (
            <div>
              <span className="text-gray-500">Rok prod.:</span>{' '}
              <span>{ticket.equipmentYear}</span>
            </div>
          )}
          <div>
            <span className="text-gray-500">Zgłoszono:</span>{' '}
            <span>
              {new Date(ticket.createdAt).toLocaleDateString('pl-PL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
            Opis usterki
          </p>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{ticket.description}</p>
        </div>
      </div>

      {/* Notatki */}
      {ticket.notes.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 className="font-semibold text-gray-800 mb-4">Historia notatek</h2>
          <div className="space-y-3">
            {ticket.notes.map((note: { id: string; content: string; isPublic: boolean; createdAt: Date }) => (
              <div
                key={note.id}
                className={`border-l-2 pl-3 ${
                  note.isPublic ? 'border-red-400' : 'border-gray-200'
                }`}
              >
                <p className="text-sm text-gray-800">{note.content}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">
                    {new Date(note.createdAt).toLocaleDateString('pl-PL', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {note.isPublic && (
                    <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                      wysłana do jednostki
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Akcje */}
      <TicketActions ticketId={ticket.id} currentStatus={ticket.status} />
    </div>
  )
}
