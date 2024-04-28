import { NextRequest, NextResponse } from 'next/server';
import { saveChat } from '@/app/utils/saveChat';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { messages, sessionId } = await request.json();
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required to save chats.' }, { status: 401 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required to save chat instance.' }, { status: 400 });
    }

    // Validate the format of messages; they should be objects with content and role
    if (!Array.isArray(messages) || messages.some(msg => typeof msg.content !== 'string' || !['user', 'assistant'].includes(msg.role))) {
      return NextResponse.json({ error: 'Invalid messages format.' }, { status: 400 });
    }

    const { chat } = await saveChat(messages, userId, sessionId);
    
    return NextResponse.json({
      message: `Chat saved with ID: ${chat.id}.`,
    }, { status: 200 });
  } catch (error) {
    console.error('Error saving chat:', error);
    return NextResponse.json({ error: 'Server error while saving chat.' }, { status: 500 });
  }
};



