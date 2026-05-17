import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";


import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Grind - AI Productivity & Streak Tracker",
  description: "A highly motivating productivity and streak tracking application designed to make consistency feel rewarding.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground antialiased selection:bg-neon-purple/30`}>
        <Providers>
          <div className="flex min-h-screen">
            <div className="flex-1">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
