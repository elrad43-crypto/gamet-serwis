-- Numer SRW jest teraz wpisywany recznie przez admina (lib/validators/ticket.ts),
-- sekwencja nie jest juz uzywana (lib/ticket-number.ts usunieto).
DROP SEQUENCE IF EXISTS "ticket_number_seq";
