import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/utils/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('sessionId');
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized access: User ID required' }, { status: 401 });
  }

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
  }

  try {
    const chat = await prisma.chat.findFirst({
      where: {
        userId,
        sessionId
      },
      include: {
        messages: true,
      },
    });

    if (!chat) {
      return NextResponse.json({ error: 'No chat found for this session' }, { status: 404 });
  }

  return NextResponse.json({ chatId: chat.id, messages: chat.messages }, { status: 200 });
  } catch (error) {
    console.error('Failed to retrieve chats:', error);
    return NextResponse.json({ error: 'Failed to retrieve chats due to an internal server error.', details: error}, { status: 500 });
  }
};
