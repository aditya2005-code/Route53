interface HostedZoneDetailPageProps {
  params: Promise<{
    zoneId: string;
  }>;
}

export default async function HostedZoneDetailPage({ params }: HostedZoneDetailPageProps) {
  const { zoneId } = await params;
  return (
    <div>
      <h1>Hosted Zone Details: {zoneId}</h1>
    </div>
  );
}
