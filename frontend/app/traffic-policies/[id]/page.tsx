interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TrafficPolicyDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Traffic Policy Details</h1>
      <p className="text-muted-foreground">Traffic Policy ID: {id} (Coming soon...)</p>
    </div>
  );
}
