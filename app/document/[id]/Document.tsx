'use client';

import { useRef, useState, useEffect } from 'react';
import { Document } from '@prisma/client';
import { useChat } from 'ai/react';
import DocumentTabs from '@/components/ui/DocumentTabs';
import { Voice as VoiceResponse } from 'elevenlabs/api';
import useLocalStorage from '@/app/hooks/useLocalStorage';
import useTextToSpeech from '@/app/hooks/useTextToSpeech';
import getVoices from '@/app/utils/getVoices';
import ChatVoice from '@/components/ui/ChatVoice';
import ChatDisplay from '@/components/ui/ChatDisplay';
import ChatForm from '@/components/ui/ChatForm';
import useChatInteraction from '@/app/hooks/useChatInteraction';
import notifyUser from '@/app/utils/notifyUser';

export default function DocumentClient({
  docsList,
  userImage,
  selectedDocId,
}: {
  docsList: Document[];
  userImage?: string;
  selectedDocId: string;
}) {
  const [sourcesForMessages, setSourcesForMessages] = useState<
    Record<string, any>
  >({});
  const [error, setError] = useState('');
  const [navigateToPage, setNavigateToPage] = useState<{
    docIndex: number;
    pageNumber: number;
  } | null>(null);
  const [selectedDocIndex, setSelectedDocIndex] = useLocalStorage<number>(
    'selectedDocIndex',
    0,
  );
  // Store the list of voices from ElevenLabs
  const [voices, setVoices] = useState<VoiceResponse[]>([]);
  // Store the name of the selected voice
  const [selectedVoice, setSelectedVoice] = useLocalStorage<string>(
    'selectedVoice',
    'Camelot',
  );
  // State to check if the chat has any messages
  const [hasChats, setHasChats] = useState(false);
  const [hasUnsavedMessages, setHasUnsavedMessages] = useState(false);

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
      chatId: docsList[selectedDocIndex]?.id,
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

  // Effect to update selectedDocIndex when selectedDocId changes
  useEffect(() => {
    const index = docsList.findIndex((doc) => doc.id === selectedDocId);
    if (index !== -1) {
      setSelectedDocIndex(index);
    }
  }, [selectedDocId, docsList]);

  // Effect to update localStorage when selectedDocIndex changes
  useEffect(() => {
    localStorage.setItem('selectedDocIndex', selectedDocIndex.toString());
  }, [selectedDocIndex]);

  // Function to handle tab selection
  const handleTabSelect = (index: number) => {
    setSelectedDocIndex(index);
  };

  // Prevent empty chat submissions
  const handleEnter = (e: any) => {
    if (e.key === 'Enter' && messages) {
      handleSubmit(e);
    } else if (e.key == 'Enter') {
      e.preventDefault();
    }
  };

  // Function to handle saving chat
  const handleSaveChat = async () => {
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
          documentId: docsList[selectedDocIndex]?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save chat');
      }

      const savedChat = await response.json();
      notifyUser('Chat saved successfully.', { type: 'success' });
      setHasUnsavedMessages(false);
      // Fetch the updated chat history after saving to synchronize with local storage
      fetchChatHistory(docsList[selectedDocIndex]?.id);
    } catch (error: any) {
      console.error('Failed to save chat:', error);
      setError(error.message);
    }
  };

  // Function to fetch chat history
  const fetchChatHistory = async (documentId: string) => {
    try {
      const response = await fetch(
        `/api/getChatHistory?documentId=${documentId}`,
      );
      if (!response.ok) {
        throw new Error('Failed to load chat history');
      }
      const data = await response.json();
      setMessages(data.messages);
      setHasChats(data.messages.length > 0);
      // Store fetched messages in localStorage
      localStorage.setItem(
        `messages_${documentId}`,
        JSON.stringify(data.messages),
      );
      // Set a flag indicating history exists
      localStorage.setItem(`shouldFetch_${documentId}`, 'true');
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setMessages([]); 
      setHasChats(false); 
    }
  };

  // Effect to fetch chat history from localStorage or API endpoint
  useEffect(() => {
    const documentId = docsList[selectedDocIndex]?.id;
    if (!documentId) return;
    const storedMessages = localStorage.getItem(
      `messages_${documentId}`,
    );
    if (storedMessages) {
      const messagesArray = JSON.parse(storedMessages);
      setMessages(messagesArray);
      setHasChats(messagesArray.length > 0);
    } else {
      // Check a flag to determine if we should fetch history
      const shouldFetch = localStorage.getItem(`shouldFetch_${documentId}`);
      if (shouldFetch === 'true') {
        fetchChatHistory(documentId);
      }
    }
  }, [selectedDocIndex, docsList]);

  let userProfilePic = userImage || '/profile-icon.png';

  const extractSourcePageNumber = (source: {
    metadata: Record<string, any>;
  }) => {
    return source.metadata['loc.pageNumber'] ?? source.metadata.loc?.pageNumber;
  };

  // Function to delete chat and clear local state
  const handleDeleteChat = async () => {
    try {
      const documentId = docsList[selectedDocIndex]?.id;
      const response = await fetch(`/api/deleteChat`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: docsList[selectedDocIndex]?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete chat');
      }

      // Clear local state and localStorage after successful deletion
      setMessages([]);
      setHasChats(false);
      setHasUnsavedMessages(false);
      localStorage.removeItem(`messages_${documentId}`);
      // Remove the flag indicating history exists
      localStorage.removeItem(`shouldFetch_${documentId}`);
      clearAllAudioUrls();
      notifyUser('Chat deleted successfully.', { type: 'success' });
    } catch (error: any) {
      console.error('Failed to delete chat:', error);
      setError(error.message);
      notifyUser(error.message, { type: 'error' });
    }
  };

  return (
    <div className="no-scrollbar mx-auto -mt-2 flex flex-col">
      <div className="flex w-full flex-col justify-between p-2 sm:space-y-20 lg:flex-row lg:space-y-0">
        {/* Left hand side */}
        <DocumentTabs
          docsList={docsList}
          navigateToPage={navigateToPage}
          onTabSelect={handleTabSelect}
          selectedTab={selectedDocIndex}
        />
        {/* Right hand side */}
        <div className="align-center no-scrollbar flex h-[90vh] w-full flex-col justify-between">
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
            setNavigateToPage={setNavigateToPage}
            selectedDocIndex={selectedDocIndex}
            error={error}
          />
          <div className="flex h-[20vh] items-center justify-center sm:h-[15vh]">
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
          <div className="flex items-center justify-center p-10">
            <p>
              {' '}
              CamelotAi can make mistakes. Consider checking and verifying
              documents.{' '}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
