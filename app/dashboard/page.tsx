import Dashboard from './Dashboard';
import prisma from '../utils/prisma';
import { currentUser } from '@clerk/nextjs';
import type { User } from '@clerk/nextjs/api';
import { Suspense } from 'react';
import Loading from './loading';

export default async function Page() {
  const user: User | null = await currentUser();

  const docsList = await prisma.document.findMany({
    where: {
      userId: user?.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    cacheStrategy: { swr: 60, ttl: 60 },
  });

  return (
    <div>
      <Suspense fallback={<Loading />}>
        <Dashboard docsList={docsList} />
      </Suspense>
    </div>
  );
}