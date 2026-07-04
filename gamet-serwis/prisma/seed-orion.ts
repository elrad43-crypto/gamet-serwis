// Seed słownika WariantOrion — barwy B (niebieska), A (żółta), R (czerwona), wg SCOPE-panel-serwis-orion.md.
// Źródło danych: "ORION R10.pdf" (dokumentacja homologacyjna).
//
// Uwaga (barwa B): w źródłowym PDF pozycje Lp. 55 i 56 mają te same oznaczenia co Lp. 22 i 23
// (B-4XF-HF / B-4XF-XR-HF), mimo że opis mówi o świetle "front and side" (czyli powinno
// być -HS). Uznane za błąd druku w dokumentacji homologacyjnej — kody poniżej mają
// dopisane brakujące "-HS", żeby uniknąć konfliktu z unikalnym `code`.
// Dodatkowo Lp. w PDF ma zdublowaną pozycję "57" — po korekcie duplikatów wychodzi
// 62 unikalnych oznaczeń, nie 61 jak w podsumowaniu w SCOPE.
//
// Uwaga (barwy A i R): ten sam typ błędu druku występuje przy Lp. 43-47 — powtarzają
// oznaczenia z Lp. 17-21 (np. A-4XF-HF), mimo opisu "front and side working lights".
// Skorygowano analogicznie, dopisując brakujące "-HS". Po korekcie każda z barw A/R
// ma 54 unikalne oznaczenia — zgodnie z podsumowaniem w SCOPE ("54 żółte + 54 czerwone").
// A i R nie mają tokenu XR (to wyróżnik tylko barwy B), więc xrRed = false dla wszystkich.
// Warto zweryfikować korekty z oryginałem dokumentacji przed importem na produkcję.
//
// Nie uruchamiać automatycznie — plik do przeglądu. Uruchomienie: npx tsx prisma/seed-orion.ts

import "dotenv/config";
import { PrismaClient, Color } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type WariantSeed = {
  code: string;
  opis: string;
  nXF: number;
  nXB: number;
  nHF: number;
  nHB: number;
  nHS: number;
  xrRed: boolean;
};

const wariantyB: WariantSeed[] = [
  { code: "B", opis: "base variant - left and right light T category only", nXF: 0, nXB: 0, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "B-XR", opis: "base left and right T category lights, red front/rear directional light", nXF: 0, nXB: 0, nHF: 0, nHB: 0, nHS: 0, xrRed: true },
  { code: "B-4XF", opis: "2 + 2 front directional lights", nXF: 4, nXB: 0, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "B-4XF-XR", opis: "2 + 2 front directional lights, front and rear directional lights", nXF: 4, nXB: 0, nHF: 0, nHB: 0, nHS: 0, xrRed: true },
  { code: "B-8XF", opis: "4 + 4 front directional lights", nXF: 8, nXB: 0, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "B-12XF", opis: "6 + 6 front directional lights", nXF: 12, nXB: 0, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "B-4XB", opis: "2 + 2 rear directional lights", nXF: 0, nXB: 4, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "B-4XB-XR", opis: "2 + 2 rear directional lights, front and rear directional lights", nXF: 0, nXB: 4, nHF: 0, nHB: 0, nHS: 0, xrRed: true },
  { code: "B-8XB", opis: "4 + 4 rear directional lights", nXF: 0, nXB: 8, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "B-12XB", opis: "6 + 6 rear directional lights", nXF: 0, nXB: 12, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "B-2XF-2XB", opis: "1 + 1 front directional light, 1 + 1 rear directional light", nXF: 2, nXB: 2, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "B-2XF-2XB-XR", opis: "1 + 1 front directional light, 1 + 1 rear direct. light, front/rear direct. red lights", nXF: 2, nXB: 2, nHF: 0, nHB: 0, nHS: 0, xrRed: true },
  { code: "B-4XF-4XB", opis: "2 + 2 front directional lights, 2 + 2 rear directional lights", nXF: 4, nXB: 4, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "B-4XF-4XB-XR", opis: "2 + 2 front directional lights, 2 + 2 rear direct. lights, front/rear direct. red lights", nXF: 4, nXB: 4, nHF: 0, nHB: 0, nHS: 0, xrRed: true },
  { code: "B-6XF-6XB", opis: "3 + 3 front directional lights, 3 + 3 rear directional lights", nXF: 6, nXB: 6, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "B-6XF-2XB", opis: "3 + 3 front directional lights, 1 + 1 rear directional light", nXF: 6, nXB: 2, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "B-10XF-2XB", opis: "5 + 5 front directional lights, 1 + 1 rear directional light", nXF: 10, nXB: 2, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "B-8XF-4XB", opis: "4 + 4 front directional lights, 2 + 2 rear directional lights", nXF: 8, nXB: 4, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "B-2XF-6XB", opis: "1 + 1 front directional light, 3 + 3 rear directional lights", nXF: 2, nXB: 6, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "B-2XF-10XB", opis: "1 + 1 front directional light, 5 + 5 rear directional lights", nXF: 2, nXB: 10, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "B-4XF-8XB", opis: "2 + 2 front directional lights, 4 + 4 rear directional lights", nXF: 4, nXB: 8, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "B-4XF-HF", opis: "2 + 2 front directional lights, front working lights", nXF: 4, nXB: 0, nHF: 1, nHB: 0, nHS: 0, xrRed: false },
  { code: "B-4XF-XR-HF", opis: "2 + 2 front directional lights, front/rear directional red lights, front working lights", nXF: 4, nXB: 0, nHF: 1, nHB: 0, nHS: 0, xrRed: true },
  { code: "B-8XF-HF", opis: "4 + 4 front directional lights, front working lights", nXF: 8, nXB: 0, nHF: 1, nHB: 0, nHS: 0, xrRed: false },
  { code: "B-2XF-2XB-HF", opis: "1 + 1 front directional light, 1 + 1 rear direct. light, front working lights", nXF: 2, nXB: 2, nHF: 1, nHB: 0, nHS: 0, xrRed: false },
  { code: "B-2XF-2XB-XR-HF", opis: "1 + 1 front light, 1 + 1 rear light, front/rear direct. red lights, front working lights", nXF: 2, nXB: 2, nHF: 1, nHB: 0, nHS: 0, xrRed: true },
  { code: "B-4XF-4XB-HF", opis: "2 + 2 front direct. lights, 2 + 2 rear direct. lights, front working lights", nXF: 4, nXB: 4, nHF: 1, nHB: 0, nHS: 0, xrRed: false },
  { code: "B-4XF-4XB-XR-HF", opis: "2 + 2 front lights, 2 + 2 rear lights, front/rear direct. red lights, front work. lights", nXF: 4, nXB: 4, nHF: 1, nHB: 0, nHS: 0, xrRed: true },
  { code: "B-6XF-2XB-HF", opis: "3 + 3 front direct. lights, 1 + 1 rear direct. light, front working lights", nXF: 6, nXB: 2, nHF: 1, nHB: 0, nHS: 0, xrRed: false },
  { code: "B-4XF-HB", opis: "2 + 2 front directional lights, rear working lights", nXF: 4, nXB: 0, nHF: 0, nHB: 1, nHS: 0, xrRed: false },
  { code: "B-8XF-HB", opis: "4 + 4 front directional lights, rear working lights", nXF: 8, nXB: 0, nHF: 0, nHB: 1, nHS: 0, xrRed: false },
  { code: "B-4XB-HB", opis: "2 + 2 rear directional lights, rear working lights", nXF: 0, nXB: 4, nHF: 0, nHB: 1, nHS: 0, xrRed: false },
  { code: "B-8XB-HB", opis: "4 + 4 rear directional lights, rear working lights", nXF: 0, nXB: 8, nHF: 0, nHB: 1, nHS: 0, xrRed: false },
  { code: "B-2XF-2XB-HB", opis: "1 + 1 front directional light, 1 + 1 rear direct. light, rear working lights", nXF: 2, nXB: 2, nHF: 0, nHB: 1, nHS: 0, xrRed: false },
  { code: "B-4XF-4XB-HB", opis: "2 + 2 front direct. lights, 2 + 2 rear direct. lights, rear working lights", nXF: 4, nXB: 4, nHF: 0, nHB: 1, nHS: 0, xrRed: false },
  { code: "B-6XF-2XB-HB", opis: "3 + 3 front direct. lights, 1 + 1 rear direct. light, rear working lights", nXF: 6, nXB: 2, nHF: 0, nHB: 1, nHS: 0, xrRed: false },
  { code: "B-2XF-6XB-HB", opis: "1 + 1 front directional light, 3 + 3 rear direct. lights, rear working lights", nXF: 2, nXB: 6, nHF: 0, nHB: 1, nHS: 0, xrRed: false },
  { code: "B-4XF-HS", opis: "2 + 2 front directional lights, side working lights", nXF: 4, nXB: 0, nHF: 0, nHB: 0, nHS: 1, xrRed: false },
  { code: "B-4XF-XR-HS", opis: "2 + 2 front directional lights, front/rear directional red lights, side working lights", nXF: 4, nXB: 0, nHF: 0, nHB: 0, nHS: 1, xrRed: true },
  { code: "B-8XF-HS", opis: "4 + 4 front directional lights, side working lights", nXF: 8, nXB: 0, nHF: 0, nHB: 0, nHS: 1, xrRed: false },
  { code: "B-4XB-HS", opis: "2 + 2 rear directional lights, side working lights", nXF: 0, nXB: 4, nHF: 0, nHB: 0, nHS: 1, xrRed: false },
  { code: "B-8XB-HS", opis: "4 + 4 rear directional lights, side working lights", nXF: 0, nXB: 8, nHF: 0, nHB: 0, nHS: 1, xrRed: false },
  { code: "B-2XF-2XB-HS", opis: "1 + 1 front directional light, 1 + 1 rear direct. light, side working lights", nXF: 2, nXB: 2, nHF: 0, nHB: 0, nHS: 1, xrRed: false },
  { code: "B-2XF-2XB-XR-HS", opis: "1 + 1 front direct., 1 + 1 rear direct., front/rear direct. red lights, side work. lights", nXF: 2, nXB: 2, nHF: 0, nHB: 0, nHS: 1, xrRed: true },
  { code: "B-4XF-4XB-HS", opis: "2 + 2 front direct. lights, 2 + 2 rear direct. lights, side working lights", nXF: 4, nXB: 4, nHF: 0, nHB: 0, nHS: 1, xrRed: false },
  { code: "B-6XF-2XB-HS", opis: "3 + 3 front direct. lights, 1 + 1 rear direct. light, side working lights", nXF: 6, nXB: 2, nHF: 0, nHB: 0, nHS: 1, xrRed: false },
  { code: "B-2XF-6XB-HS", opis: "1 + 1 front directional light, 3 + 3 rear direct. lights, side working lights", nXF: 2, nXB: 6, nHF: 0, nHB: 0, nHS: 1, xrRed: false },
  { code: "B-4XF-HF-HB", opis: "2 + 2 front directional lights, front and rear working lights", nXF: 4, nXB: 0, nHF: 1, nHB: 1, nHS: 0, xrRed: false },
  { code: "B-4XF-HF-XR-HB", opis: "2 + 2 front lights, front/rear direct. red lights, front and rear working lights", nXF: 4, nXB: 0, nHF: 1, nHB: 1, nHS: 0, xrRed: true },
  { code: "B-8XF-HF-HB", opis: "4 + 4 front directional lights, front and rear working lights", nXF: 8, nXB: 0, nHF: 1, nHB: 1, nHS: 0, xrRed: false },
  { code: "B-2XF-2XB-HF-HB", opis: "1 + 1 front directional light, 1 + 1 rear direct. light, front and rear working lights", nXF: 2, nXB: 2, nHF: 1, nHB: 1, nHS: 0, xrRed: false },
  { code: "B-2XF-2XB-XR-HF-HB", opis: "1 + 1 front direct., 1 + 1 rear direct., front/rear red lights, front/rear work. lights", nXF: 2, nXB: 2, nHF: 1, nHB: 1, nHS: 0, xrRed: true },
  { code: "B-4XF-4XB-HF-HB", opis: "2 + 2 front direct. lights, 2 + 2 rear direct. lights, front and rear working lights", nXF: 4, nXB: 4, nHF: 1, nHB: 1, nHS: 0, xrRed: false },
  { code: "B-6XF-2XB-HF-HB", opis: "3 + 3 front direct. lights, 1 + 1 rear direct. light, front and rear working lights", nXF: 6, nXB: 2, nHF: 1, nHB: 1, nHS: 0, xrRed: false },
  // Lp. 55/56 w PDF: kod skorygowany o brakujące "-HS" (patrz komentarz na górze pliku).
  { code: "B-4XF-HF-HS", opis: "2 + 2 front directional lights, front and side working lights", nXF: 4, nXB: 0, nHF: 1, nHB: 0, nHS: 1, xrRed: false },
  { code: "B-4XF-XR-HF-HS", opis: "2 + 2 front direct. lights, front/rear direct. lights, front and side working lights", nXF: 4, nXB: 0, nHF: 1, nHB: 0, nHS: 1, xrRed: true },
  { code: "B-2XF-2XB-HF-HS", opis: "1 + 1 front directional light, 1 + 1 rear direct. light, front and side working lights", nXF: 2, nXB: 2, nHF: 1, nHB: 0, nHS: 1, xrRed: false },
  { code: "B-2XF-2XB-XR-HF-HS", opis: "1 + 1 front, 1 + 1 rear, front/rear direct. red lights, front and side working lights", nXF: 2, nXB: 2, nHF: 1, nHB: 0, nHS: 1, xrRed: true },
  { code: "B-4XF-HB-HS", opis: "2 + 2 front directional lights, rear and side working lights", nXF: 4, nXB: 0, nHF: 0, nHB: 1, nHS: 1, xrRed: false },
  { code: "B-2XF-2XB-HB-HS", opis: "1 + 1 front directional light, 1 + 1 rear direct. light, rear and side working lights", nXF: 2, nXB: 2, nHF: 0, nHB: 1, nHS: 1, xrRed: false },
  { code: "B-4XF-HF-HB-HS", opis: "2 + 2 front directional lights, front, rear and side working lights", nXF: 4, nXB: 0, nHF: 1, nHB: 1, nHS: 1, xrRed: false },
  { code: "B-2XF-2XB-HF-HB-HS", opis: "1 + 1 front direct. light, 1 + 1 rear direct. light, front, rear and side working lights", nXF: 2, nXB: 2, nHF: 1, nHB: 1, nHS: 1, xrRed: false },
];

const wariantyA: WariantSeed[] = [
  { code: "A", opis: "base variant - left and right light T category only", nXF: 0, nXB: 0, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "A-4XF", opis: "2 + 2 front directional lights", nXF: 4, nXB: 0, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "A-8XF", opis: "4 + 4 front directional lights", nXF: 8, nXB: 0, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "A-12XF", opis: "6 + 6 front directional lights", nXF: 12, nXB: 0, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "A-4XB", opis: "2 + 2 rear directional lights", nXF: 0, nXB: 4, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "A-8XB", opis: "4 + 4 rear directional lights", nXF: 0, nXB: 8, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "A-12XB", opis: "6 + 6 rear directional lights", nXF: 0, nXB: 12, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "A-2XF-2XB", opis: "1 + 1 front directional light, 1 + 1 rear directional light", nXF: 2, nXB: 2, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "A-4XF-4XB", opis: "2 + 2 front directional lights, 2 + 2 rear directional lights", nXF: 4, nXB: 4, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "A-6XF-6XB", opis: "3 + 3 front directional lights, 3 + 3 rear directional lights", nXF: 6, nXB: 6, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "A-6XF-2XB", opis: "3 + 3 front directional lights, 1 + 1 rear directional light", nXF: 6, nXB: 2, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "A-10XF-2XB", opis: "5 + 5 front directional lights, 1 + 1 rear directional light", nXF: 10, nXB: 2, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "A-8XF-4XB", opis: "4 + 4 front directional lights, 2 + 2 rear directional lights", nXF: 8, nXB: 4, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "A-2XF-6XB", opis: "1 + 1 front directional light, 3 + 3 rear directional lights", nXF: 2, nXB: 6, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "A-2XF-10XB", opis: "1 + 1 front directional light, 5 + 5 rear directional lights", nXF: 2, nXB: 10, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "A-4XF-8XB", opis: "2 + 2 front directional lights, 4 + 4 rear directional lights", nXF: 4, nXB: 8, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "A-4XF-HF", opis: "2 + 2 front directional lights, front working lights", nXF: 4, nXB: 0, nHF: 1, nHB: 0, nHS: 0, xrRed: false },
  { code: "A-8XF-HF", opis: "4 + 4 front directional lights, front working lights", nXF: 8, nXB: 0, nHF: 1, nHB: 0, nHS: 0, xrRed: false },
  { code: "A-2XF-2XB-HF", opis: "1 + 1 front directional light, 1 + 1 rear direct. light, front working lights", nXF: 2, nXB: 2, nHF: 1, nHB: 0, nHS: 0, xrRed: false },
  { code: "A-4XF-4XB-HF", opis: "2 + 2 front direct. lights, 2 + 2 rear direct. lights, front working lights", nXF: 4, nXB: 4, nHF: 1, nHB: 0, nHS: 0, xrRed: false },
  { code: "A-6XF-2XB-HF", opis: "3 + 3 front direct. lights, 1 + 1 rear direct. light, front working lights", nXF: 6, nXB: 2, nHF: 1, nHB: 0, nHS: 0, xrRed: false },
  { code: "A-4XF-HB", opis: "2 + 2 front directional lights, rear working lights", nXF: 4, nXB: 0, nHF: 0, nHB: 1, nHS: 0, xrRed: false },
  { code: "A-8XF-HB", opis: "4 + 4 front directional lights, rear working lights", nXF: 8, nXB: 0, nHF: 0, nHB: 1, nHS: 0, xrRed: false },
  { code: "A-4XB-HB", opis: "2 + 2 rear directional lights, rear working lights", nXF: 0, nXB: 4, nHF: 0, nHB: 1, nHS: 0, xrRed: false },
  { code: "A-8XB-HB", opis: "4 + 4 rear directional lights, rear working lights", nXF: 0, nXB: 8, nHF: 0, nHB: 1, nHS: 0, xrRed: false },
  { code: "A-2XF-2XB-HB", opis: "1 + 1 front directional light, 1 + 1 rear direct. light, rear working lights", nXF: 2, nXB: 2, nHF: 0, nHB: 1, nHS: 0, xrRed: false },
  { code: "A-4XF-4XB-HB", opis: "2 + 2 front direct. lights, 2 + 2 rear direct. lights, rear working lights", nXF: 4, nXB: 4, nHF: 0, nHB: 1, nHS: 0, xrRed: false },
  { code: "A-6XF-2XB-HB", opis: "3 + 3 front direct. lights, 1 + 1 rear direct. light, rear working lights", nXF: 6, nXB: 2, nHF: 0, nHB: 1, nHS: 0, xrRed: false },
  { code: "A-2XF-6XB-HB", opis: "1 + 1 front directional light, 3 + 3 rear direct. lights, rear working lights", nXF: 2, nXB: 6, nHF: 0, nHB: 1, nHS: 0, xrRed: false },
  { code: "A-4XF-HS", opis: "2 + 2 front directional lights, side working lights", nXF: 4, nXB: 0, nHF: 0, nHB: 0, nHS: 1, xrRed: false },
  { code: "A-8XF-HS", opis: "4 + 4 front directional lights, side working lights", nXF: 8, nXB: 0, nHF: 0, nHB: 0, nHS: 1, xrRed: false },
  { code: "A-4XB-HS", opis: "2 + 2 rear directional lights, side working lights", nXF: 0, nXB: 4, nHF: 0, nHB: 0, nHS: 1, xrRed: false },
  { code: "A-8XB-HS", opis: "4 + 4 rear directional lights, side working lights", nXF: 0, nXB: 8, nHF: 0, nHB: 0, nHS: 1, xrRed: false },
  { code: "A-2XF-2XB-HS", opis: "1 + 1 front directional light, 1 + 1 rear direct. light, side working lights", nXF: 2, nXB: 2, nHF: 0, nHB: 0, nHS: 1, xrRed: false },
  { code: "A-4XF-4XB-HS", opis: "2 + 2 front direct. lights, 2 + 2 rear direct. lights, side working lights", nXF: 4, nXB: 4, nHF: 0, nHB: 0, nHS: 1, xrRed: false },
  { code: "A-6XF-2XB-HS", opis: "3 + 3 front direct. lights, 1 + 1 rear direct. light, side working lights", nXF: 6, nXB: 2, nHF: 0, nHB: 0, nHS: 1, xrRed: false },
  { code: "A-2XF-6XB-HS", opis: "1 + 1 front directional light, 3 + 3 rear direct. lights, side working lights", nXF: 2, nXB: 6, nHF: 0, nHB: 0, nHS: 1, xrRed: false },
  { code: "A-4XF-HF-HB", opis: "2 + 2 front directional lights, front and rear working lights", nXF: 4, nXB: 0, nHF: 1, nHB: 1, nHS: 0, xrRed: false },
  { code: "A-8XF-HF-HB", opis: "4 + 4 front directional lights, front and rear working lights", nXF: 8, nXB: 0, nHF: 1, nHB: 1, nHS: 0, xrRed: false },
  { code: "A-2XF-2XB-HF-HB", opis: "1 + 1 front directional light, 1 + 1 rear direct. light, front and rear working lights", nXF: 2, nXB: 2, nHF: 1, nHB: 1, nHS: 0, xrRed: false },
  { code: "A-4XF-4XB-HF-HB", opis: "2 + 2 front direct. lights, 2 + 2 rear direct. lights, front and rear working lights", nXF: 4, nXB: 4, nHF: 1, nHB: 1, nHS: 0, xrRed: false },
  { code: "A-6XF-2XB-HF-HB", opis: "3 + 3 front direct. lights, 1 + 1 rear direct. light, front and rear working lights", nXF: 6, nXB: 2, nHF: 1, nHB: 1, nHS: 0, xrRed: false },
  // Lp. 43-47 w PDF: kod skorygowany o brakujące "-HS" (patrz komentarz na górze pliku).
  { code: "A-4XF-HF-HS", opis: "2 + 2 front directional lights, front and side working lights", nXF: 4, nXB: 0, nHF: 1, nHB: 0, nHS: 1, xrRed: false },
  { code: "A-8XF-HF-HS", opis: "4 + 4 front directional lights, front and side working lights", nXF: 8, nXB: 0, nHF: 1, nHB: 0, nHS: 1, xrRed: false },
  { code: "A-2XF-2XB-HF-HS", opis: "1 + 1 front directional light, 1 + 1 rear direct. light, front and side working lights", nXF: 2, nXB: 2, nHF: 1, nHB: 0, nHS: 1, xrRed: false },
  { code: "A-4XF-4XB-HF-HS", opis: "2 + 2 front direct. lights, 2 + 2 rear direct. lights, front and side working lights", nXF: 4, nXB: 4, nHF: 1, nHB: 0, nHS: 1, xrRed: false },
  { code: "A-6XF-2XB-HF-HS", opis: "3 + 3 front direct. lights, 1 + 1 rear direct. light, front and side working lights", nXF: 6, nXB: 2, nHF: 1, nHB: 0, nHS: 1, xrRed: false },
  { code: "A-4XF-HB-HS", opis: "2 + 2 front directional lights, rear and side working lights", nXF: 4, nXB: 0, nHF: 0, nHB: 1, nHS: 1, xrRed: false },
  { code: "A-8XF-HB-HS", opis: "4 + 4 front directional lights, rear and side working lights", nXF: 8, nXB: 0, nHF: 0, nHB: 1, nHS: 1, xrRed: false },
  { code: "A-2XF-2XB-HB-HS", opis: "1 + 1 front directional light, 1 + 1 rear direct. light, rear and side working lights", nXF: 2, nXB: 2, nHF: 0, nHB: 1, nHS: 1, xrRed: false },
  { code: "A-4XF-4XB-HB-HS", opis: "2 + 2 front direct. lights, 2 + 2 rear direct. lights, rear and side working lights", nXF: 4, nXB: 4, nHF: 0, nHB: 1, nHS: 1, xrRed: false },
  { code: "A-6XF-2XB-HB-HS", opis: "3 + 3 front direct. lights, 1 + 1 rear direct. light, rear and side working lights", nXF: 6, nXB: 2, nHF: 0, nHB: 1, nHS: 1, xrRed: false },
  { code: "A-4XF-HF-HB-HS", opis: "2 + 2 front directional lights, front, rear and side working lights", nXF: 4, nXB: 0, nHF: 1, nHB: 1, nHS: 1, xrRed: false },
  { code: "A-2XF-2XB-HF-HB-HS", opis: "1 + 1 front direct. light, 1 + 1 rear direct. light, front, rear and side working lights", nXF: 2, nXB: 2, nHF: 1, nHB: 1, nHS: 1, xrRed: false },
];

const wariantyR: WariantSeed[] = [
  { code: "R", opis: "base variant - left and right light T category only", nXF: 0, nXB: 0, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "R-4XF", opis: "2 + 2 front directional lights", nXF: 4, nXB: 0, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "R-8XF", opis: "4 + 4 front directional lights", nXF: 8, nXB: 0, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "R-12XF", opis: "6 + 6 front directional lights", nXF: 12, nXB: 0, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "R-4XB", opis: "2 + 2 rear directional lights", nXF: 0, nXB: 4, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "R-8XB", opis: "4 + 4 rear directional lights", nXF: 0, nXB: 8, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "R-12XB", opis: "6 + 6 rear directional lights", nXF: 0, nXB: 12, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "R-2XF-2XB", opis: "1 + 1 front directional light, 1 + 1 rear directional light", nXF: 2, nXB: 2, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "R-4XF-4XB", opis: "2 + 2 front directional lights, 2 + 2 rear directional lights", nXF: 4, nXB: 4, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "R-6XF-6XB", opis: "3 + 3 front directional lights, 3 + 3 rear directional lights", nXF: 6, nXB: 6, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "R-6XF-2XB", opis: "3 + 3 front directional lights, 1 + 1 rear directional light", nXF: 6, nXB: 2, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "R-10XF-2XB", opis: "5 + 5 front directional lights, 1 + 1 rear directional light", nXF: 10, nXB: 2, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "R-8XF-4XB", opis: "4 + 4 front directional lights, 2 + 2 rear directional lights", nXF: 8, nXB: 4, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "R-2XF-6XB", opis: "1 + 1 front directional light, 3 + 3 rear directional lights", nXF: 2, nXB: 6, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "R-2XF-10XB", opis: "1 + 1 front directional light, 5 + 5 rear directional lights", nXF: 2, nXB: 10, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "R-4XF-8XB", opis: "2 + 2 front directional lights, 4 + 4 rear directional lights", nXF: 4, nXB: 8, nHF: 0, nHB: 0, nHS: 0, xrRed: false },
  { code: "R-4XF-HF", opis: "2 + 2 front directional lights, front working lights", nXF: 4, nXB: 0, nHF: 1, nHB: 0, nHS: 0, xrRed: false },
  { code: "R-8XF-HF", opis: "4 + 4 front directional lights, front working lights", nXF: 8, nXB: 0, nHF: 1, nHB: 0, nHS: 0, xrRed: false },
  { code: "R-2XF-2XB-HF", opis: "1 + 1 front directional light, 1 + 1 rear direct. light, front working lights", nXF: 2, nXB: 2, nHF: 1, nHB: 0, nHS: 0, xrRed: false },
  { code: "R-4XF-4XB-HF", opis: "2 + 2 front direct. lights, 2 + 2 rear direct. lights, front working lights", nXF: 4, nXB: 4, nHF: 1, nHB: 0, nHS: 0, xrRed: false },
  { code: "R-6XF-2XB-HF", opis: "3 + 3 front direct. lights, 1 + 1 rear direct. light, front working lights", nXF: 6, nXB: 2, nHF: 1, nHB: 0, nHS: 0, xrRed: false },
  { code: "R-4XF-HB", opis: "2 + 2 front directional lights, rear working lights", nXF: 4, nXB: 0, nHF: 0, nHB: 1, nHS: 0, xrRed: false },
  { code: "R-8XF-HB", opis: "4 + 4 front directional lights, rear working lights", nXF: 8, nXB: 0, nHF: 0, nHB: 1, nHS: 0, xrRed: false },
  { code: "R-4XB-HB", opis: "2 + 2 rear directional lights, rear working lights", nXF: 0, nXB: 4, nHF: 0, nHB: 1, nHS: 0, xrRed: false },
  { code: "R-8XB-HB", opis: "4 + 4 rear directional lights, rear working lights", nXF: 0, nXB: 8, nHF: 0, nHB: 1, nHS: 0, xrRed: false },
  { code: "R-2XF-2XB-HB", opis: "1 + 1 front directional light, 1 + 1 rear direct. light, rear working lights", nXF: 2, nXB: 2, nHF: 0, nHB: 1, nHS: 0, xrRed: false },
  { code: "R-4XF-4XB-HB", opis: "2 + 2 front direct. lights, 2 + 2 rear direct. lights, rear working lights", nXF: 4, nXB: 4, nHF: 0, nHB: 1, nHS: 0, xrRed: false },
  { code: "R-6XF-2XB-HB", opis: "3 + 3 front direct. lights, 1 + 1 rear direct. light, rear working lights", nXF: 6, nXB: 2, nHF: 0, nHB: 1, nHS: 0, xrRed: false },
  { code: "R-2XF-6XB-HB", opis: "1 + 1 front directional light, 3 + 3 rear direct. lights, rear working lights", nXF: 2, nXB: 6, nHF: 0, nHB: 1, nHS: 0, xrRed: false },
  { code: "R-4XF-HS", opis: "2 + 2 front directional lights, side working lights", nXF: 4, nXB: 0, nHF: 0, nHB: 0, nHS: 1, xrRed: false },
  { code: "R-8XF-HS", opis: "4 + 4 front directional lights, side working lights", nXF: 8, nXB: 0, nHF: 0, nHB: 0, nHS: 1, xrRed: false },
  { code: "R-4XB-HS", opis: "2 + 2 rear directional lights, side working lights", nXF: 0, nXB: 4, nHF: 0, nHB: 0, nHS: 1, xrRed: false },
  { code: "R-8XB-HS", opis: "4 + 4 rear directional lights, side working lights", nXF: 0, nXB: 8, nHF: 0, nHB: 0, nHS: 1, xrRed: false },
  { code: "R-2XF-2XB-HS", opis: "1 + 1 front directional light, 1 + 1 rear direct. light, side working lights", nXF: 2, nXB: 2, nHF: 0, nHB: 0, nHS: 1, xrRed: false },
  { code: "R-4XF-4XB-HS", opis: "2 + 2 front direct. lights, 2 + 2 rear direct. lights, side working lights", nXF: 4, nXB: 4, nHF: 0, nHB: 0, nHS: 1, xrRed: false },
  { code: "R-6XF-2XB-HS", opis: "3 + 3 front direct. lights, 1 + 1 rear direct. light, side working lights", nXF: 6, nXB: 2, nHF: 0, nHB: 0, nHS: 1, xrRed: false },
  { code: "R-2XF-6XB-HS", opis: "1 + 1 front directional light, 3 + 3 rear direct. lights, side working lights", nXF: 2, nXB: 6, nHF: 0, nHB: 0, nHS: 1, xrRed: false },
  { code: "R-4XF-HF-HB", opis: "2 + 2 front directional lights, front and rear working lights", nXF: 4, nXB: 0, nHF: 1, nHB: 1, nHS: 0, xrRed: false },
  { code: "R-8XF-HF-HB", opis: "4 + 4 front directional lights, front and rear working lights", nXF: 8, nXB: 0, nHF: 1, nHB: 1, nHS: 0, xrRed: false },
  { code: "R-2XF-2XB-HF-HB", opis: "1 + 1 front directional light, 1 + 1 rear direct. light, front and rear working lights", nXF: 2, nXB: 2, nHF: 1, nHB: 1, nHS: 0, xrRed: false },
  { code: "R-4XF-4XB-HF-HB", opis: "2 + 2 front direct. lights, 2 + 2 rear direct. lights, front and rear working lights", nXF: 4, nXB: 4, nHF: 1, nHB: 1, nHS: 0, xrRed: false },
  { code: "R-6XF-2XB-HF-HB", opis: "3 + 3 front direct. lights, 1 + 1 rear direct. light, front and rear working lights", nXF: 6, nXB: 2, nHF: 1, nHB: 1, nHS: 0, xrRed: false },
  // Lp. 43-47 w PDF: kod skorygowany o brakujące "-HS" (patrz komentarz na górze pliku).
  { code: "R-4XF-HF-HS", opis: "2 + 2 front directional lights, front and side working lights", nXF: 4, nXB: 0, nHF: 1, nHB: 0, nHS: 1, xrRed: false },
  { code: "R-8XF-HF-HS", opis: "4 + 4 front directional lights, front and side working lights", nXF: 8, nXB: 0, nHF: 1, nHB: 0, nHS: 1, xrRed: false },
  { code: "R-2XF-2XB-HF-HS", opis: "1 + 1 front directional light, 1 + 1 rear direct. light, front and side working lights", nXF: 2, nXB: 2, nHF: 1, nHB: 0, nHS: 1, xrRed: false },
  { code: "R-4XF-4XB-HF-HS", opis: "2 + 2 front direct. lights, 2 + 2 rear direct. lights, front and side working lights", nXF: 4, nXB: 4, nHF: 1, nHB: 0, nHS: 1, xrRed: false },
  { code: "R-6XF-2XB-HF-HS", opis: "3 + 3 front direct. lights, 1 + 1 rear direct. light, front and side working lights", nXF: 6, nXB: 2, nHF: 1, nHB: 0, nHS: 1, xrRed: false },
  { code: "R-4XF-HB-HS", opis: "2 + 2 front directional lights, rear and side working lights", nXF: 4, nXB: 0, nHF: 0, nHB: 1, nHS: 1, xrRed: false },
  { code: "R-8XF-HB-HS", opis: "4 + 4 front directional lights, rear and side working lights", nXF: 8, nXB: 0, nHF: 0, nHB: 1, nHS: 1, xrRed: false },
  { code: "R-2XF-2XB-HB-HS", opis: "1 + 1 front directional light, 1 + 1 rear direct. light, rear and side working lights", nXF: 2, nXB: 2, nHF: 0, nHB: 1, nHS: 1, xrRed: false },
  { code: "R-4XF-4XB-HB-HS", opis: "2 + 2 front direct. lights, 2 + 2 rear direct. lights, rear and side working lights", nXF: 4, nXB: 4, nHF: 0, nHB: 1, nHS: 1, xrRed: false },
  { code: "R-6XF-2XB-HB-HS", opis: "3 + 3 front direct. lights, 1 + 1 rear direct. light, rear and side working lights", nXF: 6, nXB: 2, nHF: 0, nHB: 1, nHS: 1, xrRed: false },
  { code: "R-4XF-HF-HB-HS", opis: "2 + 2 front directional lights, front, rear and side working lights", nXF: 4, nXB: 0, nHF: 1, nHB: 1, nHS: 1, xrRed: false },
  { code: "R-2XF-2XB-HF-HB-HS", opis: "1 + 1 front direct. light, 1 + 1 rear direct. light, front, rear and side working lights", nXF: 2, nXB: 2, nHF: 1, nHB: 1, nHS: 1, xrRed: false },
];

const grupy: { color: Color; warianty: WariantSeed[] }[] = [
  { color: Color.B, warianty: wariantyB },
  { color: Color.A, warianty: wariantyA },
  { color: Color.R, warianty: wariantyR },
];

async function main() {
  for (const grupa of grupy) {
    for (const wariant of grupa.warianty) {
      await prisma.wariantOrion.upsert({
        where: { code: wariant.code },
        update: { ...wariant, color: grupa.color },
        create: { ...wariant, color: grupa.color, nT2: 4 },
      });
    }
    console.log(`Zaseedowano ${grupa.warianty.length} wariantów ORION (barwa ${grupa.color}).`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
