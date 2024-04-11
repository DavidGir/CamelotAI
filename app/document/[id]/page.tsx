import prisma from '../../utils/prisma';
import { currentUser } from '@clerk/nextjs';
import type { User } from '@clerk/nextjs/api';
import Document from './Document';

export default async function Page({ params }: { params: { id: string } }) {
  const user: User | null = await currentUser();
  // Get the document ID from the dynamic route params
  // This is the ID that will help to determine which document is selected and which tab should be active 
  const docId = params.id;

  const documents = await prisma.document.findMany({
    where: {
      userId: user?.id,
    },
    orderBy: {
      createdAt: 'asc',
    },
    take: 4,
  });

  if (!documents || documents.length === 0) {
    return <div>No documents were found.</div>;
  }

  return (
    <div>
      <Document docsList={documents} userImage={user?.imageUrl} selectedDocId={docId} />
    </div>
  );
}