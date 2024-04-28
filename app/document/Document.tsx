'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Document } from '@prisma/client';
import { useChat } from 'ai/react';
import { Voice as VoiceResponse } from 'elevenlabs/api';
import useLocalStorage from '@/app/hooks/useLocalStorage';
import useTextToSpeech from '@/app/hooks/useTextToSpeech';
import getVoices from '@/app/utils/getVoices';
import ChatVoice from '@/components/ui/ChatVoice';
import ChatDisplay from '@/components/ui/ChatDisplay';
import ChatForm from '@/components/ui/ChatForm';
import useChatInteraction from '@/app/hooks/useChatInteraction';
import notifyUser from '@/app/utils/notifyUser';
import DocumentsComponent from '@/components/viewer/DocumentsComponent';
import FileUpload from '@/components/uploader/FileUpload';
import { useAuth } from '@clerk/clerk-react';

export default function DocumentClient({
  docsList,
  userImage,
}: {
  docsList: Document[];
  userImage?: string;
}) {
  const [sourcesForMessages, setSourcesForMessages] = useState<
    Record<string, any>
  >({});
  const [error, setError] = useState('');
  // Store the list of voices from ElevenLabs
  const [voices, setVoices] = useState<VoiceResponse[]>([]);
  // Store the name of the selected voice
  const [selectedVoice, setSelectedVoice] = useLocalStorage<string | undefined>('selectedVoice', undefined);
  // State to check if the chat has any messages
  const [hasChats, setHasChats] = useState(false);
  const [hasUnsavedMessages, setHasUnsavedMessages] = useState(false);

  const [documents, setDocuments] = useState<Document[]>([]);

  // State to track the currently selected document and page
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState<number | null>(null);

  const { sessionId } = useAuth();

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading,
    setMessages,
    setInput,
  } = useChat({
    api: '/api/chat',
    body: {
      documents: documents.map(doc => doc.id)
    },
    onResponse(response) {
      const sourcesHeader = response.headers.get('x-sources');
      const sources = sourcesHeader ? JSON.parse(atob(sourcesHeader)) : [];
      const messageIndexHeader = response.headers.get('x-message-index');
      if (sources.length && messageIndexHeader !== null) {
        setSourcesForMessages({
          ...sourcesForMessages,
          [messageIndexHeader]: sources,
        });
      }
    },
    onError: (e) => {
      setError(e.message);
    },
    onFinish() {},
  });

  const { audioLoading, requestTextToSpeech, clearAllAudioUrls, audioRef } = useTextToSpeech({
    selectedVoice,
  });

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Wrap the original handleSubmit to include setting hasUnsavedMessages
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    originalHandleSubmit(e);
    setHasUnsavedMessages(true);
  };

   // Initialize documents state with docsList from props
   useEffect(() => {
    setDocuments(docsList);
  }, [docsList]); 


  // This function is triggered when new documents are added
  const handleDocumentAdd = (newDocuments: any) => {
    setDocuments(prevDocuments => {
      const newDocs: Document[] = newDocuments.filter((newDoc: Document) => !prevDocuments.some(doc => doc.id === newDoc.id));
      return [...prevDocuments, ...newDocs];
    });
  };

  // Function to reset the selected document and page to be passed to the DocumentsComponent
  const resetSelection = () => {
    setSelectedDocId(null);
    setSelectedPage(null);
  };

  // Function which will serve to programmatically open the involved document with the selected source page from the chatbot relevant sources response
  const navigateToDocumentPage = useCallback((docId: string, pageNumber: number) => {
    setSelectedDocId(docId);
    setSelectedPage(pageNumber);
    console.log('Selected document:', docId, 'Page number:', pageNumber);
  }, []);

  const documentNameToIdMap = useMemo(() => {
    return docsList.reduce((acc: any, doc) => {
      acc[doc.fileName] = doc.id;
      return acc;
    }, {});
  }, [docsList]);

  useEffect(() => {
    // Fetch the voices from the getVoices() utility and store them.
    getVoices()
      .then((voices) => {
        setVoices(voices ?? []);
      })
      .catch((error) => {
        console.error('Error fetching voices:', error);
      });
  }, []);

  // Sample questions to guide the user.
  const sampleQuestions = [
    'What is the main topic?',
    'Summarize the document.',
    'Explain key points.',
  ];
  // Handle sample question clicks, predefined user interactions
  const { handleSampleQuestionClick } = useChatInteraction(
    input,
    setInput,
    textAreaRef,
  );

  // Prevent empty chat submissions
  const handleEnter = (e: any) => {
    if (e.key === 'Enter') {
      if (!input.trim()) {
        e.preventDefault(); // Prevent form submission if input is empty or whitespace
      } else {
        // Submit the form if input is valid (non-empty and non-whitespace)
        handleSubmit(e); // Cast event type if needed
        setInput(''); // Clear the input after submitting
      }
    }
  };

  // Function to handle saving chat
  const handleSaveChat = async () => {
    if (!sessionId) {
      notifyUser('No session ID found.', { type: 'error' });
      return;
    }

    if (!hasUnsavedMessages) {
      notifyUser('No new messages to save.', { type: 'info' });
      return;
    }

    const messagesToSave = messages;
    try {
      const response = await fetch('/api/saveChatSession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messagesToSave,
          sessionId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save chat');
      }

      const savedChat = await response.json();
      notifyUser('Chat saved successfully.', { type: 'success' });
      setHasUnsavedMessages(false);
      // Fetch the updated chat history after saving to synchronize with local storage
      fetchChatHistory();
    } catch (error: any) {
      console.error('Failed to save chat:', error);
      setError(error.message);
    }
  };

  // Function to fetch chat history
  const fetchChatHistory = async () => {
    if (!sessionId) {
      notifyUser('No session ID found.', { type: 'error' });
      return;
    }

    try {
      const response = await fetch(
        `/api/getChatHistory?sessionId=${sessionId}`,
      );
      if (!response.ok) {
        throw new Error('Failed to load chat history');
      }
      const data = await response.json();
      setMessages(data.messages);
      setHasChats(data.messages.length > 0);
      // Store fetched messages in localStorage
      localStorage.setItem(
        `messages_${sessionId}`,
        JSON.stringify(data.messages),
      );
      // Set a flag indicating history exists
      localStorage.setItem(`shouldFetch_${sessionId}`, 'true');
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setMessages([]); 
      setHasChats(false); 
    }
  };

  // Effect to fetch chat history from localStorage or API endpoint
  useEffect(() => {
    if (!sessionId) return;
    const storedMessages = localStorage.getItem(
      `messages_${sessionId}`,
    );
    setMessages([]);
    if (storedMessages) {
      const messagesArray = JSON.parse(storedMessages);
      setMessages(messagesArray);
      setHasChats(messagesArray.length > 0);
    } else {
      // Check a flag to determine if we should fetch history
      const shouldFetch = localStorage.getItem(`shouldFetch_${sessionId}`);
      if (shouldFetch === 'true') {
        fetchChatHistory();
      }
    }
  }, [sessionId]);

  let userProfilePic = userImage || '/profile-icon.png';

  const extractSourcePageNumber = (source: {
    metadata: Record<string, any>;
  }) => {
    return source.metadata['loc.pageNumber'] ?? source.metadata.loc?.pageNumber;
  };

  // Function to delete chat and clear local state
  const handleDeleteChat = async () => {
    if (!sessionId) {
      notifyUser('No session ID found.', { type: 'error' });
      return;
    }

    try {
      const response = await fetch(`/api/deleteChat`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete chat');
      }

      // Clear local state and localStorage after successful deletion
      setMessages([]);
      setHasChats(false);
      setHasUnsavedMessages(false);
      localStorage.removeItem(`messages_${sessionId}`);
      // Remove the flag indicating history exists
      localStorage.removeItem(`shouldFetch_${sessionId}`);
      clearAllAudioUrls();
      notifyUser('Chat deleted successfully.', { type: 'success' });
    } catch (error: any) {
      console.error('Failed to delete chat:', error);
      setError(error.message);
      notifyUser(error.message, { type: 'error' });
    }
  };

  return (
    <div className="no-scrollbar -mt-2 flex flex-col lg:flex-row max-h-screen overflow-hidden">
      <div className="flex w-full flex-col  sm:space-y-20 lg:flex-row lg:space-y-0 overflow-hidden">
        <div className="flex flex-col lg:w-2/3 w-full p-2">
          <ChatVoice {...{ voices, selectedVoice, setSelectedVoice }} />
          <ChatDisplay
            messages={messages}
            audioLoading={audioLoading}
            requestTextToSpeech={requestTextToSpeech}
            messageListRef={messageListRef}
            audioRef={audioRef}
            sourcesForMessages={sourcesForMessages}
            userProfilePic={userProfilePic}
            extractSourcePageNumber={extractSourcePageNumber}
            handleSampleQuestionClick={handleSampleQuestionClick}
            sampleQuestions={sampleQuestions}
            isLoading={isLoading}
            navigateToDocumentPage={navigateToDocumentPage}
            error={error}
            documentNameToIdMap={documentNameToIdMap}
            documents={documents}
          />
          <div className="flex items-center justify-center">
            <ChatForm
              isLoading={isLoading}
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              handleEnter={handleEnter}
              handleSaveChat={handleSaveChat}
              handleDeleteChat={handleDeleteChat}
              hasChats={hasChats}
              textAreaRef={textAreaRef}
              hasUnsavedMessages={hasUnsavedMessages}
            />
          </div>
          {error && (
            <div className="rounded-md border border-red-400 p-4">
              <p className="text-red-500">{error}</p>
            </div>
          )}
          <div className="flex justify-center p-5">
            <p>
              CamelotAi can make mistakes. Consider checking and verifying
              documents.
            </p>
          </div>
        </div>
        <div className="w-full lg:w-1/3 overflow-auto">
          <DocumentsComponent 
            docsList={documents} 
            selectedDocId={selectedDocId}
            selectedPage={selectedPage}
            onDocumentSelect={navigateToDocumentPage}
            resetSelection={resetSelection}
          />
          <FileUpload 
            docsList={documents} 
            onDocumentAdd={handleDocumentAdd} 
          />
        </div>
      </div>
    </div>
  );
}
