"use client";

import { LogOut, Cloud, HelpCircle, User } from "lucide-react";
import useAuth from "../../hooks/useAuth";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 inset-x-0 z-30 flex h-16 w-full items-center justify-between bg-[#232f3e] px-6 text-white select-none">
      {/* Brand & Console Name */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#ff9900] text-white font-black text-sm shadow-sm">
          53
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-extrabold text-sm tracking-wider text-white">
            Amazon Route 53
          </span>
          <span className="text-[10px] text-zinc-400 font-semibold border-l border-zinc-700 pl-2">
            Console
          </span>
        </div>
      </div>

      {/* Right-Side Global Actions */}
      <div className="flex items-center gap-6">
        {/* Support & Health Indicator */}
        <div className="hidden items-center gap-4 text-zinc-300 md:flex">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-sm border border-emerald-800/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Global Service Status: Normal
          </div>
          <button className="text-zinc-400 hover:text-white transition-colors" title="Documentation">
            <HelpCircle size={16} />
          </button>
        </div>

        {/* User Badge & Sign Out Button */}
        {user && (
          <div className="flex items-center gap-4 border-l border-zinc-700 pl-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 text-xs font-bold border border-zinc-700">
                <User size={12} />
              </div>
              <span className="text-xs font-bold text-zinc-200" title={user.email}>
                {user.email.split("@")[0]}
              </span>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-sm bg-[#353f47] hover:bg-[#44505a] border border-[#54626f] px-3 py-1.5 text-xs font-semibold text-zinc-100 transition-colors cursor-pointer"
            >
              <LogOut size={12} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
