import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PublicHeader } from '@/components/public-header'

const EQUIPMENT_TYPES = [
  { icon: '🔦', label: 'Lampy ostrzegawcze' },
  { icon: '🔊', label: 'Głośniki i nagłośnienie' },
  { icon: '⚡', label: 'Generatory prądu' },
  { icon: '🚨', label: 'Syreny alarmowe' },
  { icon: '🚦', label: 'Sygnalizatory świetlne' },
]

export default async function Home() {
  const featured = await prisma.product.findMany({
    where: { inStock: true },
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 4,
  })

  return (
    <>
      <PublicHeader />
      <main className="flex-1 flex flex-col items-center px-4 py-12 bg-gray-50">
        <div className="max-w-2xl w-full text-center">
          {/* Logo / nagłówek */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-2xl mb-4">
              <span className="text-3xl">🚑</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Serwis Sprzętu Ratowniczego
            </h1>
            <p className="text-gray-500">
              Naprawa sprzętu ostrzegawczego dla służb ratowniczych
            </p>
          </div>

          {/* CTA */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              Zgłoś sprzęt do naprawy
            </h2>
            <p className="text-gray-600 mb-6">
              Lampa nie działa? Generator odmawia posłuszeństwa? Syrena milczy?
              Złóż zgłoszenie serwisowe — nasi technicy zajmą się Twoim sprzętem priorytetowo.
            </p>
            <Link
              href="/zgloszenie"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Złóż zgłoszenie serwisowe
            </Link>
          </div>

          {/* Typy sprzętu */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
              Obsługiwany sprzęt
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {EQUIPMENT_TYPES.map(({ icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-full"
                >
                  {icon} {label}
                </span>
              ))}
            </div>
          </div>

          {/* Statystyki */}
          <div className="grid grid-cols-3 gap-4 text-center text-sm text-gray-500">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-2xl font-bold text-red-600 mb-1">24h</div>
              <div>Czas reakcji</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-2xl font-bold text-red-600 mb-1">Priorytet</div>
              <div>Dla służb</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-2xl font-bold text-red-600 mb-1">Gwarancja</div>
              <div>Na naprawy</div>
            </div>
          </div>

          <p className="mt-6 text-xs text-gray-400">
            Panel administracyjny:{' '}
            <Link href="/admin/login" className="text-gray-500 hover:underline">
              Zaloguj się
            </Link>
          </p>
        </div>

        {/* Polecane produkty */}
        {featured.length > 0 && (
          <div className="max-w-5xl w-full mt-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Sklep z częściami</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Oryginalne części i akcesoria do sprzętu ratowniczego
                </p>
              </div>
              <Link
                href="/sklep"
                className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                Zobacz wszystkie części →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.map((p) => (
                <Link
                  key={p.id}
                  href={`/sklep/${p.slug}`}
                  className="bg-white rounded-xl border border-gray-200 hover:border-red-300 hover:shadow-sm transition-all overflow-hidden group"
                >
                  <div className="h-36 bg-gray-100 flex items-center justify-center text-4xl">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      '📦'
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-400 mb-1">{p.category.name}</p>
                    <p className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-red-600 transition-colors line-clamp-2">
                      {p.name}
                    </p>
                    {p.price !== null && (
                      <p className="text-red-600 font-bold mt-2 text-sm">
                        {parseFloat(p.price.toString()).toFixed(2)} zł
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  )
}
