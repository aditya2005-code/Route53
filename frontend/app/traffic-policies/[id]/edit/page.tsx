interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTrafficPolicyPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit Traffic Policy</h1>
      <p className="text-muted-foreground">Edit Traffic Policy ID: {id} (Coming soon...)</p>
    </div>
  );
}
