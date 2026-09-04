import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/lib/theme";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PlacementHub — Beyond Placements",
  description:
    "A unified placement and career management platform connecting students, alumni, employers, and institutions.",
  keywords: [
    "placement",
    "campus recruitment",
    "career management",
    "job portal",
    "university",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <head>
      </head>
      <body className="min-h-full flex flex-col antialiased" style={{ fontFamily: "var(--font-sans)" }}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
