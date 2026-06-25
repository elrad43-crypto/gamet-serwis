import { prisma } from '@/lib/prisma'
import { TicketStatus } from '@prisma/client'
import Link from 'next/link'
import { LAMP_CATEGORIES, LAMP_TYPES, getLampCategory } from '@/lib/lamp-types'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  NEW: { label: 'Nowe', color: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: 'W realizacji', color: 'bg-yellow-100 text-yellow-700' },
  WAITING_FOR_PARTS: { label: 'Oczekiwanie na części', color: 'bg-orange-100 text-orange-700' },
  COMPLETED: { label: 'Zakończone', color: 'bg-green-100 text-green-700' },
  CLOSED: { label: 'Zamknięte', color: 'bg-gray-100 text-gray-600' },
}

export default async function ZgloszeniaPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; category?: string }>
}) {
  const { status, q, category } = await searchParams

  const categoryGroupCodes = category
    ? LAMP_TYPES.filter((t) => t.category === category).map((t) => t.groupCode)
    : null

  const tickets = await prisma.ticket.findMany({
    where: {
      ...(status ? { status: status as TicketStatus } : {}),
      ...(categoryGroupCodes ? { lampGroupCode: { in: categoryGroupCodes } } : {}),
      ...(q
        ? {
            OR: [
              { number: { contains: q, mode: 'insensitive' } },
              { clientName: { contains: q, mode: 'insensitive' } },
              { clientEmail: { contains: q, mode: 'insensitive' } },
              { lampModel: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
  })

  const counts = await prisma.ticket.groupBy({
    by: ['status'],
    _count: { status: true },
  })

  const total = counts.reduce((sum: number, c: typeof counts[number]) => sum + c._count.status, 0)

  function statusLinkHref(statusKey?: string) {
    const sp = new URLSearchParams()
    if (statusKey) sp.set('status', statusKey)
    if (category) sp.set('category', category)
    if (q) sp.set('q', q)
    const s = sp.toString()
    return `/admin/zgloszenia${s ? `?${s}` : ''}`
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
        <span className="text-sm text-gray-500">Łącznie: {total}</span>
      </div>

      {/* Filtry statusu */}
      <div className="flex gap-2 flex-wrap mb-4">
        <Link
          href={statusLinkHref()}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !status
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
          }`}
        >
          Wszystkie ({total})
        </Link>
        {Object.entries(STATUS_LABELS).map(([key, { label }]) => {
          const count = counts.find((c: typeof counts[number]) => c.status === key)?._count.status ?? 0
          return (
            <Link
              key={key}
              href={statusLinkHref(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                status === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
              }`}
            >
              {label} ({count})
            </Link>
          )
        })}
      </div>

      {/* Wyszukiwarka i filtr kategorii */}
      <form className="flex flex-col sm:flex-row gap-2 mb-6">
        {status && <input type="hidden" name="status" value={status} />}
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Szukaj po numerze, nazwisku, emailu lub modelu..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
        <select
          name="category"
          defaultValue={category ?? ''}
          className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Wszystkie kategorie</option>
          {LAMP_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          Filtruj
        </button>
      </form>

      {/* Lista zgłoszeń */}
      {tickets.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          Brak zgłoszeń
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Numer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Klient</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Model lampy</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Kategoria</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Data</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.map((ticket: (typeof tickets)[number]) => {
                const s = STATUS_LABELS[ticket.status] || { label: ticket.status, color: 'bg-gray-100 text-gray-600' }
                return (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition-colors" data-id={ticket.id}>
                    <td className="px-4 py-3 font-mono text-blue-600 font-medium">
                      {ticket.number}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{ticket.clientName}</div>
                      <div className="text-gray-500 text-xs">{ticket.clientEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{ticket.lampModel}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {getLampCategory(ticket.lampGroupCode) ?? '—'}
                    </td>
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
                        className="text-blue-600 hover:underline text-xs font-medium"
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
