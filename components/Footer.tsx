import Link from "next/link";
import { Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <Youtube className="w-7 h-7 text-red-500" />
              <span className="text-white">
                YouTube<span className="text-red-500">分析</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              急成長YouTubeチャンネルを一瞬で発見。
              <br />
              柔軟な条件検索で、あなたの次のビジネスチャンスを見つけよう。
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">サービス</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/search" className="hover:text-white transition-colors">
                  チャンネル検索
                </Link>
              </li>
              <li>
                <Link href="/watchlist" className="hover:text-white transition-colors">
                  ウォッチリスト
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  料金プラン
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">アカウント</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/signup" className="hover:text-white transition-colors">
                  無料で始める
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  ログイン
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>© 2026 YouTube分析ツール. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
