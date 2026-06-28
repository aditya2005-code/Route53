import HostedZoneDetailClient from "./HostedZoneDetailClient";

interface HostedZoneDetailPageProps {
  params: Promise<{
    zoneId: string;
  }>;
}

export default async function HostedZoneDetailPage({ params }: HostedZoneDetailPageProps) {
  const { zoneId } = await params;
  const parsedZoneId = parseInt(zoneId, 10);
  return <HostedZoneDetailClient zoneId={parsedZoneId} />;
}
