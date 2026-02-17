import type { Metadata } from "next";
import { Inter, Sarabun } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["thai", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "CPES — Classroom Project Evaluation System",
  description: "ระบบประเมินโปรเจคในชั้นเรียน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${inter.variable} ${sarabun.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
