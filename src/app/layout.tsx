import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MeowthPayDay — An AI That Hustles on Solana",
  description:
    "Watch an autonomous AI cat agent trade on Solana in real-time. $20 in API credits. Survive or die trying.",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "MeowthPayDay — An AI That Hustles on Solana",
    description:
      "An autonomous AI agent turning API credits into real crypto profit. Watch it live.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
