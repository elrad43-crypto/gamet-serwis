# Gamet – Serwis Zgłoszeń

Aplikacja webowa do obsługi zgłoszeń serwisowych dla lamp ostrzegawczych
marki Gamet. Klienci zgłaszają usterkę przez formularz na stronie, a
pracownicy serwisu zarządzają zgłoszeniami w panelu administracyjnym.

## Funkcje

- Publiczny formularz zgłoszenia serwisowego (`/zgloszenie`) ze stroną
  potwierdzenia i numerem zgłoszenia.
- Panel administracyjny (`/admin`, logowanie wymagane) z listą zgłoszeń,
  filtrowaniem po statusie i wyszukiwaniem (numer, dane klienta, model lampy).
- Szczegóły zgłoszenia: zmiana statusu, dodawanie notatek wewnętrznych i
  publicznych.
- Automatyczne maile do klienta (potwierdzenie zgłoszenia, zmiana statusu)
  wysyłane przez Resend.

## Stos technologiczny

- Next.js 16, React 19, TypeScript
- Prisma 7 + PostgreSQL (`@prisma/adapter-pg`, `pg`)
- NextAuth (Auth.js v5, beta) – logowanie administratorów (Credentials + bcrypt)
- Resend – wysyłka maili
- Tailwind CSS 4

## Model danych (Prisma)

- **Ticket** – zgłoszenie serwisowe (dane klienta, model lampy, opis, status)
- **TicketNote** – notatki do zgłoszenia (wewnętrzne / publiczne)
- **Attachment** – załączniki do zgłoszenia (model istnieje, upload nie jest
  jeszcze zaimplementowany)
- **AdminUser** – konto administratora
- **TicketStatus** (enum): Nowe, W realizacji, Oczekiwanie na części,
  Zakończone, Zamknięte

## Wymagania

- Node.js
- PostgreSQL
- npm

## Jak uruchomić

1. Zainstaluj zależności:

   ```bash
   npm install
   ```

2. Utwórz plik `.env` w katalogu głównym z następującymi zmiennymi:

   - `DATABASE_URL` – connection string do bazy PostgreSQL
   - `AUTH_SECRET` – sekret NextAuth (np. `openssl rand -base64 32`)
   - `NEXTAUTH_URL` – adres aplikacji lokalnie, np. `http://localhost:3000`
   - `RESEND_API_KEY` – klucz API Resend do wysyłki maili
   - `RESEND_FROM_EMAIL` – adres nadawcy maili (domyślnie `serwis@gamet.pl`)

3. Zastosuj schemat bazy danych i wygeneruj klienta Prisma:

   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. Uruchom serwer deweloperski:

   ```bash
   npm run dev
   ```

5. Otwórz [http://localhost:3000](http://localhost:3000)

### Pierwsze konto administratora

Pierwsze konto administratora tworzy się lokalnym skryptem (np.
`node create-admin.mjs`, poza repo) – nie istnieje publiczny endpoint HTTP
do tworzenia adminów, żeby nie wystawiać tej operacji na świat.

## Skrypty

- `npm run dev` – serwer deweloperski
- `npm run build` – build produkcyjny
- `npm run start` – serwer produkcyjny
- `npm run lint` – lintowanie kodu
