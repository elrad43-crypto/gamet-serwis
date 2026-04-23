import { auth } from '@/lib/auth'
import { signOut } from '@/lib/auth'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin/zgloszenia" className="flex items-center gap-2 font-bold text-gray-900">
            <span className="text-lg">🚑</span>
            <span>Rescue Serwis</span>
          </Link>
          <Link
            href="/admin/zgloszenia"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Zgłoszenia
          </Link>
          <Link
            href="/admin/produkty"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Produkty
          </Link>
          <Link
            href="/admin/kategorie"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Kategorie
          </Link>
          <Link
            href="/admin/zapytania"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Zapytania
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{session.user.name}</span>
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/admin/login' })
            }}
          >
            <button
              type="submit"
              className="text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              Wyloguj
            </button>
          </form>
        </div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}
