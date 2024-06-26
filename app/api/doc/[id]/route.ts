import prisma from '../../../utils/prisma';
import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Pinecone } from '@pinecone-database/pinecone';

// Interface aligning with the Bytescale API documentation:
interface DeleteFileParams {
  accountId: string;
  apiKey: string;
  querystring: {
    filePath: string;
  };
}

// The following function deletes a file from Bytescale
// This can be found in the Bytescale API documentation under Delete File:
async function deleteFile(params: DeleteFileParams) {
  const baseUrl = 'https://api.bytescale.com';
  const path = `/v2/accounts/${params.accountId}/files`;
  const entries = (obj: Record<string, unknown>) =>
    Object.entries(obj).filter(([, val]) => (val ?? null) !== null) as [
      string,
      string,
    ][];
  const query = entries(params.querystring ?? {})
    .flatMap(([k, v]) => (Array.isArray(v) ? v.map((v2) => [k, v2]) : [[k, v]]))
    .map((kv) => kv.join('='))
    .join('&');
  const response = await fetch(
    `${baseUrl}${path}${query.length > 0 ? '?' : ''}${query}`,
    {
      method: 'DELETE',
      headers: Object.fromEntries(
        entries({
          Authorization: `Bearer ${params.apiKey}`,
        }) as [string, string][],
      ),
    },
  );
  if (Math.floor(response.status / 100) !== 2) {
    const result = await response.json();
    throw new Error(`Bytescale API Error: ${JSON.stringify(result)}`);
  }
}

export async function DELETE(request: NextRequest) {
  const { docId, fileUrl } = await request.json();
  const { userId } = auth();

  // Check if the user is authenticated
  if (!userId) {
    return NextResponse.json({ error: 'You must be logged in to delete data' });
  }

  if (!docId || !fileUrl) {
    return NextResponse.json({ error: 'docId or fileUrl is missing in the request' }, { status: 400 });
  }

  try {
    if (docId && fileUrl) {
      // Extract the account id and the path from the fileUrl for Bytescale cloud storage deletion:
      const pathWithAccId = fileUrl.replace('https://upcdn.io/', '');
      const accId = pathWithAccId.split('/')[0];
      const path = pathWithAccId.replace(`${accId}/raw`, '');
      // Delete the file from Bytescale:
      await deleteFile({
        accountId: accId,
        apiKey: !!process.env.NEXT_SECRET_BYTESCALE_API_KEY
          ? process.env.NEXT_SECRET_BYTESCALE_API_KEY
          : 'No Bytescale api key found',
        querystring: {
          filePath: path,
        },
      }).then(
        () => console.log('Success deleting ByteScale files.'),
        (error: Error) => {
          console.error(error);
          return NextResponse.json({
            error: 'Could not delete document from Bytescale cloud',
          });
        },
      );
    }
  } catch (error) {
    console.error('Error deleting document from Bytescale:', error);
    return NextResponse.json({ error: 'Error deleting document from Bytescale' });
  }

  const namespace = `user-session-${userId}`;

  try {
    // Fetch the document to get vectorIds
    const document = await prisma.document.findUnique({
      where: { 
        id: docId, 
        userId: userId 
      },
      select: { 
        vectorIds: true 
      }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Delete the vectors associated with the document from Pinecone:
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY ?? '' });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME ?? '');
    await index.namespace(namespace).deleteMany(document.vectorIds)
      .then(
        () => console.log('Success deleting document vectors in Pinecone.'),
        (error: Error) => {
          console.error(error);
          return NextResponse.json({
            error: 'Could not delete document vectors from Pinecone',
          });
        },
      );
    
    // Delete the document from PostgreSQL using Prisma:
    await prisma.document.delete({
      where: {
        id: docId,
        userId: userId,
      },
    }).then(
      () => console.log('Success deleting document from PostgreSQL.'),
      (error: Error) => {
        console.error(error);
        return NextResponse.json({
          error: 'Could not delete document from PostgreSQL',
        });
      },
    );
    return NextResponse.json({ message: `Document and associated vectors deleted` }, { status: 200 });
  } catch (error) {
    console.error('Error during deletion process:', error);
    return NextResponse.json({ error: 'Error deleting document and vectors' }, { status: 500 });
  }
}