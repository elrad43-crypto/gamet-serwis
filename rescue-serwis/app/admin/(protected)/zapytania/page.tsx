import { prisma } from '@/lib/prisma'
import Link from 'next/link'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  NEW: { label: 'Nowe', color: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: 'W trakcie', color: 'bg-yellow-100 text-yellow-700' },
  ANSWERED: { label: 'Odpowiedziane', color: 'bg-green-100 text-green-700' },
  CLOSED: { label: 'Zamknięte', color: 'bg-gray-100 text-gray-500' },
}

export default async function ZapytaniaPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams

  const inquiries = await prisma.inquiry.findMany({
    where: status ? { status: status as never } : {},
    include: { product: { select: { slug: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const counts = await prisma.inquiry.groupBy({
    by: ['status'],
    _count: { status: true },
  })

  const total = counts.reduce((s, c) => s + c._count.status, 0)

  function buildHref(s?: string) {
    return s ? `/admin/zapytania?status=${s}` : '/admin/zapytania'
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          Zapytania
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({inquiries.length} wyników)
          </span>
        </h1>
        <span className="text-sm text-gray-500">Łącznie: {total}</span>
      </div>

      {/* Filtry statusu */}
      <div className="flex gap-2 flex-wrap mb-6">
        <Link
          href={buildHref()}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !status
              ? 'bg-red-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-red-300'
          }`}
        >
          Wszystkie ({total})
        </Link>
        {Object.entries(STATUS_LABELS).map(([key, { label }]) => {
          const count = counts.find((c) => c.status === key)?._count.status ?? 0
          return (
            <Link
              key={key}
              href={buildHref(key)}
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

      {inquiries.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          Brak zapytań
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Numer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Produkt</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Klient</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-16">Ilość</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Data</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inquiries.map((inq) => {
                const s = STATUS_LABELS[inq.status] ?? { label: inq.status, color: 'bg-gray-100 text-gray-600' }
                return (
                  <tr key={inq.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-red-600 font-medium text-xs">
                      {inq.number}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900 font-medium">{inq.productName}</div>
                      {inq.product?.slug && (
                        <Link
                          href={`/sklep/${inq.product.slug}`}
                          className="text-xs text-gray-400 hover:text-red-600"
                          target="_blank"
                        >
                          → sklep
                        </Link>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900">{inq.name}</div>
                      <div className="text-xs text-gray-400">{inq.email}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-center">{inq.quantity}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(inq.createdAt).toLocaleDateString('pl-PL')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/zapytania/${inq.id}`}
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
