"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AlertTriangle } from "lucide-react";

export default function TrialBanner() {
  const { userProfile, isTrialExpired } = useAuth();

  if (!userProfile || userProfile.plan !== "free") return null;
  if (!userProfile.trialEndsAt) return null;

  const daysLeft = Math.ceil(
    (new Date(userProfile.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (isTrialExpired) {
    return (
      <div className="bg-red-500 text-white text-center py-2 px-4 text-sm">
        <AlertTriangle className="w-4 h-4 inline mr-1" />
        無料トライアルが終了しました。
        <Link href="/pricing" className="underline font-semibold ml-1">
          プランをアップグレード
        </Link>
      </div>
    );
  }

  if (daysLeft <= 3) {
    return (
      <div className="bg-yellow-500 text-white text-center py-2 px-4 text-sm">
        無料トライアル残り{daysLeft}日。
        <Link href="/pricing" className="underline font-semibold ml-1">
          プランを選択
        </Link>
      </div>
    );
  }

  return null;
}
