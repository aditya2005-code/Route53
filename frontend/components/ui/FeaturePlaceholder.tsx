"use client";

import { Info } from "lucide-react";
import { Button } from "./Button";
import { Card } from "./Card";
import { useRouter } from "next/navigation";

interface FeaturePlaceholderProps {
  title: string;
  moduleName: string;
}

export default function FeaturePlaceholder({ title, moduleName }: FeaturePlaceholderProps) {
  const router = useRouter();

  return (
    <div className="space-y-6 select-none">
      {/* 1. Page Title Header Area */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">
          {title}
        </h1>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold mt-1">
          <span>AWS Route 53 Console</span>
          <span>&gt;</span>
          <span className="text-zinc-700 font-bold">{title}</span>
        </div>
      </div>

      {/* 2. Main Container Card using Card primitive */}
      <Card className="p-8 max-w-2xl bg-white border border-[#d5dbdb] shadow-sm rounded-sm space-y-6">
        
        {/* Blue Info Alert Panel */}
        <div className="flex items-start gap-3 border-l-4 border-[#0066cc] bg-[#f2f8fc] p-4 text-xs text-[#111111] rounded-sm">
          <Info className="text-[#0066cc] shrink-0 mt-0.5" size={16} />
          <div className="flex flex-col space-y-1">
            <span className="font-bold text-zinc-900">Feature Under Development</span>
            <p className="text-zinc-600">
              The {moduleName} module is currently planned for a future Route 53 Clone console release.
            </p>
          </div>
        </div>

        {/* Informative Descriptions */}
        <div className="text-xs text-zinc-600 space-y-2.5 leading-relaxed">
          <p>
            We are actively building the control plane and aggregate interfaces for this module. Once complete, you will be able to manage this feature directly from this console interface.
          </p>
          <p className="text-zinc-400">
            For current DNS record configurations and hosted zone management, please use the active Hosted Zones dashboard.
          </p>
        </div>

        {/* Back navigation Button Action */}
        <div className="pt-4 border-t border-[#eaeded]">
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push("/hosted-zones")}
          >
            Back to Hosted Zones
          </Button>
        </div>
      </Card>
    </div>
  );
}
