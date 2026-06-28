"use client";

import Sidebar from "./Sidebar";
import Header from "./Header";
import useAuth from "../../hooks/useAuth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#eaeded] text-[#111111] font-sans">
        <div className="flex flex-col items-center space-y-4">
          {/* Flat, standard border-spinner */}
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-[#0066cc]" />
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
            Loading AWS Console...
          </p>
        </div>
      </div>
    );
  }

  // Fallback route protection if accessed before middleware redirect completes
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#eaeded] text-[#111111] font-sans flex flex-col pt-16">
      {/* 1. Fixed Top Header */}
      <Header />

      {/* 2. Main Page Layout (Sidebar + Content Container) */}
      <div className="flex-1 flex">
        {/* Sidebar Nav */}
        <Sidebar />

        {/* Content Container (pl-56 offsets sidebar width) */}
        <main className="flex-1 pl-56 p-6 min-w-0">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
