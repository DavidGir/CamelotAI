import Image from 'next/image';
import Markdown from 'react-markdown';
import { FaVolumeHigh } from 'react-icons/fa6';
import { SpinnerDotted } from 'spinners-react';
import { Message, Source } from '@/app/types/chatTypes';

export interface MessageRendererProps {
  message: Message;
  index: number;
  sourcesForMessages: Record<string, Source[]>;
  extractSourcePageNumber: (source: Source) => number;
  userProfilePic: string;
  setNavigateToPage: (navigationInfo: {
    docIndex: number;
    pageNumber: number;
  }) => void;
  selectedDocIndex: number;
  isLoading: boolean;
  requestTextToSpeech: (text: string, index: number) => Promise<void>;
  audioLoading: Record<number, boolean>;
  audioRef: React.RefObject<HTMLAudioElement>;
}

// A functional component for rendering individual messages
export default function MessageRenderer({
  message,
  index,
  sourcesForMessages,
  extractSourcePageNumber,
  userProfilePic,
  setNavigateToPage,
  selectedDocIndex,
  isLoading,
  requestTextToSpeech,
  audioLoading,
  audioRef,
}: MessageRendererProps) {
  const sources: Source[] = sourcesForMessages[index] || [];
  const isLastMessage: boolean =
    !isLoading && index === Number(sourcesForMessages.length) - 1;
  const previousMessages: boolean =
    index !== Number(sourcesForMessages.length) - 1;
  const uniqueAndSortedSources: Source[] = sources
    .filter(
      (source: Source, index: number, self: Source[]) =>
        index ===
        self.findIndex(
          (s: Source) =>
            extractSourcePageNumber(s) === extractSourcePageNumber(source),
        ),
    )
    .sort(
      (a: Source, b: Source) =>
        extractSourcePageNumber(a) - extractSourcePageNumber(b),
    );

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
                src="/logo.png"
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
        {(isLastMessage || previousMessages) && sources && (
          <>
            <div className="ml-14 mt-3 flex space-x-4">
              {uniqueAndSortedSources.map((source: Source) => (
                <button
                  key={`source-${extractSourcePageNumber(source)}`}
                  className="rounded-lg border bg-gray-200 px-3 py-1 transition hover:bg-gray-100"
                  onClick={() => {
                    const pageNumber = extractSourcePageNumber(source);
                    // Update the navigateToPage state to indicate the desired document and page
                    setNavigateToPage({
                      docIndex: selectedDocIndex,
                      pageNumber: pageNumber - 1,
                    });
                  }}
                >
                  p. {extractSourcePageNumber(source)}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
