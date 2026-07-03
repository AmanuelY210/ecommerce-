import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/providers/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ETMarket — Ethiopia's Marketplace",
  description: "Shop millions of products from trusted Ethiopian vendors. Pay with Chapa or your local bank. Fast delivery across Ethiopia.",
  keywords: ["Ethiopia marketplace", "Addis Ababa shopping", "Chapa payment", "Ethiopian e-commerce", "ETMarket"],
  authors: [{ name: "ETMarket Team" }],
  icons: { icon: "/logo.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}>
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster />
        <Sonner />
      </body>
    </html>
  );
}
