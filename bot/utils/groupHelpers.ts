import prisma from '../../prisma/prisma';
import type * as TelegramBotTypes from 'node-telegram-bot-api';
import { dealUsingOpenAi } from './openai';
import { getSystemPrompt } from './getSystemPrompt';
import getText from '../../utils/getText';

const getGroupMessages = async (groupId: number) => {
  try {
    const group = await prisma.group.findUnique({
      where: { groupChatId: groupId },
      select: { chat: true },
    });
    return Array.isArray(group?.chat) ? group?.chat : [];
  } catch (error) {
    console.error('Error getting group messages:', error);
    return [];
  }
};

const callOpenAI = async (messages: any[]) => {
  try {
    return await dealUsingOpenAi(messages);
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
};

const saveMessageToGroup = async (
  groupId: number,
  messages: any[],
  response: string
) => {
  try {
    const group = await prisma.group.findUnique({
      where: { groupChatId: groupId },
    });

    if (group) {
      // Get existing chat or initialize empty array
      const existingChat = Array.isArray(group.chat) ? group.chat : [];

      // Add new messages and response
      const updatedChat = [
        ...existingChat,
        ...messages,
        { role: 'assistant', content: [{ type: 'text', text: response }] },
      ];

      // Trim chat history if it gets too long (keep last 20 messages)
      const trimmedChat = updatedChat.slice(-20);

      // Update database
      await prisma.group.update({
        where: { groupChatId: groupId },
        data: { chat: trimmedChat },
      });
    }
  } catch (error) {
    console.error('Error saving message to group:', error);
  }
};

export const dealOpenaiWrapper = async (
  groupId: number,
  messages: any[],
  clearHistory = false
) => {
  try {
    // If clearHistory is true, don't fetch previous messages
    const previousMessages = clearHistory
      ? []
      : await getGroupMessages(groupId);

    // Ensure previousMessages is an array
    const prevMsgs = Array.isArray(previousMessages) ? previousMessages : [];

    // Combine previous messages with new ones
    const allMessages = [...prevMsgs, ...messages];

    // Call OpenAI
    const response = await callOpenAI(allMessages);

    // Save response unless we're in clearHistory mode
    if (!clearHistory) {
      await saveMessageToGroup(groupId, messages, response);
    }

    return response;
  } catch (error) {
    console.error('Error communicating with OpenAI:', error);
    throw error;
  }
};

const groupCreatorMap: {
  [key: number]: {
    creator: number;
  };
} = {};

export const getChatId = (message: TelegramBotTypes.Message) => {
  return message.chat.id;
};

export const sendRequestToEliza = async (chatId: number, prompt: string) => {
  const response = await fetch(
    'http://localhost:3000/d9524aeb-bd0d-010a-bc17-876c2543336a/message',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: prompt,
        user: 'u' + chatId,
      }),
    }
  );
  const data = await response.json();
  return data;
};

const creators: any = {};
export const getKnowledgeBase = async (chatId: number) => {
  let creator = creators[chatId];
  if (!creator) {
    const user = await prisma.group.findFirst({
      where: { groupChatId: chatId },
      include: {
        creator: {
          include: {
            packages: true,
          },
        },
      },
    });
    creator = user?.creator;
    creators[chatId] = creator;
  }
  if (creator) {
    const packages = creator.packages;
    const knowledgebase =
      `Content creator details: \n` +
      `${Object.keys(creator)
        .map((key: any) => `${key}: ${(creator as any)[key]}`)
        .join('\n')}\n` +
      `${
        creator.negotiation
          ? `Content Creator negotiation limit: ${creator.negotiation}`
          : ``
      }` +
      `Content creator packages: \n` +
      `${packages
        .map(
          (p: any) =>
            `${p.name}(Price: ${p.price} USD${
              p.negotiation ? ` with a ± ${p.negotiation}%` : ``
            }): ${p.description || 'No Description'}`
        )
        .join('\n')}\n`;
    return knowledgebase;
  }
};

export const initGroup = async (message: TelegramBotTypes.Message) => {
  const document = await prisma.user.findUnique({
    where: { chatId: message.from?.id },
    include: {
      packages: true,
    },
  });
  if (document) {
    const systemPrompt = await getSystemPrompt();
    const { packages, ...user } = document;
    const creatorDetails = Object.keys(user)
      .map((key: any) => `${key}: ${(user as any)[key]}`)
      .join('\n');
    const packagesDetails = packages
      .map(
        (p: any) =>
          `${p.name}(Price: ${p.price} USD${
            p.negotiation ? ` with a ± ${p.negotiation}%` : ``
          }): ${p.description || 'No Description'}`
      )
      .join('\n');

    // Use raw query or alternative approach since 'prompt' isn't in PrismaClient
    // Option 1: Define a default prompt if table doesn't exist
    const defaultPrompt =
      "I'm a content creator assistant. My details: {{creatorDetails}}. My packages: {{packagesDetails}}";
    let promptValue = defaultPrompt;

    try {
      // Option 2: Try to use Prisma's $queryRaw if you need to access the prompt table
      // const promptRecord = await prisma.$queryRaw`SELECT value FROM "Prompt" WHERE key = 'group_userPrompt' LIMIT 1`;
      // promptValue = promptRecord?.[0]?.value || defaultPrompt;
    } catch (err) {
      console.warn('Could not fetch prompt from database, using default');
    }

    const prompt = getText(promptValue, {
      creatorDetails,
      packagesDetails,
    });

    return dealOpenaiWrapper(getChatId(message), [
      {
        role: 'system',
        content: [
          {
            type: 'text',
            text: prompt,
          },
        ],
      },
      {
        role: 'system',
        content: [
          {
            type: 'text',
            text: systemPrompt,
          },
        ],
      },
    ]);
  }
};

export const initGroupv1 = async (message: TelegramBotTypes.Message) => {
  const document = await prisma.user.findUnique({
    where: { chatId: message.from?.id },
    include: {
      packages: true,
    },
  });
  if (document) {
    const { packages, ...user } = document;
    const prompt =
      `Hello Chip!` +
      `Im a content creator. Here are my details: \n` +
      `${Object.keys(user)
        .map((key: any) => `${key}: ${(user as any)[key]}`)
        .join('\n')}\n` +
      `My packages are: \n` +
      `${packages
        .map(
          (p: any) =>
            `${p.name}(Price: ${p.price} USD${
              p.negotiation ? ` with a ± ${p.negotiation}%` : ``
            }): ${p.description || 'No Description'}`
        )
        .join('\n')}\n` +
      `Now, your role will be inform my clients about my package and negotiate with them. Dont tell them negotiation limit but try to make a good deal. Dont let the client go!`;
    console.log('Prompt: ', prompt);
    sendRequestToEliza(getChatId(message), prompt);
  }
};

export const isCreatorGroup = async (
  message: TelegramBotTypes.Message
): Promise<{ isCreator: boolean; isNewGroup?: boolean }> => {
  const chatId = getChatId(message);
  if (chatId in groupCreatorMap) {
    return { isCreator: groupCreatorMap[chatId].creator === message.from?.id };
  } else {
    let isNewGroup = false;
    let group = await prisma.group.findUnique({
      where: { groupChatId: chatId },
      include: {
        creator: true,
      },
    });
    if (!group) {
      const user = await prisma.user.findUnique({
        where: { chatId: message.from?.id },
      });
      if (!user) {
        return { isCreator: false };
      }
      isNewGroup = true;
      group = await prisma.group.create({
        data: {
          groupChatId: chatId,
          creatorId: user?.id as string,
          name: message.chat.title as string,
          chat: [],
        },
        include: {
          creator: true,
        },
      });
    }
    groupCreatorMap[chatId] = { creator: group.creator.chatId };
    return { isCreator: group.creator.chatId === message.from?.id, isNewGroup };
  }
};
