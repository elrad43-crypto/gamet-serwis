import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dołącz fonty TTF do bundle'a funkcji cron (potrzebne do PDF z polskimi znakami)
  outputFileTracingIncludes: {
    '/api/cron/monthly-report': ['./fonts/**/*'],
  },
};

export default nextConfig;
