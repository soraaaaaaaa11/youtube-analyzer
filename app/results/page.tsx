import { Suspense } from "react";
import ResultsContent from "./ResultsContent";

export const metadata = {
  title: "検索結果 | YouTube分析ツール",
};

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-500">読み込み中...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
