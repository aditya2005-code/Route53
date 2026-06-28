"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, pages, onPageChange }: PaginationProps) {
  const isFirstPage = page <= 1;
  const isLastPage = page >= pages;

  return (
    <div className="flex items-center justify-between border-t border-[#d5dbdb] bg-[#f2f3f3] px-4 py-3 select-none text-xs rounded-b-sm">
      {/* Page Count */}
      <div className="text-zinc-500 font-medium">
        Page <span className="font-bold text-[#111111]">{page}</span> of{" "}
        <span className="font-bold text-[#111111]">{pages}</span>
      </div>

      {/* Button controls */}
      <div className="flex gap-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={isFirstPage}
          className="flex h-8 w-10 items-center justify-center rounded-[3px] border border-[#aab7b7] bg-white text-zinc-700 hover:bg-[#f2f3f3] disabled:opacity-40 disabled:hover:bg-white cursor-pointer disabled:cursor-not-allowed"
          title="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={isLastPage}
          className="flex h-8 w-10 items-center justify-center rounded-[3px] border border-[#aab7b7] bg-white text-zinc-700 hover:bg-[#f2f3f3] disabled:opacity-40 disabled:hover:bg-white cursor-pointer disabled:cursor-not-allowed"
          title="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
