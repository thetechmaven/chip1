import prisma from '../../prisma/prisma';
import type * as TelegramBotTypes from 'node-telegram-bot-api';

const groupCreatorMap: {
  [key: number]: {
    creator: number;
  };
} = {};

export const getChatId = (message: TelegramBotTypes.Message) => {
  return message.chat.id;
};

export const isCreatorGroup = async (message: TelegramBotTypes.Message) => {
  const chatId = getChatId(message);
  if (chatId in groupCreatorMap) {
    return groupCreatorMap[chatId].creator === message.from?.id;
  } else {
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
        return false;
      }
      group = await prisma.group.create({
        data: {
          groupChatId: chatId,
          creatorId: user?.id as string,
          name: message.chat.title as string,
        },
        include: {
          creator: true,
        },
      });
    }
    groupCreatorMap[chatId] = { creator: group.creator.chatId };
    console.log('Group creator map', groupCreatorMap[chatId]);
    return group.creator.chatId === message.from?.id;
  }
};
