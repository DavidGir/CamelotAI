import { NextRequest, NextResponse } from 'next/server';
import { saveChat } from '@/app/utils/saveChat';
import { getAuth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { messages, documentId } = await request.json();
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required to save chats.' }, { status: 401 });
    }
    // Validate the format of messages; they should be objects with content and role
    if (!Array.isArray(messages) || messages.some(msg => typeof msg.content !== 'string' || !['user', 'assistant'].includes(msg.role))) {
      return NextResponse.json({ error: 'Invalid messages format.' }, { status: 400 });
    }

    if (typeof documentId !== 'string' || !documentId.trim()) {
      return NextResponse.json({ error: 'Invalid document ID.' }, { status: 400 });
    }

    const { chat } = await saveChat(messages, userId, documentId);
    
    return NextResponse.json({
      message: `Chat saved with ID: ${chat.id}.`,
    }, { status: 200 });
  } catch (error) {
    console.error('Error saving chat:', error);
    return NextResponse.json({ error: 'Server error while saving chat.' }, { status: 500 });
  }
};



