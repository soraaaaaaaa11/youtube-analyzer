"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Youtube,
  LogOut,
  User,
  Search,
  Bookmark,
  Crown,
  MessageSquare,
  Trophy,
  TrendingUp,
  Users,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  children?: { href: string; label: string; icon: React.ElementType }[];
}

const NAV_ITEMS: NavItem[] = [
  { href: "/search", label: "チャンネル検索", icon: Search },
  {
    href: "/rankings",
    label: "ランキング",
    icon: Trophy,
    children: [
      { href: "/rankings?tab=subscribers", label: "登録者数ランキング", icon: Users },
      { href: "/rankings?tab=growth", label: "急成長ランキング", icon: TrendingUp },
    ],
  },
  { href: "/watchlist", label: "ウォッチリスト", icon: Bookmark },
  { href: "/pricing", label: "料金プラン", icon: Crown },
  { href: "/feedback", label: "みんなの声", icon: MessageSquare },
];

export default function Header() {
  const { user, loading, signOut, userProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    await signOut();
    router.push("/");
    setIsMenuOpen(false);
  }

  function isActive(href: string) {
    if (href === "/rankings") return pathname.startsWith("/rankings");
    return pathname === href;
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl group">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Youtube className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-900 dark:text-white hidden sm:inline">
              YouTube<span className="text-red-500">分析</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1" ref={dropdownRef}>
            {NAV_ITEMS.map((item) => (
              <div key={item.href} className="relative">
                {item.children ? (
                  <>
                    <button
                      onClick={() =>
                        setOpenDropdown(openDropdown === item.href ? null : item.href)
                      }
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive(item.href)
                          ? "text-red-500 bg-red-50 dark:bg-red-950/30"
                          : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${
                          openDropdown === item.href ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openDropdown === item.href && (
                      <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl py-2 z-50">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setOpenDropdown(null)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-red-500 transition-colors"
                          >
                            <child.icon className="w-4 h-4" />
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive(item.href)
                        ? "text-red-500 bg-red-50 dark:bg-red-950/30"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden lg:flex items-center gap-3">
            {loading ? (
              <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/account"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-7 h-7 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-red-500" />
                  </div>
                  <span className="max-w-[100px] truncate font-medium">
                    {userProfile?.nickname || user.email?.split("@")[0]}
                  </span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="ログアウト"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  ログイン
                </Link>
                <Link
                  href="/signup"
                  className="relative px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all hover:shadow-lg hover:shadow-red-500/25 overflow-hidden group"
                >
                  <span className="relative z-10">無料で始める</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {NAV_ITEMS.map((item) => (
              <div key={item.href}>
                {item.children ? (
                  <>
                    <Link
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? "text-red-500 bg-red-50 dark:bg-red-950/30"
                          : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                    <div className="ml-7 border-l-2 border-gray-100 dark:border-gray-800 pl-3 space-y-1 my-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <child.icon className="w-3.5 h-3.5" />
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "text-red-500 bg-red-50 dark:bg-red-950/30"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
            <hr className="border-gray-200 dark:border-gray-700 my-2" />
            {user ? (
              <>
                <Link
                  href="/account"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-red-500" />
                  </div>
                  {userProfile?.nickname || user.email?.split("@")[0]}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  ログアウト
                </button>
              </>
            ) : (
              <div className="flex gap-2 px-3 py-2">
                <Link
                  href="/login"
                  className="flex-1 text-center py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ログイン
                </Link>
                <Link
                  href="/signup"
                  className="flex-1 text-center py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  無料で始める
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
