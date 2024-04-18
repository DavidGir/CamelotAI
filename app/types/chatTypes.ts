export interface Message {
  id: string;
  content: string;
  role: 'assistant' | 'user' | 'function' | 'data' | 'system' | 'tool';
  createdAt?: Date | undefined;
  isSaved?: boolean;
  isLoading?: boolean;
}

export interface Source {
  id: string;
  metadata: Record<string, any>;
}

export interface ChatDisplayProps {
  messages: Message[];
  audioLoading: Record<number, boolean>;
  requestTextToSpeech: (text: string, index: number) => Promise<void>;
  messageListRef: React.RefObject<HTMLDivElement>;
  audioRef: React.RefObject<HTMLAudioElement>;
  sourcesForMessages: Record<string, Source[]>;
  userProfilePic: string;
  extractSourcePageNumber: (source: Source) => number;
  handleSampleQuestionClick: (question: string) => void;
  sampleQuestions: string[];
  isLoading: boolean;
  setNavigateToPage: (navigationInfo: { docIndex: number, pageNumber: number }) => void;
  selectedDocIndex: number;
  error: string | null;
}

export interface ChatFormProps {
  isLoading: boolean;
  input: string;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  handleEnter: (event: React.KeyboardEvent) => void;
  handleSaveChat: () => void;
  handleDeleteChat: () => void;
  hasChats: boolean;
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
  hasUnsavedMessages: boolean;
}