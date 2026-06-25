import Link from 'next/link'

// Formularz wylaczony - zgloszenia zaklada teraz serwis recznie w panelu
// admina (numer SRW pochodzi z webGamet). Pelny kod formularza zostal
// w ZgloszenieForm.tsx - przywrocenie: import + render tego komponentu tutaj.
export default function Zgloszenie() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Zgłoszenia przyjmuje serwis
          </h1>
          <p className="text-gray-500 mb-6 text-sm">
            Zgłoszenia serwisowe są obecnie przyjmowane telefonicznie lub mailowo,
            nie przez ten formularz.
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
