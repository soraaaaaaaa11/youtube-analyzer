import SearchForm from "@/components/SearchForm";
import { Search } from "lucide-react";

export const metadata = {
  title: "チャンネル検索 | YouTube分析ツール",
};

export default function SearchPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
          <Search className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">チャンネル検索</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">条件を設定して、急成長チャンネルを見つけよう</p>
        </div>
      </div>

      <SearchForm />
    </div>
  );
}
