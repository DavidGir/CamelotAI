import { NextResponse } from 'next/server';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import prisma from '../../utils/prisma';
import { auth } from '@clerk/nextjs/server';
import { loadEmbeddingsModel } from '../utils/embeddings';
import { loadVectorStore } from '../utils/vector_store';

export async function POST(request: Request) {
  const documents = await request.json();

  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'You must be logged in to ingest data' });
  }

  const docAmount = await prisma.document.count({
    where: {
      userId,
    },
  });

  if (docAmount + documents.length > 6) {
    return NextResponse.json({
      error: 'You have reached the maximum number of documents',
    });
  }

  const namespace = `user-session-${userId}`;

  try {
    const results = [];
    for (const { fileUrl, fileName } of documents) {
      const doc = await prisma.document.create({
        data: {
          fileName,
          fileUrl,
          userId,
        },
      });
    // Load from remote pdf URL using axios:
    const response = await fetch(fileUrl);
    const buffer = await response.blob();
    const loader = new PDFLoader(buffer);
    const rawDocs = await loader.load();

    // Split the PDF documents into smaller chunks with the goal of embedding them in Pinecone:
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1500,
      chunkOverlap: 300,
    });
    const splitDocs = await textSplitter.splitDocuments(rawDocs);
    // Add the documentId identifier to the metadata:
    for (const splitDoc of splitDocs) {
      splitDoc.metadata.docstore_document_id = doc.id;
      splitDoc.metadata.docstore_document_name = doc.fileName;
    }

    console.log('Creating vector store...');

    // Create and store the embeddings in the vector store:
    const embeddings = loadEmbeddingsModel();

    const { vectorstore } = await loadVectorStore({
      namespace,
      embeddings,
    });

    // Create vector IDs for each split document making it easier to delete Vector IDs later on:
    const vectorIds = splitDocs.map((_, index) => `${doc.id}-${index}`);
    // Embed the PDF documents in Pinecone using the vector store and the vectorIds as identifiers for the records IDs:
    await vectorstore.addDocuments(splitDocs, { ids: vectorIds });

    // Update document record to save vector IDs in our psql database
    // We will use these vector IDs to delete the vectors from Pinecone when the user deletes the document
    await prisma.document.update({
      where: {
        id: doc.id,
      },
      data: {
        vectorIds: vectorIds,
      },
    });

    results.push({ docId: doc.id, fileName: doc.fileName, fileUrl: doc.fileUrl });
    }
    return NextResponse.json({ documents: results });
  } catch (error) {
    console.log('error', error);
    return NextResponse.json({ error: 'Failed to ingest your data' });
  }
}