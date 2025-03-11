import prisma from '../../prisma/prisma';
import type * as TelegramBotTypes from 'node-telegram-bot-api';
import { dealUsingOpenAi } from './openai';
import { getSystemPrompt } from './getSystemPrompt';

export const dealOpenaiWrapper = async (chatId: number, newMessage: any[]) => {
  const group = await prisma.group.findUnique({
    where: { groupChatId: chatId },
  });
  if (!group) {
    return 'Group not found';
  }
  if (!group.chat) {
    group.chat = [newMessage].flat();
  } else {
    group.chat = [...(group.chat as any), ...newMessage].flat();
  }
  const updatedGroup = await prisma.group.update({
    where: { groupChatId: chatId },
    data: {
      chat: group.chat,
    },
  });
  return dealUsingOpenAi(updatedGroup.chat);
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
    const prompt =
      `Hello Chip!` +
      `Below are the details of creator. You are manager of the creator: \n` +
      `${Object.keys(user)
        .map((key: any) => `${key}: ${(user as any)[key]}`)
        .join('\n')}\n` +
      `Creators packages are: \n` +
      `${packages
        .map(
          (p: any) =>
            `${p.name}(Price: ${p.price} USD${
              p.negotiation ? ` with a ± ${p.negotiation}%` : ``
            }): ${p.description || 'No Description'}`
        )
        .join('\n')}\n` +
      `Now, your role will be inform my clients about the creators packages and negotiate with them. Dont tell them negotiation limit but try to make a good deal. Dont let the client go!`;
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
