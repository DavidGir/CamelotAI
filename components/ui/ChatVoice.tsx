import { Voice as VoiceResponse } from 'elevenlabs/api';
import Select from 'react-dropdown-select';


interface ChatVoiceProps {
  voices: VoiceResponse[];
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
}

// Function to create a badge element
const createBadge = (text: string, backgroundColor: string, color: string) => (
  <span style={{
    backgroundColor: backgroundColor,
    color: color,
    fontWeight: 'bold',
    borderRadius: '10px',
    padding: '0.1rem 0.6rem',
    fontSize: '1rem',
    marginLeft: '0.5rem',
    display: 'inline-block', 
  }}>
    {text}
  </span>
);

// Custom item renderer for Select
const customItemRenderer = ({ item, methods }: { item: any, methods: any }) => (
  <div onClick={() => methods.addItem(item)} 
  style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: '0.5rem', 
    width: '100%',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    transition: 'background-color 0.2s', 
  }}
    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f2f2f2'} // Light grey background on hover
    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} // Transparent background when not hovering
  >
    <span style={{ marginRight: 'auto' }}>{item.label}</span>
    <div style={{ display: 'flex' }}> 
      {item.language && createBadge(item.language, '#7FFFD4', '#005f60')}
      {item.accent && createBadge(item.accent, '#89CFF0', '#003459')}
      {item.gender && createBadge(item.gender, '#B0E0E6', '#005f60')}
      {item.descriptive && createBadge(item.descriptive, '#CCCCFF', '#333366')}
      {item.use_case && createBadge(item.use_case, '#A3C1AD', '#2F4F4F')}
    </div>
  </div>
);

export default function ChatVoice({ voices, selectedVoice, setSelectedVoice }: ChatVoiceProps) {
  // Create options for the Select component
  const options = voices.map(voice => ({
    label: voice.name,
    value: voice.voice_id,
    language: voice.labels?.language,
    accent: voice.labels?.accent,
    gender: voice.labels?.gender,
    descriptive: voice.labels?.descriptive,
    use_case: voice.labels?.use_case,
  })).sort((a, b) => (a.label ?? '').localeCompare(b.label ?? ''));

  // Function to handle selection changes
  const onChange = (values: any) => {
    setSelectedVoice(values[0].value);
  };

  return (
    <div className="flex flex-col w-full p-4 bg-white border text-center">
      <label className="mb-2 text-md lg:text-base" htmlFor="voices">
        Change Camelot&apos;s Voice:
      </label>
      <Select
        options={options}
        itemRenderer={customItemRenderer}
        values={options.filter(option => option.value === selectedVoice)}
        onChange={onChange}
        labelField="label"
        valueField="value"
        searchable={false}
        clearable={false}
        separator={true}
        placeholder='Select a voice...'
        className="text-black border rounded-lg text-md lg:text-base"
      />
    </div>
  );
};