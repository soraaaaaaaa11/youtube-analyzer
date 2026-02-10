import { Suspense } from "react";
import { Trophy, Loader2 } from "lucide-react";
import RankingsContent from "./RankingsContent";

export const metadata = {
  title: "ランキング | YouTube分析ツール",
  description: "YouTubeチャンネルの登録者数ランキング・急成長ランキング・急上昇動画をチェック。",
};

export default function RankingsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
          <Trophy className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            ランキング
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            注目のYouTubeチャンネルをチェック
          </p>
        </div>
      </div>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-red-500 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">ランキングを取得中...</p>
          </div>
        }
      >
        <RankingsContent />
      </Suspense>
    </div>
  );
}
