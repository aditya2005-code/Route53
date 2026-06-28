"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Shield, Activity, Network, Server, Settings, User } from "lucide-react";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  disabled?: boolean;
}

function SidebarLink({ href, icon, label, active, disabled }: SidebarLinkProps) {
  if (disabled) {
    return (
      <div
        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-zinc-600 bg-transparent cursor-not-allowed select-none border-l-2 border-transparent"
        title="Feature disabled in this phase"
      >
        <span className="text-zinc-600">{icon}</span>
        <span>{label}</span>
        <span className="ml-auto text-[10px] text-zinc-700 bg-zinc-800/40 px-1.5 py-0.5 rounded-sm uppercase tracking-widest scale-90">
          Disabled
        </span>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border-l-2 transition-all ${
        active
          ? "bg-[#353f47] text-white border-indigo-500 font-semibold"
          : "text-zinc-300 hover:bg-[#20272e] hover:text-white border-transparent"
      }`}
    >
      <span className={active ? "text-indigo-400" : "text-zinc-400"}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/hosted-zones", label: "Hosted Zones", icon: <Globe size={14} />, active: true },
    { href: "/traffic-policies", label: "Traffic Policies", icon: <Network size={14} />, disabled: true },
    { href: "/health-checks", label: "Health Checks", icon: <Activity size={14} />, disabled: true },
    { href: "/resolver", label: "Resolver", icon: <Server size={14} />, disabled: true },
    { href: "/profiles", label: "Profiles", icon: <User size={14} />, disabled: true },
    { href: "/settings", label: "Settings", icon: <Settings size={14} />, disabled: true },
  ];

  return (
    <aside className="fixed inset-y-16 left-0 z-20 flex w-56 flex-col border-r border-[#2d3748] bg-[#16191f] text-zinc-100 select-none">
      {/* Sidebar Label */}
      <div className="px-4 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-[#2d3748]/50">
        Route 53 Navigation
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-3 space-y-0.5">
        {links.map((link) => (
          <SidebarLink
            key={link.label}
            href={link.href}
            icon={link.icon}
            label={link.label}
            active={pathname.startsWith(link.href)}
            disabled={link.disabled}
          />
        ))}
      </nav>

      {/* Sidebar Footer Info */}
      <div className="p-4 border-t border-[#2d3748] bg-[#101317] text-[10px] text-zinc-600 flex flex-col space-y-1">
        <span>Console Version: 1.0.0</span>
        <span>Environment: Production</span>
      </div>
    </aside>
  );
}
