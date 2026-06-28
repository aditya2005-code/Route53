"use client";

export default function LoadingSkeleton() {
  const skeletonRows = Array.from({ length: 5 });

  return (
    <div className="w-full overflow-hidden border border-[#d5dbdb] bg-white rounded-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[#f2f3f3] border-b border-[#d5dbdb] text-xs font-bold text-zinc-700 select-none">
          <tr>
            {/* Blank column placeholder for radio select */}
            <th className="px-4 py-2.5 w-10"></th>
            <th className="px-4 py-2.5 w-1/3">Domain name</th>
            <th className="px-4 py-2.5 w-1/3">Description</th>
            <th className="px-4 py-2.5 w-24">Type</th>
            <th className="px-4 py-2.5 w-24">Record count</th>
            <th className="px-4 py-2.5 w-36">Created date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#eaeded]">
          {skeletonRows.map((_, index) => (
            <tr key={index} className="animate-pulse">
              <td className="px-4 py-3 w-10">
                <div className="h-3.5 w-3.5 bg-zinc-200 rounded-full mx-auto" />
              </td>
              <td className="px-4 py-3">
                <div className="h-4 bg-zinc-200 rounded-sm w-3/4" />
              </td>
              <td className="px-4 py-3">
                <div className="h-4 bg-zinc-200 rounded-sm w-5/6" />
              </td>
              <td className="px-4 py-3">
                <div className="h-4 bg-zinc-200 rounded-sm w-12" />
              </td>
              <td className="px-4 py-3">
                <div className="h-4 bg-zinc-200 rounded-sm w-8" />
              </td>
              <td className="px-4 py-3">
                <div className="h-4 bg-zinc-200 rounded-sm w-24" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
