"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Globe, 
  Activity, 
  Settings, 
  LogOut, 
  Server,
  Network
} from "lucide-react";
import useAuth from "../../hooks/useAuth";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

function SidebarLink({ href, icon, label, active }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
        active
          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
          : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
      }`}
    >
      <div className={`transition-transform duration-300 group-hover:scale-110 ${active ? "text-white" : "text-zinc-400 group-hover:text-indigo-400"}`}>
        {icon}
      </div>
      <span>{label}</span>
      {active && (
        <span className="ml-auto h-2 w-2 rounded-full bg-white animate-pulse" />
      )}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { href: "/hosted-zones", label: "Hosted Zones", icon: <Globe size={18} /> },
    { href: "/health-checks", label: "Health Checks", icon: <Activity size={18} /> },
    { href: "/traffic-policies", label: "Traffic Policies", icon: <Network size={18} /> },
    { href: "/resolver", label: "DNS Resolver", icon: <Server size={18} /> },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-100">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-2.5 border-b border-zinc-800 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white font-bold text-lg shadow-lg shadow-indigo-500/30">
          53
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm leading-tight tracking-wider bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            AWS ROUTE 53
          </span>
          <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest">
            Clone Console
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 px-4 py-6">
        <div className="px-3 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-widest">
          Navigation
        </div>
        {links.map((link) => (
          <SidebarLink
            key={link.href}
            href={link.href}
            icon={link.icon}
            label={link.label}
            active={pathname === link.href || pathname.startsWith(`${link.href}/`)}
          />
        ))}
      </nav>

      {/* User Section & Footer */}
      <div className="border-t border-zinc-800 p-4 bg-zinc-900/20">
        {user && (
          <div className="mb-4 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20">
              {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-zinc-200 truncate">
                {user.name || "Route53 User"}
              </span>
              <span className="text-xs text-zinc-500 truncate">
                {user.email}
              </span>
            </div>
          </div>
        )}
        
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-400 transition-all duration-300 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
