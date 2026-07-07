import { prisma } from '@/lib/prisma'
import NoweZgloszenieForm from './NoweZgloszenieForm'

export default async function NoweZgloszeniePage() {
  const rows = await prisma.ticket.findMany({
    where: { companyName: { not: null } },
    distinct: ['companyName'],
    select: { companyName: true },
    orderBy: { companyName: 'asc' },
  })
  const companyNames = rows.map((r) => r.companyName!).filter(Boolean)

  const clientRows = await prisma.ticket.findMany({
    where: { companyName: { not: null } },
    select: {
      companyName: true,
      clientName: true,
      clientEmail: true,
      clientPhone: true,
      shippingStreet: true,
      shippingPostalCode: true,
      shippingCity: true,
    },
  })

  return <NoweZgloszenieForm companyNames={companyNames} clientSuggestions={clientRows} />
}
