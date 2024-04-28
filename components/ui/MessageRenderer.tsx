'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Markdown from 'react-markdown';
import { FaVolumeHigh } from 'react-icons/fa6';
import { SpinnerDotted } from 'spinners-react';
import { Message, Source } from '@/app/types/chatTypes';
import { AiOutlineDown, AiOutlineUp } from 'react-icons/ai';

export interface MessageRendererProps {
  message: Message;
  index: number;
  sourcesForMessages: Record<string, Source[]>;
  extractSourcePageNumber: (source: Source) => number;
  userProfilePic: string;
  navigateToDocumentPage: ( docId: string, pageNumber: number) => void;
  isLoading: boolean;
  requestTextToSpeech: (text: string, index: number) => Promise<void>;
  audioLoading: Record<number, boolean>;
  audioRef: React.RefObject<HTMLAudioElement>;
  documentNameToIdMap: Record<string, string>;
}

// A functional component for rendering individual messages
export default function MessageRenderer({
  message,
  index,
  sourcesForMessages,
  extractSourcePageNumber,
  userProfilePic,
  navigateToDocumentPage,
  isLoading,
  requestTextToSpeech,
  audioLoading,
  audioRef,
  documentNameToIdMap
}: MessageRendererProps) {
  const sources: Source[] = sourcesForMessages[index] || [];
  const isLastMessage: boolean =
    !isLoading && index === Number(sourcesForMessages.length) - 1;
  const previousMessages: boolean =
    index !== Number(sourcesForMessages.length) - 1;

  const uniqueAndSortedSources = useMemo(() => {
    const uniqueSources = sources.filter((source, index, self) =>
      self.findIndex(s => extractSourcePageNumber(s) === extractSourcePageNumber(source)) === index
    );
    return uniqueSources.sort((a, b) => extractSourcePageNumber(a) - extractSourcePageNumber(b));
  }, [sources, extractSourcePageNumber]);


  const groupedSources = useMemo(() => {
    return uniqueAndSortedSources.reduce((acc: any, source) => {
      const docName = source.metadata.docstore_document_name || "Unknown Document";
      if (!acc[docName]) {
        acc[docName] = [];
      }
      acc[docName].push(extractSourcePageNumber(source));
      return acc;
    }, {});
  }, [uniqueAndSortedSources, extractSourcePageNumber]);

  const [collapsedSources, setCollapsedSources] = useState(() => {
    const initialCollapsedState: Record<string, boolean> = {};
    Object.keys(groupedSources).forEach(docName => {
      initialCollapsedState[docName] = true; // Start all collapsed
    });
    return initialCollapsedState;
  });
  
  // Function to toggle individual source collapse state
  const toggleSourceCollapse = (docName: string) => {
    setCollapsedSources((prev) => ({ ...prev, [docName]: !prev[docName] }));
  };

  const handlePageClick = (docName: string, page: number) => {
    const docId = documentNameToIdMap[docName];
    if (docId) {
      navigateToDocumentPage(docId, page);
    } else {
      console.error("No document ID found for document name:", docName);
    }
  };

  // Only display sources for the assistant's message if they are available
  const showSources = message.role === 'assistant' && sources.length > 0;

  return (
    <div key={`chatMessage-${index}`} className="flex flex-col justify-between">
      <div
        className={`p-4 text-black ${
          message.role === 'assistant'
            ? 'bg-gray-100'
            : isLoading && index === Number(sourcesForMessages.length) - 1
              ? 'animate-pulse bg-white'
              : 'bg-white'
        }`}
      >
        {message.role === 'assistant' ? (
          // For the assistant's messages, show the chatbot icon on the left
          <div className="flex items-start">
            <div
              className="mr-4 flex flex-col items-center"
              style={{ flexShrink: 0 }}
            >
              <Image
                src="/camelot-mono-no-bg.png"
                alt="assistant image"
                width="35"
                height="30"
                className="flex-shrink-0 rounded-full"
                priority
              />
              <button
                title="Play audio response"
                className="mt-2 flex-shrink-0"
                onClick={() => requestTextToSpeech(message.content, index)}
              >
                {audioLoading[index] ? (
                  <SpinnerDotted
                    size={20}
                    thickness={100}
                    speed={140}
                    color="rgba(0, 0, 0, 1)"
                  />
                ) : (
                  <FaVolumeHigh />
                )}
              </button>
              {/* Audio element for playing response */}
              <audio
                ref={audioRef}
                controls
                style={{ display: 'none' }}
              ></audio>
            </div>
            <Markdown className="prose">{message.content}</Markdown>
          </div>
        ) : (
          // For the user's messages, show the profile image on the right
          <div className="flex items-center justify-end">
            <Markdown className="prose">{message.content}</Markdown>
            <Image
              src={userProfilePic}
              alt="user image"
              width="33"
              height="30"
              className="ml-4 rounded-full"
              priority
            />
          </div>
        )}
        {/* Display the sources */}
        {showSources && (isLastMessage || previousMessages) && (
          <>
            <hr className="my-5 border border-gray-200" />
            <h4 className="mb-2 ml-14 text-sm font-semibold text-gray-700">
              Relevant Sources:
            </h4>
            <div className="ml-14 mt-3 flex space-x-4">
              {/* Grouped sources by document */}
              {Object.entries(groupedSources).map(([docName, pages]) => (
                <div key={docName}>
                  <button
                    onClick={() => toggleSourceCollapse(docName)}
                    className="flex items-center justify-between gap-2 rounded-lg border bg-gray-200 px-3 py-1 text-sm transition hover:bg-gray-100"
                  >
                    {docName}
                    {collapsedSources[docName] ? (
                      <AiOutlineDown />
                    ) : (
                      <AiOutlineUp />
                    )}
                  </button>
                  {!collapsedSources[docName] && (
                    <div className="mt-2 flex flex-wrap">
                      {(pages as number[])
                        .sort((a, b) => a - b)
                        .map((page: number, idx: number) => (
                          <button
                            key={`${docName}-${page}-${idx}`}
                            className="mb-2 mr-2 rounded-lg border bg-gray-200 px-3 py-1 text-sm transition hover:bg-gray-100"
                            onClick={() => handlePageClick(docName, page)}
                          >
                            p. {page}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
