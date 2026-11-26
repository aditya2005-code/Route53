"use client";

import { useEffect, useState } from "react";
import troubleshootService from "../../services/troubleshoot.service";
import hostedZoneService from "../../services/hostedZone.service";
import { HostedZone } from "../../types/hostedZone";
import { TroubleshootResponse, Severity } from "../../types/troubleshoot";
import {
  Bot,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Info,
  ShieldAlert,
  Send,
  RefreshCw,
  Database,
} from "lucide-react";

export default function TroubleshootPage() {
  const [zones, setZones] = useState<HostedZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<number | "">("");
  const [query, setQuery] = useState<string>("");
  const [recordName, setRecordName] = useState<string>("");
  const [recordType, setRecordType] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TroubleshootResponse | null>(null);

  useEffect(() => {
    async function loadZones() {
      try {
        const res = await hostedZoneService.getHostedZones("", 1, 100);
        setZones(res.items);
        if (res.items.length > 0) {
          setSelectedZoneId(res.items[0].id);
        }
      } catch {
        // Handled silently, zone is optional context
      }
    }
    loadZones();
  }, []);

  const handleQuickPrompt = (prompt: string, recType?: string) => {
    setQuery(prompt);
    if (recType) setRecordType(recType);
  };

  const handleTroubleshoot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await troubleshootService.diagnose({
        query: query.trim(),
        zone_id: selectedZoneId ? Number(selectedZoneId) : undefined,
        record_name: recordName.trim() || undefined,
        record_type: recordType || undefined,
      });

      setResult(response);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to run DNS diagnosis.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity: Severity) => {
    switch (severity) {
      case "high":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <AlertCircle className="h-3.5 w-3.5" /> High Severity
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <AlertTriangle className="h-3.5 w-3.5" /> Medium Severity
          </span>
        );
      case "low":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" /> Low / Advisory
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
                AI DNS Troubleshooter
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 uppercase tracking-widest">
                GPT-4o Diagnostic
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-3xl">
              Describe DNS connectivity, resolution, or delivery issues in natural language. Our system inspects your actual authoritative database configuration to identify the root cause and provide step-by-step resolution actions.
            </p>
          </div>
        </div>
      </div>

      {/* Input Form Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <form onSubmit={handleTroubleshoot} className="space-y-5">
          {/* Quick Issue Preset Buttons */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Common Issue Presets
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  handleQuickPrompt(
                    "My domain is returning NXDOMAIN and website is not resolving",
                    "A"
                  )
                }
                className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:border-indigo-500 text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                Website shows NXDOMAIN
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickPrompt(
                    "My CNAME record is not resolving to the canonical target",
                    "CNAME"
                  )
                }
                className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:border-indigo-500 text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                CNAME alias not resolving
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickPrompt(
                    "Inbound emails are bouncing with mail server rejection or missing SPF/MX",
                    "MX"
                  )
                }
                className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:border-indigo-500 text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                MX / Email delivery failure
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickPrompt(
                    "Recent DNS changes are not propagating across upstream resolvers and local cache",
                    ""
                  )
                }
                className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:border-indigo-500 text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                Propagation / TTL delay
              </button>
            </div>
          </div>

          {/* Context Selectors */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Target Hosted Zone
              </label>
              <select
                value={selectedZoneId}
                onChange={(e) =>
                  setSelectedZoneId(e.target.value ? Number(e.target.value) : "")
                }
                className="w-full text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">No specific zone (Global query)</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.domain_name} ({z.record_count ?? 0} records)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Specific Record Name (Optional)
              </label>
              <input
                type="text"
                value={recordName}
                onChange={(e) => setRecordName(e.target.value)}
                placeholder="e.g. www, @, mail"
                className="w-full text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Record Type (Optional)
              </label>
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                className="w-full text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Any Type</option>
                {["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SRV", "CAA", "PTR"].map(
                  (t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* Natural Language Query Textarea */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Describe your DNS issue or symptoms
            </label>
            <textarea
              required
              rows={3}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. My domain myapp.com is not resolving for users in some regions, or dig returns NXDOMAIN..."
              className="w-full text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-3.5 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-zinc-400 flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5" />
              Queries are grounded in your verified database records
            </span>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Diagnosing DNS Issue...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Analyze DNS Configuration
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div className="flex-1 text-xs">{error}</div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900 space-y-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-6 w-28 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-6 w-48 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div className="h-4 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-4 w-3/4 rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-24 w-full rounded-xl bg-zinc-100 dark:bg-zinc-800 mt-4" />
        </div>
      )}

      {/* Diagnostic Result Presentation */}
      {result && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
          {/* Top Result Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              {getSeverityBadge(result.severity)}
              <span className="text-xs text-zinc-400 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Grounded Analysis
              </span>
            </div>
            {result.requires_manual_verification && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-md">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                Manual Verification Required
              </span>
            )}
          </div>

          {/* Identified Problem */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Identified Problem
            </h2>
            <div className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50">
              {result.problem}
            </div>
          </div>

          {/* Technical Analysis */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 p-4">
            <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 mb-2">
              <Info className="h-4 w-4 text-indigo-500" /> Technical RFC &amp; Architectural Analysis
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
              {result.analysis}
            </p>
          </div>

          {/* Two Column Grid: Causes & Recommended Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Potential Causes */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 bg-white dark:bg-zinc-900">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400 mb-3 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> Potential Causes
              </h3>
              <ul className="space-y-2.5">
                {result.possible_causes.map((cause, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2.5 leading-relaxed"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                    <span>{cause}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Actions */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 bg-white dark:bg-zinc-900">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Actionable Resolution Steps
              </h3>
              <ol className="space-y-2.5">
                {result.recommended_actions.map((act, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2.5 leading-relaxed"
                  >
                    <span className="h-4 w-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{act}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Verified Zone Facts Used */}
          {result.zone_context && (
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <details className="text-xs text-zinc-500 cursor-pointer">
                <summary className="font-semibold text-zinc-700 dark:text-zinc-300 hover:text-indigo-500 transition-colors">
                  View Verified Database Configuration Facts ({result.zone_context.domain_name} — {result.zone_context.total_records} records)
                </summary>
                <div className="mt-3 p-3 rounded-lg bg-zinc-900 text-zinc-300 font-mono text-[11px] overflow-x-auto max-h-48">
                  <pre>{JSON.stringify(result.zone_context, null, 2)}</pre>
                </div>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
