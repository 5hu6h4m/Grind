import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

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
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 md:pl-64">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
