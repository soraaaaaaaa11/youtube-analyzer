import { Suspense } from "react";
import WatchlistContent from "./WatchlistContent";

export const metadata = {
  title: "ウォッチリスト | YouTube分析ツール",
};

export default function WatchlistPage() {
  return (
    <Suspense>
      <WatchlistContent />
    </Suspense>
  );
}
