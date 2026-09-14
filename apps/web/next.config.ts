import type { NextConfig } from "next";

const fileBaseUrl = process.env.NEXT_PUBLIC_FILE_BASE_URL ?? "http://localhost:4000";
const fileOrigin = fileBaseUrl.replace(/\/uploads\/?$/i, "").replace(/\/+$/, "");
const parsed = (() => { try { return new URL(fileOrigin); } catch { return new URL("http://localhost:4000"); } })();

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self)",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      // Project media may be served from the configured storage origin, a CDN,
      // or a legacy absolute URL. Restrict the broader allowance to images only.
      `img-src 'self' data: blob: https: ${parsed.origin}`,
      "media-src 'self' https:",
      `connect-src 'self' ${parsed.origin}`,
      // The project detail page embeds a Google Maps location preview; with
      // no frame-src set this silently fell back to default-src 'self' and
      // the browser blocked the iframe outright (visible only as a CSP
      // console error, not a rendering error, so it went unnoticed).
      "frame-src https://www.google.com https://maps.google.com",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: parsed.protocol.replace(":", "") as "http" | "https",
        hostname: parsed.hostname,
        ...(parsed.port ? { port: parsed.port } : {}),
        pathname: "/uploads/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/(.*)\\.(jpg|jpeg|png|gif|ico|svg|webp|avif|woff|woff2|ttf|eot)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/(.*)\\.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/projects",
        destination: "/search",
        permanent: true,
      },
    ];
  },

  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
