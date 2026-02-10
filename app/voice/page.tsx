import { MessageSquare } from "lucide-react";
import VoiceContent from "./VoiceContent";

export const metadata = {
  title: "みんなの声 | YouTube分析ツール",
  description: "機能リクエストや意見を投稿して、サービス改善に参加しましょう。",
};

export default function VoicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            みんなの声
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            機能リクエストや意見を投稿して、サービス改善に参加しよう
          </p>
        </div>
      </div>
      <VoiceContent />
    </div>
  );
}
