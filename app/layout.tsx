import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Placement Dashboard",
  description: "Placement Dashboard Automation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body className="bg-white text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-white">
        {children}
      </body>
    </html>
  );
}