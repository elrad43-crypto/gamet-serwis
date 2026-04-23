import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  datasource: {
    url: process.env["DATABASE_URL"],
    directUrl: process.env["DATABASE_URL_DIRECT"],
  } as any,
});