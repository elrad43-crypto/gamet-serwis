import { PublicHeader } from '@/components/public-header'

export default function SklepLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicHeader />
      <main className="flex-1 bg-gray-50">{children}</main>
    </>
  )
}
