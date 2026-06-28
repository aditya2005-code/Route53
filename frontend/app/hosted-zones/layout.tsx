import React from "react";

export default function HostedZonesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="hosted-zones-layout">
      {children}
    </div>
  );
}
