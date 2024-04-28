import { useCallback, useRef, useState } from 'react';
import notifyUser from '../utils/notifyUser';
import useLocalStorage from '@/app/hooks/useLocalStorage';

interface TextToSpeechHook {
  selectedVoice: string | undefined;
}

interface TextToSpeechState {
  audioLoading: Record<number, boolean>;
  requestTextToSpeech: (text: string, index: number) => Promise<void>;
  clearAllAudioUrls: () => void; 
  audioRef: React.RefObject<HTMLAudioElement>;
  error: string | null;
}

/**
 * Custom hook to manage text-to-speech functionalities.
 * 
 * @param {TextToSpeechHook} params - Configuration and dependencies for the hook.
 * @param {string} params.selectedVoice - Currently selected voice ID for TTS.
 * @returns {TextToSpeechState} - State and functions related to text-to-speech operations.
 */
export default function useTextToSpeech({ selectedVoice }: TextToSpeechHook): TextToSpeechState {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioLoading, setAudioLoading] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [savedAudioUrls, setSavedAudioUrls] = useLocalStorage<Record<string, string>>("audioUrls", {});

  const clearAllAudioUrls = useCallback(() => {
    // Clear all saved audio URLs from local storage
    setSavedAudioUrls({}); 
    if (audioRef.current) {
      audioRef.current.src = "";
    }
  }, [setSavedAudioUrls]);

  const requestTextToSpeech = useCallback(async (text: string, index: number) => {
    // Use both text and voice as the key to allow different audio URLs per voice
    const key = `${text}-${selectedVoice}`;
    // Check if the audio URL already exists in the local storage
    // Avoid making a API request if the audio URL is already saved
    const currentAudioUrl = savedAudioUrls![key];
    if (currentAudioUrl && audioRef.current) {
      audioRef.current.src = currentAudioUrl;
      audioRef.current.play();
      return;
    }
    
    try {
      setAudioLoading(prev => ({ ...prev, [index]: true }));
      const response = await fetch("/api/textToSpeech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({   
          message: text,
          voice: selectedVoice
        })
      });

      if (!response.ok) throw new Error("TTS conversion failed.");

      // Notify the user if the ElevenLabs API Key is invalid.
      if (response.status === 401) {
        notifyUser("Your ElevenLabs API Key is invalid. Kindly check and try again.", {
          type: "error",
        });
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Update local storage with the new audio URLs, including the voice in the key
      setSavedAudioUrls(prevAudioUrls => ({ ...prevAudioUrls, [key]: audioUrl }));
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play().finally(() => {
          setAudioLoading(prev => ({ ...prev, [index]: false }));
        });
      }
    } catch (error) {
      console.error(error);
      setError("Failed to fetch TTS data.");
      setAudioLoading(prev => ({ ...prev, [index]: false }));
    }
  }, [savedAudioUrls, setSavedAudioUrls, selectedVoice]);

  return { clearAllAudioUrls, requestTextToSpeech, audioLoading, audioRef, error };
};
