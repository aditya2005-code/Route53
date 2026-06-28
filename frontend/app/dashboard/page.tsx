"use client";

import { useAuthContext } from "../../context/AuthContext";
import { Globe, ShieldCheck, Activity, Award } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuthContext();

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Award size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Welcome to the DNS Management Console
            </h2>
            <p className="text-sm text-zinc-500">
              Authorized session active for: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{user?.email}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Hosted Zones
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Globe size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
              --
            </span>
            <span className="text-xs font-semibold text-zinc-400">
              Zones Configured
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Global Health checks
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Activity size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
              100%
            </span>
            <span className="text-xs font-semibold text-emerald-500">
              Optimal
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Security Status
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
              Secure
            </span>
            <span className="text-xs font-semibold text-zinc-400">
              SSL / Encrypted
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
