import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "RoomSurf",
    short_name: "RoomSurf",
    description:
      "Public-first chat for discoverable conversations. Browse live rooms, find active communities, and join realtime discussions.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0f172a",
    theme_color: "#0e7490",
    lang: "en-US",
    categories: ["social", "communication"],
    icons: [
      {
        src: "/roomsurf-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/roomsurf-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/roomsurf-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
