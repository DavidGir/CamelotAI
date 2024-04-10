'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Markdown from 'react-markdown';
import { Document } from '@prisma/client';
import { useChat } from 'ai/react';
import LoadingDots from '@/components/ui/LoadingDots';
import DocumentTabs from '@/components/ui/DocumentTabs';

export default function DocumentClient({
  docsList,
  userImage,
  selectedDocId
}: {
  docsList: Document[];
  userImage?: string;
  selectedDocId: string;
}) {
  const [sourcesForMessages, setSourcesForMessages] = useState<
  Record<string, any>
  >({});  
  const [error, setError] = useState('');
  const [navigateToPage, setNavigateToPage] = useState<{ docIndex: number, pageNumber: number } | null>(null);
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, setInput } =
    useChat({
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

  // Sample questions to guide the user.
  const sampleQuestions = ["What is the main topic?", "Summarize the document.", "Explain key points."];

  // Function to programmatically submit a question to the chat
  const handleSampleQuestionClick = (question: string) => {
    // Update the input (question asked) state and ensure the UI updates
    setInput(question);

    // Wait for the next event loop tick to ensure state and UI updates have occurred
    setTimeout(() => {
      // Create and dispatch a synthetic 'Enter' key press event to submit the form
      const enterKeyPressEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        bubbles: true,
      });

      // Dispatch it to the textarea input
      textAreaRef.current?.dispatchEvent(enterKeyPressEvent);
    }, 0);
  };

  useEffect(() => {
    const newSelectedIndex = docsList.findIndex(doc => doc.id === selectedDocId);
    if (newSelectedIndex !== -1) {
      setSelectedDocIndex(newSelectedIndex);
    }
  }, [selectedDocId, docsList]);

  // Trigger chat session update on document tab switch
  useEffect(() => {
    handleInputChange({ target: { value: input } } as React.ChangeEvent<HTMLTextAreaElement>);
  }, [selectedDocIndex, handleInputChange, input]);

  // Clear chat and reset input when switching documents
  useEffect(() => {
    setMessages([]);
    setInput('');
  }, [selectedDocIndex, setMessages, setInput]);

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  // Prevent empty chat submissions
  const handleEnter = (e: any) => {
    if (e.key === 'Enter' && messages) {
      handleSubmit(e);
    } else if (e.key == 'Enter') {
      e.preventDefault();
    }
  };

  let userProfilePic = userImage || '/profile-icon.png';

  const extractSourcePageNumber = (source: {
    metadata: Record<string, any>;
  }) => {
    return source.metadata['loc.pageNumber'] ?? source.metadata.loc?.pageNumber;
  };

  return (
    <div className="mx-auto flex flex-col no-scrollbar -mt-2">
      <div className="flex justify-between w-full lg:flex-row flex-col sm:space-y-20 lg:space-y-0 p-2">
        {/* Left hand side */}
          <DocumentTabs docsList={docsList} navigateToPage={navigateToPage} onTabSelect={setSelectedDocIndex} selectedTab={selectedDocIndex}/>
        {/* Right hand side */}
        <div className="flex flex-col w-full justify-between align-center h-[90vh] chat-font-family no-scrollbar">
          <div
            className={`w-full min-h-min bg-white border flex justify-center items-center no-scrollbar sm:h-[85vh] h-[80vh]
            `}
          >
            <div
              ref={messageListRef}
              className="w-full h-full overflow-y-scroll no-scrollbar rounded-md mt-4"
            >
              {messages.length === 0 && (
              <div className="flex flex-col justify-center items-center text-xl h-full">
                {/* Chatbot avatar and greeting */}
                <div className="flex flex-col items-center p-4">
                  <Image src="/logo.png" alt="Chatbot Avatar" width={50} height={50} />
                  <p className="text-lg mt-2">How can I assist you with your documents?</p>
                </div>

                {/* Sample questions */}
                <div className="flex gap-2 flex-wrap justify-center p-4">
                  {sampleQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSampleQuestionClick(question)}
                      className="bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full cursor-pointer"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
              )}
              {messages.map((message, index) => {
                const sources = sourcesForMessages[index] || [];
                const isLastMessage = !isLoading && index === messages.length - 1;
                const previousMessages = index !== messages.length - 1;
                // Filter to get first occurrences/unique sources based on page numbers
                // Then sort unique sources by page number in asc order
                const uniqueAndSortedSources = sources
                  .filter((source: any, index: number, self: any) => 
                    index === self.findIndex((s: any) => (
                      extractSourcePageNumber(s) === extractSourcePageNumber(source)
                    ))
                  )
                  .sort((a: any, b: any) => extractSourcePageNumber(a) - extractSourcePageNumber(b));

                return (
                  <div key={`chatMessage-${index}`}>
                    <div
                      className={`p-4 text-black animate ${
                        message.role === 'assistant'
                          ? 'bg-gray-100'
                          : isLoading && index === messages.length - 1
                          ? 'animate-pulse bg-white'
                          : 'bg-white'
                      }`}
                    >
                      <div className="flex">
                        <Image
                          key={index}
                          src={
                            message.role === 'assistant'
                              ? '/logo.png'
                              : userProfilePic
                          }
                          alt="profile image"
                          width={message.role === 'assistant' ? '35' : '33'}
                          height="30"
                          className="mr-4 rounded-sm h-full"
                          priority
                        />
                        <Markdown className="prose">
                          {message.content}
                        </Markdown>
                      </div>
                      {/* Display the sources */}
                      {(isLastMessage || previousMessages) && sources && (
                        <div className="flex space-x-4 ml-14 mt-3">
                          {uniqueAndSortedSources.map((source: any) => (
                            <button
                              key={`source-${extractSourcePageNumber(source)}`}
                              className="border bg-gray-200 px-3 py-1 hover:bg-gray-100 transition rounded-lg"
                              onClick={() => {
                                const pageNumber = extractSourcePageNumber(source);
                                // Update the navigateToPage state to indicate the desired document and page
                                setNavigateToPage({ docIndex: selectedDocIndex, pageNumber: pageNumber - 1 });
                              }}
                            >
                              p. {extractSourcePageNumber(source)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex justify-center items-center sm:h-[15vh] h-[20vh]">
            <form
              id="chatForm"
              onSubmit={(e) => handleSubmit(e)}
              className="relative w-full px-4 sm:pt-10 pt-2"
            >
              <textarea
                className="resize-none p-3 pr-10 rounded-md border border-gray-300 bg-white text-black focus:outline-gray-400 w-full"
                disabled={isLoading}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleEnter}
                ref={textAreaRef}
                rows={3}
                autoFocus={false}
                maxLength={512}
                id="userInput"
                name="userInput"
                placeholder={
                  isLoading ? 'Waiting for response...' : 'Ask me anything...'
                }
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute top-[40px] sm:top-[71px] right-6 text-gray-600 bg-transparent py-1 px-2 border-none flex transition duration-300 ease-in-out rounded-sm"
              >
                {isLoading ? (
                  <div className="">
                    <LoadingDots color="#000" style="small" />
                  </div>
                ) : (
                  <svg
                    viewBox="0 0 20 20"
                    className="transform rotate-90 w-6 h-6 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                  </svg>
                )}
              </button>
            </form>
          </div>
          {error && (
            <div className="border border-red-400 rounded-md p-4">
              <p className="text-red-500">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}