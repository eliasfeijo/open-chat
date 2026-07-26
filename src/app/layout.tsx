import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { appConfig } from "@/shared/config/app-config";
import { Providers } from "./providers";
import "./globals.css";

function resolveMetadataBase(): URL | undefined {
  const configuredUrl = process.env.BETTER_AUTH_URL;

  if (!configuredUrl) {
    return undefined;
  }

  try {
    return new URL(configuredUrl);
  } catch {
    return undefined;
  }
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  title: {
    default: "RoomSurf: Public-first Chat for Discoverable Conversations",
    template: `%s | ${appConfig.name}`,
  },
  description: appConfig.description,
  keywords: [...appConfig.seoKeywords],
  manifest: "/manifest.webmanifest",
  applicationName: appConfig.name,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: appConfig.name,
  },
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  icons: {
    icon: [
      {
        sizes: "32x32",
        type: "image/png",
        url: "/openchat-icon-32.png",
      },
      {
        sizes: "192x192",
        type: "image/png",
        url: "/openchat-icon-192.png",
      },
      {
        type: "image/svg+xml",
        url: "/openchat-icon.svg",
      },
    ],
    shortcut: ["/openchat-icon-32.png"],
    apple: [
      {
        sizes: "180x180",
        type: "image/png",
        url: "/openchat-icon-180.png",
      },
    ],
  },
  openGraph: {
    description: appConfig.description,
    images: [
      {
        alt: "RoomSurf social preview",
        height: 630,
        url: "/opengraph-image",
        width: 1200,
      },
    ],
    locale: "en_US",
    siteName: appConfig.name,
    title: "RoomSurf: Public-first Chat for Discoverable Conversations",
    type: "website",
    url: appConfig.siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    description: appConfig.description,
    images: ["/opengraph-image"],
    title: "RoomSurf: Public-first Chat for Discoverable Conversations",
  },
};

export const viewport: Viewport = {
  themeColor: "#0e7490",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-(--color-page) text-(--color-foreground)">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
