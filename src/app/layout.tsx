import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { seoConfig } from "@/lib/seo-config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: seoConfig.title,
  description: seoConfig.description,
  keywords: ['영어', '영어 학습', '단어', '사전', '발음', '예문'],
  authors: [{ name: 'English Learning Dictionary' }],
  metadataBase: new URL(seoConfig.url),
  openGraph: {
    ...seoConfig.openGraph,
    title: seoConfig.title.default,
    description: seoConfig.description,
    url: seoConfig.url,
  },
  twitter: {
    ...seoConfig.twitter,
    title: seoConfig.title.default,
    description: seoConfig.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
