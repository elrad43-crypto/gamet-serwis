import PDFDocument from 'pdfkit'
import { DEJAVU_SANS_REGULAR, DEJAVU_SANS_BOLD } from '@/lib/font-data'

// DejaVu Sans — open-source font z pełnym zestawem polskich znaków (ą,ę,ś,ó,ł,ń,ć,ż,ź)
// Wbudowany jako base64 — brak zależności od systemu plików (wymagane na Vercelu)
const FONTS = {
  regular: Buffer.from(DEJAVU_SANS_REGULAR, 'base64'),
  bold:    Buffer.from(DEJAVU_SANS_BOLD,    'base64'),
}

const STATUS_LABELS: Record<string, string> = {
  NEW: 'Nowe',
  IN_PROGRESS: 'W realizacji',
  WAITING_FOR_PARTS: 'Oczekiwanie na części',
  COMPLETED: 'Zakończone',
  CLOSED: 'Zamknięte',
}

const MONTHS_PL = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień',
]

export type PdfTicketRow = {
  number: string | null
  clientName: string
  companyName?: string | null
  lampModel: string
  serialNumber?: string | null
  status: string
  createdAt: Date
}

// A4: 595.28 x 841.89 pt
const PAGE_W = 595.28
const PAGE_H = 841.89
const ML = 50  // margin left/right
const MT = 50  // margin top
const MB = 50  // margin bottom
const CW = PAGE_W - ML * 2  // content width = 495.28

// Kolumny tabeli — szerokości sumują się do CW (495)
const COLS = [
  { label: 'Numer SRW',   w: 115, get: (t: PdfTicketRow) => t.number ?? '—' },
  { label: 'Firma',       w: 140, get: (t: PdfTicketRow) => t.companyName ?? '—' },
  { label: 'Produkt',     w: 130, get: (t: PdfTicketRow) => t.lampModel },
  { label: 'Nr seryjny',  w: 70,  get: (t: PdfTicketRow) => t.serialNumber ?? '—' },
  { label: 'Data',        w: 40,  get: (t: PdfTicketRow) => {
    const d = t.createdAt
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`
  }},
]

const ROW_H  = 18   // wysokość wiersza danych
const HEAD_H = 22   // wysokość wiersza nagłówka
const PAD    = 4    // padding poziomy w komórce
const FS     = 8.5  // font size w tabeli

function fit(doc: PDFKit.PDFDocument, text: string, maxW: number): string {
  if (doc.widthOfString(text) <= maxW) return text
  let s = text
  while (s.length > 1 && doc.widthOfString(s + '…') > maxW) s = s.slice(0, -1)
  return s + '…'
}

function hline(doc: PDFKit.PDFDocument, y: number, color = '#AAAAAA') {
  doc.save()
     .moveTo(ML, y).lineTo(ML + CW, y)
     .strokeColor(color).lineWidth(0.5).stroke()
     .restore()
}

function drawRow(
  doc: PDFKit.PDFDocument,
  y: number,
  ticket: PdfTicketRow | null,
  isHeader: boolean,
  alt = false,
) {
  const h = isHeader ? HEAD_H : ROW_H

  // tło
  if (isHeader) {
    doc.save().rect(ML, y, CW, h).fill('#DDDDDD').restore()
  } else if (alt) {
    doc.save().rect(ML, y, CW, h).fill('#F5F5F5').restore()
  }

  // linia górna
  hline(doc, y)

  let x = ML
  for (const col of COLS) {
    // linia pionowa lewa każdej kolumny
    doc.save()
       .moveTo(x, y).lineTo(x, y + h)
       .strokeColor('#AAAAAA').lineWidth(0.5).stroke()
       .restore()

    const rawText = isHeader ? col.label : col.get(ticket!)
    const font = isHeader ? 'Bold' : 'Regular'
    doc.font(font).fontSize(FS)
    const text = fit(doc, rawText, col.w - PAD * 2)
    const ty = y + (h - FS) / 2

    doc.fillColor('#000000')
       .text(text, x + PAD, ty, { width: col.w - PAD * 2, lineBreak: false })

    x += col.w
  }

  // linia pionowa prawa (koniec tabeli)
  doc.save()
     .moveTo(ML + CW, y).lineTo(ML + CW, y + h)
     .strokeColor('#AAAAAA').lineWidth(0.5).stroke()
     .restore()
}

export function generateMonthlyReportPdf(params: {
  month: number
  year: number
  tickets: PdfTicketRow[]
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const { month, year, tickets } = params
    const monthName = MONTHS_PL[month - 1]

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: MT, bottom: MB, left: ML, right: ML },
      autoFirstPage: true,
      info: { Title: `Raport miesięczny serwisu — ${monthName} ${year}` },
      // null prevents pdfkit from loading Helvetica.afm at construction time
      // (pdfkit checks `if (defaultFont)`, so null skips the default font load)
      font: null as unknown as string,
    })

    // ── WAŻNE: rejestracja fontów z polskimi znakami ──────────────────────────
    doc.registerFont('Regular', FONTS.regular)
    doc.registerFont('Bold',    FONTS.bold)
    // ─────────────────────────────────────────────────────────────────────────

    const chunks: Buffer[] = []
    doc.on('data',  c => chunks.push(c))
    doc.on('end',   () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // ── Nagłówek ──────────────────────────────────────────────────────────────
    doc.font('Bold').fontSize(15).fillColor('#000000')
       .text(`Raport miesięczny serwisu — ${monthName} ${year}`, ML, MT)
    hline(doc, doc.y + 5, '#888888')
    doc.moveDown(0.9)

    // ── Meta ──────────────────────────────────────────────────────────────────
    const firstDay = `01.${String(month).padStart(2, '0')}.${year}`
    const lastDayDate = new Date(year, month, 0)
    const lastDay = `${String(lastDayDate.getDate()).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`

    doc.font('Regular').fontSize(10)
       .text(`Okres: ${firstDay} – ${lastDay}`, ML)
       .text(`Liczba zgłoszeń: ${tickets.length}`)

    doc.moveDown(0.6)

    // ── Podsumowanie statusów ─────────────────────────────────────────────────
    const cnt: Record<string, number> = {}
    for (const t of tickets) cnt[t.status] = (cnt[t.status] ?? 0) + 1

    doc.font('Bold').fontSize(10).text('Podsumowanie po statusach', ML)
    doc.moveDown(0.2)
    doc.font('Regular').fontSize(9).text(
      [
        `Nowe: ${cnt['NEW'] ?? 0}`,
        `W realizacji: ${cnt['IN_PROGRESS'] ?? 0}`,
        `Oczekiwanie na części: ${cnt['WAITING_FOR_PARTS'] ?? 0}`,
        `Zakończone: ${cnt['COMPLETED'] ?? 0}`,
        `Zamknięte: ${cnt['CLOSED'] ?? 0}`,
      ].join('   ·   '),
      ML,
    )
    doc.moveDown(0.8)

    // ── Tabela ────────────────────────────────────────────────────────────────
    doc.font('Bold').fontSize(10).text('Zestawienie zgłoszeń', ML)
    doc.moveDown(0.4)

    let y = doc.y

    // nagłówek tabeli
    drawRow(doc, y, null, true)
    y += HEAD_H

    // wiersze danych
    for (let i = 0; i < tickets.length; i++) {
      if (y + ROW_H > PAGE_H - MB - 10) {
        doc.addPage()
        y = MT
        drawRow(doc, y, null, true)
        y += HEAD_H
      }
      drawRow(doc, y, tickets[i], false, i % 2 === 1)
      y += ROW_H
    }

    // dolna krawędź tabeli
    hline(doc, y, '#888888')

    doc.end()
  })
}
