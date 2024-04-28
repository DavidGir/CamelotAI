import { Voice as VoiceResponse } from 'elevenlabs/api';
import * as Select from '@radix-ui/react-select';

interface ChatVoiceProps {
  voices: VoiceResponse[];
  selectedVoice: string | undefined;
  setSelectedVoice: (voice: string | undefined) => void;
}

function createBadge(text: string, backgroundColor: string, textColor: string) {
  return (
    <span className={`inline-block font-bold text-sm px-2 py-1 rounded-md ml-2 ${backgroundColor} ${textColor}`}>
      {text}
    </span>
  );
}

export default function ChatVoice({ voices, selectedVoice, setSelectedVoice }: ChatVoiceProps) {
  // Handle selection changes
  const handleValueChange = (value: string | null) => {
    setSelectedVoice(value || undefined);
  };
  return (
    <div className="flex flex-col w-full p-4 bg-white border text-center">
      <label className="mb-2 text-md lg:text-base" htmlFor="voices">Change Camelot’s Voice:</label>
      <div className="flex justify-center items-center w-full">
      <Select.Root 
        onValueChange={handleValueChange} 
        value={selectedVoice}
      >
        <Select.Trigger 
          className="flex justify-between px-4 py-2 bg-white border rounded-lg cursor-pointer w-full"
          placeholder="Select a voice..."
        >
          <Select.Value placeholder="Select a voice..." />
          <Select.Icon />
        </Select.Trigger>
        <Select.Content 
          className="bg-white rounded-lg shadow-lg"
        >
          <Select.Viewport>
            {voices.map((voice) => (
              <Select.Item key={voice.voice_id} value={voice.voice_id} className="flex justify-between items-center px-4 py-2 hover:bg-gray-100 cursor-pointer w-full">
                <Select.ItemText>{voice.name}</Select.ItemText>
                <div className="flex items-center">
                  {voice.labels?.language && createBadge(voice.labels.language, 'bg-blue-200', 'text-blue-800')}
                  {voice.labels?.accent && createBadge(voice.labels.accent, 'bg-green-200', 'text-green-800')}
                  {voice.labels?.gender && createBadge(voice.labels.gender, 'bg-red-200', 'text-red-800')}
                  {voice.labels?.descriptive && createBadge(voice.labels.descriptive, 'bg-purple-200', 'text-purple-800')}
                  {voice.labels?.use_case && createBadge(voice.labels.use_case, 'bg-yellow-200', 'text-yellow-800')}
                </div>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Root>
      </div>
    </div>
  );
}
