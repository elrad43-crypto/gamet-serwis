import { prisma } from '@/lib/prisma'
import Link from 'next/link'

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
  LAMP: 'Lampa',
  SPEAKER: 'Głośnik',
  GENERATOR: 'Generator',
  SIREN: 'Syrena',
  SIGNALLER: 'Sygnalizator',
  OTHER: 'Inne',
}

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  LOW: { label: 'Niski', color: 'text-gray-500' },
  NORMAL: { label: 'Normalny', color: 'text-blue-600' },
  HIGH: { label: 'Wysoki', color: 'text-orange-600' },
  CRITICAL: { label: 'KRYTYCZNY', color: 'text-red-600 font-bold' },
}

export default async function ZgloszeniaPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; priority?: string; q?: string }>
}) {
  const { status, type, priority, q } = await searchParams

  const tickets = await prisma.ticket.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(type ? { equipmentType: type as never } : {}),
      ...(priority ? { priority: priority as never } : {}),
      ...(q
        ? {
            OR: [
              { number: { contains: q, mode: 'insensitive' } },
              { institutionName: { contains: q, mode: 'insensitive' } },
              { contactPerson: { contains: q, mode: 'insensitive' } },
              { contactEmail: { contains: q, mode: 'insensitive' } },
              { equipmentModel: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' },
    ],
  })

  const counts = await prisma.ticket.groupBy({
    by: ['status'],
    _count: { status: true },
  })

  const total = counts.reduce(
    (sum: number, c: (typeof counts)[number]) => sum + c._count.status,
    0
  )

  const buildHref = (params: Record<string, string | undefined>) => {
    const merged = { status, type, priority, q, ...params }
    const entries = Object.entries(merged).filter(([, v]) => v !== undefined && v !== '')
    if (entries.length === 0) return '/admin/zgloszenia'
    return `/admin/zgloszenia?${new URLSearchParams(entries as [string, string][]).toString()}`
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          Zgłoszenia serwisowe
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({tickets.length} wyników)
          </span>
        </h1>
        <span className="text-sm text-gray-500">Łącznie w systemie: {total}</span>
      </div>

      {/* Filtry statusu */}
      <div className="flex gap-2 flex-wrap mb-3">
        <Link
          href={buildHref({ status: undefined })}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !status
              ? 'bg-red-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-red-300'
          }`}
        >
          Wszystkie ({total})
        </Link>
        {Object.entries(STATUS_LABELS).map(([key, { label }]) => {
          const count =
            counts.find((c: (typeof counts)[number]) => c.status === key)?._count.status ?? 0
          return (
            <Link
              key={key}
              href={buildHref({ status: key })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                status === key
                  ? 'bg-red-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-red-300'
              }`}
            >
              {label} ({count})
            </Link>
          )
        })}
      </div>

      {/* Filtry priorytetu */}
      <div className="flex gap-2 flex-wrap mb-4">
        <span className="text-xs text-gray-400 self-center mr-1">Priorytet:</span>
        {['CRITICAL', 'HIGH', 'NORMAL', 'LOW'].map((p) => (
          <Link
            key={p}
            href={buildHref({ priority: priority === p ? undefined : p })}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              priority === p
                ? 'bg-gray-800 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {PRIORITY_LABELS[p].label}
          </Link>
        ))}
        <span className="text-xs text-gray-400 self-center ml-3 mr-1">Typ:</span>
        {Object.entries(EQUIPMENT_LABELS).map(([key, label]) => (
          <Link
            key={key}
            href={buildHref({ type: type === key ? undefined : key })}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              type === key
                ? 'bg-gray-800 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Wyszukiwarka */}
      <form className="mb-6">
        {status && <input type="hidden" name="status" value={status} />}
        {type && <input type="hidden" name="type" value={type} />}
        {priority && <input type="hidden" name="priority" value={priority} />}
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Szukaj po numerze, jednostce, osobie kontaktowej, emailu lub modelu..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
        />
      </form>

      {/* Lista zgłoszeń */}
      {tickets.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          Brak zgłoszeń spełniających kryteria
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Numer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Jednostka</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Sprzęt</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Priorytet</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Data</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.map((ticket: (typeof tickets)[number]) => {
                const s =
                  STATUS_LABELS[ticket.status] || {
                    label: ticket.status,
                    color: 'bg-gray-100 text-gray-600',
                  }
                const p = PRIORITY_LABELS[ticket.priority] || {
                  label: ticket.priority,
                  color: 'text-gray-600',
                }
                const eqLabel = EQUIPMENT_LABELS[ticket.equipmentType] || ticket.equipmentType
                return (
                  <tr
                    key={ticket.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      ticket.priority === 'CRITICAL' ? 'bg-red-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-red-600 font-medium">
                      {ticket.number}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{ticket.institutionName}</div>
                      <div className="text-gray-500 text-xs">{ticket.contactPerson}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-700">{eqLabel}</div>
                      <div className="text-gray-500 text-xs">{ticket.equipmentModel}</div>
                    </td>
                    <td className={`px-4 py-3 text-xs font-medium ${p.color}`}>{p.label}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(ticket.createdAt).toLocaleDateString('pl-PL')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/zgloszenia/${ticket.id}`}
                        className="text-red-600 hover:underline text-xs font-medium"
                      >
                        Szczegóły →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
