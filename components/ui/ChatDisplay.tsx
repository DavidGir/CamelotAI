'use client'

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import MessageRenderer from './MessageRenderer';
import { ChatDisplayProps } from '@/app/types/chatTypes';
import notifyUser from '@/app/utils/notifyUser';

export default function ChatDisplay({
  messages,
  audioLoading,
  requestTextToSpeech,
  messageListRef,
  audioRef,
  sourcesForMessages,
  userProfilePic,
  extractSourcePageNumber,
  handleSampleQuestionClick,
  sampleQuestions,
  isLoading,
  navigateToDocumentPage,
  error,
  documentNameToIdMap,
  documents
}: ChatDisplayProps) {

  // Setting the ref for scrolling functionality
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Effect to scroll to the bottom of the chat on new messages
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]); 

  // Added conditional check for prop handleSampleQuestionClick:
  const enhancedHandleSampleQuestionClick = (question: string) => {
    if (documents.length > 0) {
      handleSampleQuestionClick(question);
    } else {
      notifyUser("No documents found. Please upload documents first.", { type: "error" });
    }
  };

  return (
    <div className="no-scrollbar flex min-h-min w-full items-center justify-center border sm:h-[45vh]">
      <div
        ref={messageListRef}
        className="no-scrollbar mt-4 h-full w-full overflow-y-scroll rounded-md"
      >
        {error && (
          <div className="p-4 text-center text-red-600">
            {error}
          </div>
        )}
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-xl">
            <div className="flex flex-col items-center p-4">
              {/* Chatbot avatar and greeting */}
              <Image
                src="/camelot-mono-no-bg.png"
                alt="Chatbot Avatar"
                width={50}
                height={50}
              />
              <p className="mt-2 text-lg">
                How can I assist you with your documents?
              </p>
            </div>
            {/* Sample questions */}
            <div className="flex flex-wrap justify-center gap-2 p-4">
              {sampleQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => enhancedHandleSampleQuestionClick(question)}
                  className="cursor-pointer rounded-full dark:bg-gun-gray px-4 py-2 text-white hover:bg-gray-600"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageRenderer
              key={index}
              message={message}
              index={index}
              sourcesForMessages={sourcesForMessages}
              extractSourcePageNumber={extractSourcePageNumber}
              userProfilePic={userProfilePic}
              navigateToDocumentPage={navigateToDocumentPage}
              isLoading={isLoading}
              requestTextToSpeech={requestTextToSpeech}
              audioLoading={audioLoading}
              audioRef={audioRef}
              documentNameToIdMap={documentNameToIdMap}
            />
          ))
        )}
        {/* Invisible div at the end of messages for automatic scrolling */}
        <div ref={endOfMessagesRef} />
      </div>
    </div>
  );
}

