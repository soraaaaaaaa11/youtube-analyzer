import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrialBanner from "@/components/TrialBanner";
import { AuthProvider } from "@/context/AuthContext";
import { WatchlistProvider } from "@/context/WatchlistContext";

const GA_MEASUREMENT_ID = "G-HV84K1GDVB";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "YouTube分析ツール | 急成長チャンネルを発見",
  description: "急成長YouTubeチャンネルを一瞬で発見。柔軟な条件検索で、あなたの次のビジネスチャンスを見つけよう。",
  keywords: ["YouTube", "分析", "チャンネル検索", "急成長", "トレンド", "YouTuber", "リサーチ"],
  authors: [{ name: "YouTube分析ツール" }],
  openGraph: {
    title: "YouTube分析ツール | 急成長チャンネルを発見",
    description: "急成長YouTubeチャンネルを一瞬で発見。柔軟な条件検索で、あなたの次のビジネスチャンスを見つけよう。",
    url: "https://youtube-analyzer-pied.vercel.app",
    siteName: "YouTube分析ツール",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube分析ツール | 急成長チャンネルを発見",
    description: "急成長YouTubeチャンネルを一瞬で発見。柔軟な条件検索で、あなたの次のビジネスチャンスを見つけよう。",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </head>
      <body className="font-sans antialiased bg-gray-50 dark:bg-gray-950 min-h-screen flex flex-col">
        <AuthProvider>
          <WatchlistProvider>
            <Header />
            <TrialBanner />
            <main className="flex-1">{children}</main>
            <Footer />
          </WatchlistProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
