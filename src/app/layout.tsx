import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Abia Green",
  description: "Civic Intelligence Platform — Abia State",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Abia Green",
  },
};

export const viewport: Viewport = {
  themeColor: "#1A6B3C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-cream font-sans antialiased">
        <div className="max-w-md mx-auto min-h-screen relative bg-cream">
          {children}
        </div>
      </body>
    </html>
  );
}