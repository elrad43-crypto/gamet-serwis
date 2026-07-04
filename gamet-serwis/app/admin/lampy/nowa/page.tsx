import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import LampaForm from '@/components/LampaForm'

export default async function NowaLampaPage() {
  const [warianty, klienciRows] = await Promise.all([
    prisma.wariantOrion.findMany({
      select: { code: true, color: true, opis: true },
      orderBy: [{ color: 'asc' }, { code: 'asc' }],
    }),
    prisma.klient.findMany({ select: { name: true }, orderBy: { name: 'asc' } }),
  ])

  const klienci = klienciRows.map((k) => k.name)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4">
        <Link href="/admin/zgloszenia" className="text-blue-600 hover:underline text-sm">
          ← Powrót
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Nowa lampa ORION</h1>
        <p className="text-gray-500 mb-6 text-sm">
          Przepisz rekord z kartki miesięcznej. Obsługiwane są zakresy i listy numerów seryjnych.
        </p>

        <LampaForm warianty={warianty} klienci={klienci} />
      </div>
    </div>
  )
}
