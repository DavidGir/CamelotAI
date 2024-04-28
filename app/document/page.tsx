import prisma from '../utils/prisma';
import { currentUser } from '@clerk/nextjs';
import type { User } from '@clerk/nextjs/api';
import Document from './Document';
import { Suspense } from 'react';
import Loading from './loading';

export default async function Page() {
  const user: User | null = await currentUser();

  const documents = await prisma.document.findMany({
    where: {
      userId: user?.id,
    },
    orderBy: {
      createdAt: 'asc',
    },
    take: 6,
  });

  return (
    <div>
      <Suspense fallback={<Loading />}>
        <Document docsList={documents} userImage={user?.imageUrl} />
      </Suspense>
    </div>
  );
}