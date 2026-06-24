import Link from 'next/link'

export default async function Potwierdzenie({
  searchParams,
}: {
  searchParams: Promise<{ nr?: string }>
}) {
  const { nr } = await searchParams

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Zgłoszenie przyjęte!
          </h1>
          <p className="text-gray-500 mb-6 text-sm">
            Dziękujemy za przesłanie zgłoszenia serwisowego. Skontaktujemy się z
            Tobą w ciągu 24 godzin.
          </p>

          {nr && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-xs text-gray-500 mb-1">Numer zgłoszenia</p>
              <p className="text-xl font-mono font-bold text-blue-600">{nr}</p>
              <p className="text-xs text-gray-400 mt-1">
                Zachowaj ten numer – będzie potrzebny przy kontakcie z serwisem
              </p>
            </div>
          )}

          <p className="text-sm text-gray-500 mb-6">
            Potwierdzenie zostało wysłane na Twój adres email.
          </p>

          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
          >
            Powrót do strony głównej
          </Link>
        </div>
      </div>
    </main>
  )
}
