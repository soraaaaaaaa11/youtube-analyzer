import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrialBanner from "@/components/TrialBanner";
import { AuthProvider } from "@/context/AuthContext";
import { WatchlistProvider } from "@/context/WatchlistContext";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "YouTube分析ツール | 急成長チャンネルを発見",
  description: "急成長YouTubeチャンネルを一瞬で発見。柔軟な条件検索で、あなたの次のビジネスチャンスを見つけよう。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className="font-sans antialiased bg-gray-50 dark:bg-gray-950 min-h-screen flex flex-col">
        <AuthProvider>
          <WatchlistProvider>
            <Header />
            <TrialBanner />
            <main className="flex-1">{children}</main>
            <Footer />
          </WatchlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
