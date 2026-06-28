"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, ShieldAlert, Cloud, HelpCircle } from "lucide-react";
import useAuth from "../../hooks/useAuth";

export default function Header() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Helper to resolve the page title dynamically
  const getPageTitle = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return "Dashboard";
    
    const segment = segments[0];
    return segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-zinc-200/80 bg-white/80 px-8 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80">
      {/* Title / Breadcrumb */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {getPageTitle()}
        </h1>
        <span className="hidden rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-600 border border-emerald-200/50 sm:inline-flex items-center gap-1.5 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50">
          <Cloud size={10} className="animate-pulse" />
          Active
        </span>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-6">
        {/* Search Bar Placeholder */}
        <div className="relative hidden max-w-xs md:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search resources..."
            className="h-9 w-60 rounded-lg border border-zinc-200 bg-zinc-50/50 pl-10 pr-4 text-xs font-medium text-zinc-800 transition-all placeholder:text-zinc-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-200"
          />
        </div>

        {/* Notifications & Help Icons */}
        <div className="flex items-center gap-4 text-zinc-400 dark:text-zinc-500">
          <button className="rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
            <HelpCircle size={18} className="hover:text-zinc-700 dark:hover:text-zinc-300" />
          </button>
          <button className="relative rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
            <Bell size={18} className="hover:text-zinc-700 dark:hover:text-zinc-300" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500" />
          </button>
        </div>

        {/* User Badge */}
        {user && (
          <div className="flex items-center gap-2 border-l border-zinc-200 dark:border-zinc-800 pl-4">
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                {user.name || "Default User"}
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                Authorized
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
