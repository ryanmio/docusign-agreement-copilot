import DocumentDetails from './document-details';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentDetailsPage({
  params
}: PageProps) {
  const resolvedParams = await params;
  return <DocumentDetails params={resolvedParams} />;
} 