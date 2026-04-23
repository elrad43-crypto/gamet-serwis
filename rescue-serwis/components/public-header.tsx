import Link from 'next/link'

export function PublicHeader() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-sm">
            🚑
          </div>
          <span className="font-bold text-gray-900">Serwis Ratowniczy</span>
        </Link>
        <nav className="flex items-center gap-5">
          <Link href="/sklep" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Sklep
          </Link>
          <Link
            href="/zgloszenie"
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
          >
            Złóż zgłoszenie
          </Link>
        </nav>
      </div>
    </header>
  )
}
