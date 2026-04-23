import Link from 'next/link'

export default async function PotwierdzenieePage({
  searchParams,
}: {
  searchParams: Promise<{ nr?: string }>
}) {
  const { nr } = await searchParams

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✓</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Zgłoszenie przyjęte!
          </h1>
          <p className="text-gray-500 mb-6">
            Twoje zgłoszenie serwisowe zostało zarejestrowane w systemie.
          </p>

          {nr && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-500 mb-1">Numer zgłoszenia</p>
              <p className="text-2xl font-mono font-bold text-red-600">{nr}</p>
              <p className="text-xs text-gray-500 mt-1">
                Zapisz ten numer – będzie potrzebny do sprawdzenia statusu naprawy
              </p>
            </div>
          )}

          <div className="text-sm text-gray-600 mb-6 space-y-2">
            <p>Na podany adres email zostało wysłane potwierdzenie zgłoszenia.</p>
            <p>Nasz serwis skontaktuje się z Państwem w ciągu 24 godzin.</p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/zgloszenie"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              Złóż kolejne zgłoszenie
            </Link>
            <Link
              href="/"
              className="w-full border border-gray-200 text-gray-600 hover:border-gray-300 font-medium py-2.5 rounded-lg transition-colors text-sm"
            >
              Wróć do strony głównej
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
