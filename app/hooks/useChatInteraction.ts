import { useCallback } from 'react';

// Function to programmatically submit a sample question to the chat
export default function useChatInteraction(input: string, setInput: (input: string) => void, textAreaRef: React.RefObject<HTMLTextAreaElement>) {
  interface SampleQuestion {
    question: string;
  }

  interface TextAreaRef {
    current: HTMLTextAreaElement | null;
  }

  const handleSampleQuestionClick = useCallback((question: SampleQuestion['question']) => {
    setInput(question);
    // Create and dispatch a synthetic 'Enter' key press event to submit the form
    setTimeout(() => {
      const enterKeyPressEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        bubbles: true,
      });
      (textAreaRef as TextAreaRef).current?.dispatchEvent(enterKeyPressEvent);
    }, 0);
  }, [setInput, textAreaRef]);

  return { handleSampleQuestionClick };
};