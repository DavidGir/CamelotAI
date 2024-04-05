import prisma from '../../../lib/prisma';
import { NextResponse,NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { Pinecone } from '@pinecone-database/pinecone';

export async function DELETE(request: NextRequest) {
  
  const id = request.nextUrl.searchParams.get('id');
  const { userId } = getAuth(request as any);

  // Check if the user is authenticated
  if (!userId) {
    return NextResponse.json({ error: 'You must be logged in to delete data' });
  }

  try {
    if (id) {
      // Delete the document from PostgreSQL using Prisma:
      const deletedDocument = await prisma.document.delete({
        where: {
          id: id,
          userId: userId,
        },
      });

      // Delete the document vectors from Pinecone namespace:
      const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY ?? '' })
      const index = pinecone.index(process.env.PINECONE_INDEX_NAME ?? '')
      // Delete all vectors from the specific namespace which is the same as document id:
      await index.namespace(id).deleteAll();

    return NextResponse.json({message: `Document and vectors for ${id} deleted`}, {status:200});
    }
  } catch (error) {
    return NextResponse.json({error: 'Error deleting document and vectors'}, {status:500});
  }

};