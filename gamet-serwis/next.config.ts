import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dołącz pliki metryczne pdfkit (AFM) — wymagane przez pdfkit na Vercelu
  outputFileTracingIncludes: {
    '/api/cron/monthly-report': ['./node_modules/pdfkit/js/data/**/*'],
  },
};

export default nextConfig;
