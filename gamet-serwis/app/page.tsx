import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Gamet</h1>
          <p className="text-xl text-gray-500">Producent Lamp Ostrzegawczych</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            Serwis lamp ostrzegawczych
          </h2>
          <p className="text-gray-600 mb-6">
            Masz problem z lamp� ostrzegawcz� Gamet? Z�� zg�oszenie serwisowe �
            nasi specjali�ci zajm� si� Twoim urz�dzeniem.
          </p>
          <Link
            href="/zgloszenie"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Z�� zg�oszenie serwisowe
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center text-sm text-gray-500">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600 mb-1">24h</div>
            <div>Czas odpowiedzi</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600 mb-1">100%</div>
            <div>Oryginalne cz�ci</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600 mb-1">Gwarancja</div>
            <div>Na naprawy</div>
          </div>
        </div>
      </div>
    </main>
  )
}
