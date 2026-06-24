<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — gamet-serwis

## Czym jest projekt
Strona serwisowa dla firmy gamet-serwis. Klienci wysyłają zgłoszenia serwisowe
przez formularz; zgłoszenia trafiają do bazy danych. Są konta użytkowników
i wysyłka e-maili (potwierdzenia). Hosting: GitHub + Vercel.

## Stos
- Next.js 16 (App Router, folder `app/`), React 19, TypeScript
- Baza: PostgreSQL przez Prisma 7 (`prisma/`)
- Logowanie: next-auth 5, hasła hashowane przez bcryptjs
- Formularze: react-hook-form + walidacja zod
- E-maile: resend
- Style: Tailwind CSS 4

## Zasady (czego trzymać się zawsze)
- Każdy formularz waliduj przez **zod** — nie ufaj danym od użytkownika.
- Zmiany w bazie tylko przez **migracje Prisma** (`prisma migrate`), nigdy ręcznie.
- Hasła zawsze przez **bcryptjs** — nigdy nie zapisuj hasła jawnie.
- Sekrety (klucze API, dane bazy) tylko w `.env` — nigdy w kodzie, nigdy w repo.

## Czego NIE wolno
- Nie dotykaj plików logowania w `app/api/auth/` bez mojej wyraźnej zgody.
- Nie zmieniaj schematu bazy (`prisma/schema.prisma`) bez pokazania mi planu.
- Nie usuwaj danych z bazy produkcyjnej. Pracuj lokalnie.
- Nie dodawaj nowych bibliotek do `package.json` bez pytania.

## Jak sprawdzić swoją pracę (zanim oddasz wynik)
- Uruchom `npm run lint` — ma być bez błędów.
- Uruchom `npm run build` — musi przejść bez błędów.
- Jeśli zmieniałeś bazę: `npx prisma validate` ma być zielone.

## Kiedy się zatrzymać i zapytać
- Zadanie wymagałoby zmiany logowania, haseł albo schematu bazy.
- Trzeba ruszyć ustawienia Vercela albo zmienne środowiskowe na serwerze.
- Coś jest niejasne w wymaganiach — pytaj, nie zgaduj.

<!-- ====== DO UZUPEŁNIENIA PRZEZ CIEBIE ====== -->
## TODO 1 — Konwencje
Gdzie trzymasz strony, komponenty, schematy zod? (np. „formularze w `app/(forms)/`,
schematy zod w `lib/validators/`"). Wpisz tu, gdy się ustali.

## TODO 2 — Walidacje krajowe (jeśli są)
Czy zbierasz NIP / telefon / kod pocztowy? Jeśli tak, opisz reguły
(np. „NIP: 10 cyfr"; „telefon: format +48 XXX XXX XXX").

## TODO 3 — E-maile
Jakie maile wysyła serwis i do kogo? (np. „potwierdzenie zgłoszenia do klienta,
powiadomienie do serwisanta"). Wpisz, gdy ustalone.
