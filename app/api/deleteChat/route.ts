import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/utils/prisma';
import { auth } from '@clerk/nextjs/server';

export async function DELETE(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    const { userId } = auth();

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: 'Session ID and User ID are required' },
        { status: 400 },
      );
    }

    // Deleting the chat associated with the documentId for the userId
    const chat = await prisma.chat.deleteMany({
      where: {
        sessionId,
        userId,
      },
    });

    if (chat.count === 0) {
      return NextResponse.json(
        { message: 'No chat found or already deleted' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: 'Chat session deleted successfully' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Failed to delete chat:', error);
    return NextResponse.json(
      { error: 'Failed to delete chat due to an internal error' },
      { status: 500 },
    );
  }
}
