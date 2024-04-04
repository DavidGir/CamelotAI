import { Embeddings } from '@langchain/core/embeddings';
import { loadPineconeStore } from './pinecone';

export async function loadVectorStore({
  namespace,
  embeddings,
}: {
  namespace: string;
  embeddings: Embeddings;
}) {
  const vectorStoreEnv = process.env.NEXT_PUBLIC_VECTORSTORE;

  if (vectorStoreEnv === 'pinecone') {
    return await loadPineconeStore({
      namespace,
      embeddings,
    });
  } else {
    throw new Error(`Invalid vector store id provided: ${vectorStoreEnv}`);
  }
}