import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import AccountContent from "./AccountContent";

export const metadata = {
  title: "アカウント | YouTube分析ツール",
  description: "アカウント情報・プラン管理",
};

export default function AccountPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">アカウント</h1>
      <Suspense
        fallback={
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        }
      >
        <AccountContent />
      </Suspense>
    </div>
  );
}
