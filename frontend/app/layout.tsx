import type { Metadata } from "next";
import { Almarai } from "next/font/google";
import "./globals.css";

const almarai = Almarai({
  subsets: ['arabic'],
  weight: ['300', '400', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "مؤسسة غزلان الخير",
  description: "مؤسسة غزلان الخير الإنسانية",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full">
      <body className={`${almarai.className} min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}