import { EntityEditClient } from './EntityEditClient';

export const runtime = 'edge';

export default async function AdminEntityEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EntityEditClient id={id} />;
}
