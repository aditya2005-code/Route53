import Link from "next/link";
import {
  Globe,
  Bot,
  Zap,
  ArrowRight,
  Server,
  Layers,
  Sparkles,
  CheckCircle2,
  Terminal,
  ExternalLink,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-zinc-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0d1117]/85 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                Route 53
              </span>
              <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-widest">
                Cloud DNS
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#ai-troubleshooter" className="hover:text-white transition-colors">
              AI Troubleshooter
            </a>
            <a href="#record-types" className="hover:text-white transition-colors">
              Supported Records
            </a>
            <a href="#architecture" className="hover:text-white transition-colors">
              Architecture
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-semibold text-zinc-300 hover:text-white px-4 py-2 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 lg:pt-32 lg:pb-36">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(99,102,241,0.25),rgba(255,255,255,0))]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-8 animate-fade-in">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Next-Gen DNS Console + Autonomous AI Diagnostics</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.1] text-balance">
            Manage Cloud DNS with{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-amber-300 bg-clip-text text-transparent">
              Unrivaled Speed
            </span>{" "}
            and AI Intelligence
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Enterprise-grade Route 53 platform for hosted zones, full-spectrum RFC-compliant DNS records, and an autonomous AI DNS Troubleshooter that diagnoses resolution errors in seconds.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="h-12 px-8 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-xl shadow-indigo-500/25 flex items-center gap-2 transition-all"
            >
              Launch Free Console <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth/login"
              className="h-12 px-8 rounded-xl font-semibold border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 transition-colors flex items-center gap-2"
            >
              Sign In to Dashboard
            </Link>
          </div>

          {/* Interactive Metric Preview Banner */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="text-2xl font-black text-indigo-400">9 Types</div>
              <div className="text-xs text-zinc-400 mt-1">A, AAAA, CNAME, MX, TXT, NS, SRV, CAA, PTR</div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="text-2xl font-black text-emerald-400">&lt; 100ms</div>
              <div className="text-xs text-zinc-400 mt-1">High-throughput REST API Latency</div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="text-2xl font-black text-sky-400">GPT-4o</div>
              <div className="text-xs text-zinc-400 mt-1">AI-Powered Root Cause Diagnostics</div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="text-2xl font-black text-amber-400">100% Isolated</div>
              <div className="text-xs text-zinc-400 mt-1">Multi-Tenant JWT Security Model</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-24 border-t border-zinc-800/80 bg-zinc-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">
              Platform Capabilities
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
              Everything required to operate production DNS
            </h3>
            <p className="mt-4 text-zinc-400">
              Built following standard RFC DNS specifications, strong architectural boundaries, and strict multi-tenant authorization.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 hover:border-indigo-500/40 transition-all">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6">
                <Globe className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Hosted Zones</h4>
              <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                Create, list, inspect, and update authoritative public hosted zones with global domain format validation, instant TTL propagation, and cascading record deletion.
              </p>
              <ul className="space-y-2 text-xs text-zinc-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> RFC-1123 domain validation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Real-time record count tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Domain search and pagination
                </li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 hover:border-sky-500/40 transition-all">
              <div className="h-12 w-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-6">
                <Layers className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">DNS Record Suite</h4>
              <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                Full CRUD control across 9 standard DNS record types with automated IPv4/IPv6 validation, CNAME collision prevention, and MX priority enforcement.
              </p>
              <ul className="space-y-2 text-xs text-zinc-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Strict type-specific syntax guards
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> CNAME exclusivity rule enforcement
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Type filtering and label search
                </li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 hover:border-amber-500/40 transition-all">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-6">
                <Bot className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">AI Troubleshooter</h4>
              <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                Describe connectivity or propagation issues in plain English. The engine fetches actual zone records from the database and returns structured technical troubleshooting steps.
              </p>
              <ul className="space-y-2 text-xs text-zinc-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> OpenAI GPT-4o integration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Smart rule-based offline fallback
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Zero unauthorized auto-mutations
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* AI Troubleshooter Deep Dive */}
      <section id="ai-troubleshooter" className="py-24 border-t border-zinc-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
                <Bot className="h-4 w-4" /> Intelligent Cloud Assistant
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Stop guessing why DNS resolution fails. Let AI pinpoint the cause.
              </h2>
              <p className="mt-4 text-zinc-400 leading-relaxed">
                Whether diagnosing NXDOMAIN errors, CNAME alias loops, missing MX priorities, or SPF delivery rejections, the Route 53 AI Troubleshooter correlates your question with your real database configuration.
              </p>

              <div className="mt-6 space-y-3">
                <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 flex items-start gap-3">
                  <Terminal className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-zinc-200">Database-Grounded Context</div>
                    <div className="text-xs text-zinc-400">Retrieves verified database facts before generating prompts to eliminate hallucination.</div>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 flex items-start gap-3">
                  <Zap className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-zinc-200">Structured Response Contract</div>
                    <div className="text-xs text-zinc-400">Returns validated JSON with problem, possible causes, technical analysis, and actionable steps.</div>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 flex items-start gap-3">
                  <Server className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-zinc-200">Safety &amp; Manual Verification</div>
                    <div className="text-xs text-zinc-400">Commands are never executed blindly; engineers retain full oversight before applying changes.</div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30"
                >
                  Test the Troubleshooter <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Code / JSON Schema Preview */}
            <div className="rounded-2xl border border-zinc-800 bg-[#161b22] p-6 shadow-2xl font-mono text-xs">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-zinc-400 text-[11px]">POST /ai/troubleshoot</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                  200 OK
                </span>
              </div>

              <pre className="text-zinc-300 leading-relaxed overflow-x-auto">
{`{
  "problem": "Apex Domain Non-Resolving (Missing Address Record)",
  "severity": "high",
  "possible_causes": [
    "Hosted zone 'myapp.io' has no 'A' or 'AAAA' record for apex '@'",
    "Nameservers not yet delegated at registrar"
  ],
  "analysis": "Queries for myapp.io result in NXDOMAIN. Authoritative zone inspection confirms 0 records at '@' node.",
  "recommended_actions": [
    "Create an 'A' record pointing '@' to your web server IPv4",
    "Verify NS records match Route 53 assigned nameservers",
    "Run 'dig +trace myapp.io' to test external resolution"
  ],
  "requires_manual_verification": true
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-800/80 py-12 bg-[#0a0d12]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Globe className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm text-zinc-300">
              AWS Route 53 Clone Platform
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-zinc-500">
            <Link href="/auth/login" className="hover:text-zinc-300">Login</Link>
            <Link href="/auth/register" className="hover:text-zinc-300">Register</Link>
            <a href="https://github.com/aditya2005-code/Route53" target="_blank" rel="noreferrer" className="hover:text-zinc-300 flex items-center gap-1">
              GitHub <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <p className="text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} Route 53 Cloud DNS. Production-Ready Platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
