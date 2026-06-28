"use client";

import Sidebar from "./Sidebar";
import Header from "./Header";
import useAuth from "../../hooks/useAuth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute h-12 w-12 animate-ping rounded-full bg-indigo-500/10" />
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500/20 border-t-indigo-600" />
        </div>
        <p className="mt-4 text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse">
          Loading Console Configuration...
        </p>
      </div>
    );
  }

  // Fallback route protection if accessed before middleware redirect completes
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      {/* 1. Sidebar Navigation */}
      <Sidebar />

      {/* 2. Page Content Column */}
      <div className="pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <Header />
        
        {/* Main Content Area Container */}
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
