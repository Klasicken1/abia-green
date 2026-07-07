
import { Providers } from "./providers";
import type { Metadata, Viewport } from "next";
import { DM_Serif_Display, Inter, Space_Mono } from "next/font/google";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Abia Green",
  description: "Civic Intelligence Platform — Abia State",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Abia Green",
  },
  icons: {
    apple: "/apple-touch-icon.png",
    icon: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1A6B3C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${dmSerif.variable} ${inter.variable} ${spaceMono.variable}`}
    >
      <body className="bg-cream font-sans antialiased">
  <Providers>
    <div className="max-w-md mx-auto min-h-screen relative bg-cream">
      {children}
    </div>
  </Providers>
</body>
    </html>
  );
}