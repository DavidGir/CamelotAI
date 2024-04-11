import { ElevenLabsClient } from "elevenlabs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { message, voice } = await req.json();

  const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY
  });

  try {
    const audio = await elevenlabs.generate({
      voice,
      model_id: "eleven_monolingual_v1",
      voice_settings: { similarity_boost: 0.5, stability: 0.5 },
      text: message
    });

    return new NextResponse(audio as any, {
      headers: { "Content-Type": "audio/mpeg" }
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(error, { status: error.statusCode });
  }
}



