import { NextRequest, NextResponse } from 'next/server';
import { Message as VercelChatMessage, StreamingTextResponse } from 'ai';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { createHistoryAwareRetriever } from 'langchain/chains/history_aware_retriever';
import { HumanMessage, AIMessage, ChatMessage } from '@langchain/core/messages';
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { Document } from '@langchain/core/documents';
import { RunnableSequence } from '@langchain/core/runnables';
import { HttpResponseOutputParser } from 'langchain/output_parsers';
import { loadVectorStore } from '../utils/vector_store';
import { loadEmbeddingsModel } from '../utils/embeddings';
import { auth } from '@clerk/nextjs';
import answerSystemTemplate from '../../../templates/answerSystemTemplate';

export const runtime = 'edge';

const formatVercelMessages = (message: VercelChatMessage) => {
  if (message.role === 'user') {
    return new HumanMessage(message.content);
  } else if (message.role === 'assistant') {
    return new AIMessage(message.content);
  } else {
    console.warn(
      `Unknown message type passed: "${message.role}". Falling back to generic message type.`,
    );
    return new ChatMessage({ content: message.content, role: message.role });
  }
};

const historyAwarePrompt = ChatPromptTemplate.fromMessages([
  new MessagesPlaceholder('chat_history'),
  ['user', '{input}'],
  [
    'user',
    'Given the above conversation, generate a concise vector store search query to look up in order to get information relevant to the conversation.',
  ],
]);

const ANSWER_SYSTEM_TEMPLATE = answerSystemTemplate;

const answerPrompt = ChatPromptTemplate.fromMessages([
  ['system', ANSWER_SYSTEM_TEMPLATE],
  new MessagesPlaceholder('chat_history'),
  ['user', '{input}'],
]);

/**
 * This handler initializes and calls a retrieval chain. It composes the chain using
 * LangChain Expression Language. See the docs for more information:
 *
 * https://js.langchain.com/docs/get_started/quickstart
 * https://js.langchain.com/docs/guides/expression_language/cookbook#conversational-retrieval-chain
 */
export async function POST(req: NextRequest) {

  const { userId } = auth();

  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    if (!messages.length) {
      throw new Error('No messages provided.');
    }
    const formattedPreviousMessages = messages
      .slice(0, -1)
      .map(formatVercelMessages);
    const currentMessageContent = messages[messages.length - 1].content;

    const model = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0,
    });

    const embeddings = loadEmbeddingsModel();

    const namespace = `user-session-${userId}`;

    // Initialize the vector store with the user's documents
    const store = await loadVectorStore({
      namespace: namespace,
      embeddings
    });

    const vectorstore = store.vectorstore;

    let resolveWithDocuments: (value: Document[]) => void;
    const documentPromise = new Promise<Document[]>((resolve) => {
      resolveWithDocuments = resolve;
    });

    const retriever = vectorstore.asRetriever({
      callbacks: [
        {
          handleRetrieverEnd(documents) {
            // Extract retrieved source documents so that they can be displayed as sources
            // on the frontend.
            resolveWithDocuments(documents);
          },
        },
      ],
    });

    // Create a chain that can rephrase incoming questions for the retriever,
    // taking previous chat history into account. Returns relevant documents.
    const historyAwareRetrieverChain = await createHistoryAwareRetriever({
      llm: model,
      retriever,
      rephrasePrompt: historyAwarePrompt,
    });

    // Create a chain that answers questions using retrieved relevant documents as context.
    const documentChain = await createStuffDocumentsChain({
      llm: model,
      prompt: answerPrompt,
    });

    // Create a chain that combines the above retriever and question answering chains.
    const conversationalRetrievalChain = await createRetrievalChain({
      retriever: historyAwareRetrieverChain,
      combineDocsChain: documentChain,
    });

    // "Pick" the answer from the retrieval chain output object and stream it as bytes.
    const outputChain = RunnableSequence.from([
      conversationalRetrievalChain.pick('answer'),
      new HttpResponseOutputParser({ contentType: 'text/plain' }),
    ]);

    const stream = await outputChain.stream({
      chat_history: formattedPreviousMessages,
      input: currentMessageContent,
    });

    const documents = await documentPromise;
    const serializedSources = Buffer.from(
      JSON.stringify(
        documents.map((doc) => {
          return {
            pageContent: doc.pageContent.slice(0, 50) + '...',
            metadata: doc.metadata,
          };
        }),
      ),
    ).toString('base64');

    return new StreamingTextResponse(stream, {
      headers: {
        'x-message-index': (formattedPreviousMessages.length + 1).toString(),
        'x-sources': serializedSources,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
};