"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthContext } from "../../context/AuthContext";
import dashboardService from "../../services/dashboard.service";
import { DashboardSummary } from "../../types/dashboard";
import {
  Globe,
  Layers,
  Bot,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Server,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuthContext();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const summary = await dashboardService.getSummary();
      setData(summary);
    } catch {
      setError("Failed to load dashboard metrics. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    dashboardService.getSummary()
      .then((summary) => {
        if (!ignore) {
          setData(summary);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setError("Failed to load dashboard metrics. Please check your connection.");
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800/60">
              AWS Route 53 Console
            </span>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              DNS Overview &amp; Control Center
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Authenticated session active for{" "}
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {user?.name || user?.email}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchSummary}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/60 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Link
              href="/hosted-zones"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm shadow-indigo-600/30 transition-all"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Manage Zones
            </Link>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchSummary}
            className="text-xs font-bold underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Hosted Zones */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Hosted Zones
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Globe size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
              {loading ? "..." : data?.total_zones ?? 0}
            </span>
            <span className="text-xs font-semibold text-zinc-500">
              Zones Configured
            </span>
          </div>
        </div>

        {/* Metric 2: Total Records */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              DNS Records
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Layers size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
              {loading ? "..." : data?.total_records ?? 0}
            </span>
            <span className="text-xs font-semibold text-zinc-500">
              Active Records
            </span>
          </div>
        </div>

        {/* Metric 3: AI Troubleshooter Status */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              AI Troubleshooter
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Bot size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
              Ready
            </span>
            <span className="text-xs font-semibold text-emerald-500">
              Diagnostic Engine
            </span>
          </div>
        </div>

        {/* Metric 4: Security */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Multi-Tenant Security
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
              Isolated
            </span>
            <span className="text-xs font-semibold text-zinc-500">
              JWT Protected
            </span>
          </div>
        </div>
      </div>

      {/* Record Distribution by Type */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4">
          DNS Record Distribution by Type
        </h2>
        {loading ? (
          <div className="h-16 flex items-center justify-center text-xs text-zinc-400">
            Loading distribution...
          </div>
        ) : Object.keys(data?.record_distribution || {}).length === 0 ? (
          <div className="text-xs text-zinc-400 py-4">
            No DNS records configured yet. Create a hosted zone and add records to see distribution.
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {Object.entries(data?.record_distribution || {}).map(([type, count]) => (
              <div
                key={type}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60"
              >
                <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  {type}
                </span>
                <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                  {count}
                </span>
                <span className="text-[11px] text-zinc-400">records</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Action Cards */}
      <div className="grid sm:grid-cols-3 gap-6">
        <Link
          href="/hosted-zones"
          className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 hover:border-indigo-500/50 transition-all"
        >
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Globe className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-base mb-1">
            Manage Hosted Zones
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed mb-4">
            Create domain zones, inspect authoritative records, and configure nameserver delegations.
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
            View Zones <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>

        <Link
          href="/troubleshoot"
          className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 hover:border-amber-500/50 transition-all"
        >
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Bot className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-base mb-1">
            AI DNS Troubleshooter
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed mb-4">
            Ask questions in plain English to diagnose resolution errors, CNAME issues, or MX delivery failure.
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
            Launch Diagnostic <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>

        <Link
          href="/traffic-policies"
          className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 hover:border-sky-500/50 transition-all"
        >
          <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Server className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-base mb-1">
            Traffic Routing Policies
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed mb-4">
            Configure weighted, failover, and latency-based routing policies for distributed services.
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 group-hover:translate-x-1 transition-transform">
            Explore Policies <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      </div>

      {/* Two Column Section: Recent Zones & Recent Records */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Hosted Zones */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Recently Created Zones
            </h2>
            <Link
              href="/hosted-zones"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800/40 animate-pulse" />
              ))}
            </div>
          ) : !data?.recent_zones || data.recent_zones.length === 0 ? (
            <div className="text-center py-8 text-xs text-zinc-400">
              No hosted zones created yet. Click &quot;Manage Zones&quot; to register your first domain.
            </div>
          ) : (
            <div className="space-y-2.5">
              {data.recent_zones.map((zone) => (
                <Link
                  key={zone.id}
                  href={`/hosted-zones/${zone.id}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Globe className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {zone.domain_name}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {zone.record_count ?? 0} record{(zone.record_count ?? 0) === 1 ? "" : "s"}
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recently Modified DNS Records */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Recently Modified Records
            </h2>
            <Link
              href="/hosted-zones"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Browse records
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800/40 animate-pulse" />
              ))}
            </div>
          ) : !data?.recent_records || data.recent_records.length === 0 ? (
            <div className="text-center py-8 text-xs text-zinc-400">
              No DNS records modified recently.
            </div>
          ) : (
            <div className="space-y-2.5">
              {data.recent_records.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400">
                      {rec.record_type}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                        {rec.record_name}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate max-w-[200px] sm:max-w-xs font-mono">
                        {rec.value}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400">TTL {rec.ttl}s</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
