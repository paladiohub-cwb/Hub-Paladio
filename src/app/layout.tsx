import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montSans = Montserrat({
  variable: "--font-mont-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hub Paladio",
  description: "Hub Paladio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={`${montSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
