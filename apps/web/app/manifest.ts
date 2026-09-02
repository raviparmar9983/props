import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VerifiedProps",
    short_name: "VerifiedProps",
    description:
      "Find homes and commercial spaces from verified builders only.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF9F6",
    theme_color: "#E85D2C",
    icons: [
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
