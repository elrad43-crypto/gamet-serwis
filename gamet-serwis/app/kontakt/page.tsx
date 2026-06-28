import Link from 'next/link'

export default function Kontakt() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50">
      <div className="max-w-2xl w-full">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Kontakt</h1>
          <p className="text-xl text-gray-500">Przedsiębiorstwo Wytwórcze GAMET</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <p className="text-gray-600 mb-6">
            Jesteśmy producentem lamp ostrzegawczych dla pojazdów uprzywilejowanych
            (policja, pogotowie, straż pożarna) od 1990 roku. Zapraszamy do kontaktu.
          </p>

          <div className="space-y-4 text-gray-700">
            <div className="flex items-start gap-3">
              <span className="font-semibold text-gray-800 min-w-[160px]">Adres:</span>
              <span>ul. Graniczna 52, 09-402 Płock</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-semibold text-gray-800 min-w-[160px]">Telefon / fax:</span>
              <a href="tel:+48243652600" className="text-blue-600 hover:text-blue-700 transition-colors">
                +48 24 365 26 00
              </a>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-semibold text-gray-800 min-w-[160px]">Tel. komórkowy:</span>
              <a href="tel:+48501172743" className="text-blue-600 hover:text-blue-700 transition-colors">
                501 172 743
              </a>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-semibold text-gray-800 min-w-[160px]">E-mail:</span>
              <a href="mailto:info@pwgamet.com.pl" className="text-blue-600 hover:text-blue-700 transition-colors">
                info@pwgamet.com.pl
              </a>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-semibold text-gray-800 min-w-[160px]">Godziny pracy:</span>
              <span>Pn–Pt 07:00–15:30</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            ← Wróć na stronę główną
          </Link>
        </div>
      </div>
    </main>
  )
}
