"use client";

import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-sm">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400 pointer-events-none">
        <Search size={14} />
      </span>
      <input
        type="text"
        id="search-zones"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Filter hosted zones by name"
        className="h-9 w-full rounded-[3px] border border-[#aab7c4] bg-white pl-9 pr-8 text-xs text-[#111111] placeholder-zinc-400 outline-none focus:ring-1 focus:ring-[#e47911] focus:border-[#e47911]"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 cursor-pointer"
          title="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
