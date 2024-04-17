import React from 'react';
import Image from 'next/image';
import MessageRenderer from './MessageRenderer';
import { ChatDisplayProps } from '@/app/types/chatTypes';

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
  setNavigateToPage,
  selectedDocIndex,
  error
}: ChatDisplayProps) {
  return (
    <div className="no-scrollbar flex h-[80vh] min-h-min w-full items-center justify-center border bg-white sm:h-[85vh]">
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
                src="/logo.png"
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
                  onClick={() => handleSampleQuestionClick(question)}
                  className="cursor-pointer rounded-full bg-black px-4 py-2 font-bold text-white hover:bg-gray-700"
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
              setNavigateToPage={setNavigateToPage}
              selectedDocIndex={selectedDocIndex}
              isLoading={isLoading}
              requestTextToSpeech={requestTextToSpeech}
              audioLoading={audioLoading}
              audioRef={audioRef}
            />
          ))
        )}
      </div>
    </div>
  );
}

