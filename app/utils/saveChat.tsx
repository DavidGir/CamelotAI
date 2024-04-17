import prisma from '../utils/prisma';

export async function saveChat(
  newMessages: { content: string; role: string }[],
  userId: string,
  documentId: string
) {
  return await prisma.$transaction(async (prisma) => {
    // Check if a chat session exists
    let chat = await prisma.chat.findFirst({
      where: {
        documentId: documentId,
        userId: userId
      }
    });

    // If no chat exists, create one
    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          userId: userId,
          documentId: documentId
        }
      });
    }

    // Check existing messages to prevent duplicates
    const existingMessagesContent = await prisma.message.findMany({
        where: {
          chatId: chat.id,
        },
        select: {
          content: true,
        },
    });
    const existingMessagesContentSet = new Set(existingMessagesContent.map(message => message.content));
   
    // Filter out messages that have already been saved
    const messagesToSave = newMessages.filter(message => !existingMessagesContentSet.has(message.content));

    // Save new unique messages and mark them as saved
    if (messagesToSave.length > 0) {
      await prisma.message.createMany({
        data: messagesToSave.map(message => ({
          content: message.content,
          chatId: chat.id,
          role: message.role,
          isSaved: true
        })),
        skipDuplicates: true,
      });
    }

    return { chat };
  });
};