'use server'

import { ElevenLabsClient } from "elevenlabs";

// Function to fetch voices from the ElevenLabs dashboard (from your account):
export default async function getVoices() {
  const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
  });

  try {
    const response = await elevenlabs.voices.getAll();
    // Filter the voices to only include the ones you want to use
    // If you do not filter the voices, all voices will be available for use (returns 30 voices by default)
    const selectedVoiceNames = [
      'Camelot',
      'Valentyna ', //space in this one is intentional
      'Natasha - Energetic Hindi Voice',
      'HYUK ', //space in this one is intentional
      'Fred animateur',
      'Alessio - positive and professional',
      'Peter Meta',
      'David Martin 2',
      'ScheilaSMTy',
      'Shannon',
    ];
    const selectedVoices = response.voices.filter(voice => 
      voice.name && selectedVoiceNames.includes(voice.name)
    );
    return selectedVoices;
  } catch (error) {
    console.error('Error fetching library voices', error);
  }
};