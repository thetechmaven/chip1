import type * as TelegramBotTypes from 'node-telegram-bot-api';
import prisma from '../../prisma/prisma';
import { messageHistory } from '.';
import {
  UPDATE_PROFILE,
  USER_TYPE_BRAND,
  USER_TYPE_CREATOR,
} from '../contants';
import { sendProfile } from '../utils/send';
import bot from '..';
const TelegramBot = require('node-telegram-bot-api');

export async function sendLoadingMessage(chatId: number) {
  const message = await bot.sendMessage(chatId, '⏳ Loading...');
  return message.message_id;
}

export async function deleteMessage(
  bot: typeof TelegramBot,
  chatId: number,
  messageId: number
) {
  try {
    await bot.deleteMessage(chatId, messageId.toString());
  } catch (error) {
    console.error(
      `Failed to delete message ${messageId} in chat ${chatId}:`,
      error
    );
  }
}

const handleUserType = async (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  const loadingMessageId = await sendLoadingMessage(
    query.message?.chat.id as number
  );
  if (query.message?.chat.id) {
    const [, userType] = data;
    if (userType !== USER_TYPE_BRAND && userType !== USER_TYPE_CREATOR) {
      return;
    }
    const chatId = query.message.chat.id;
    const user = await prisma.user.update({
      where: { chatId },
      data: { userType },
    });
    const profileEmoji = userType === USER_TYPE_BRAND ? '🏢' : '🎨';
    const message = `You are now a ${userType.toLowerCase()} ${profileEmoji}. Update your profile to get started!`;
    deleteMessage(bot, chatId, loadingMessageId);
    bot.sendMessage(chatId, message, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '👨‍🎨 Update Profile',
              callback_data: UPDATE_PROFILE,
            },
          ],
        ],
      },
    });
  }
};

const handleUpdateProfile = async (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  if (query.message?.chat.id) {
    const chatId = query.message.chat.id;
    const user = await prisma.user.findUnique({ where: { chatId } });
    if (user?.userType === 'BRAND') {
      bot.sendMessage(
        chatId,
        'Alright, we’re ready to dive in. Just share your brand name along with some key details—location, industry, the works. Let’s build something legendary together!'
      );
    } else if (user?.userType === 'CREATOR') {
      bot.sendMessage(
        chatId,
        'Hey there, creative genius! 🚀 Let’s make magic happen! Drop your name, social links, and both SOL and EVM wallet addresses so we can make sure those well-deserved payments flow right into your pocket. 🕶️ Time to level up your creator! 🌟'
      );
    }
    messageHistory.setLastMessage(chatId, {
      command: 'COMMAND_RECEIVE_UPDATE_PROFILE',
    });
  }
};

const handleUpdateProfileAgain = async (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  if (query.message?.chat.id) {
    const chatId = query.message.chat.id;
    const user = await prisma.user.findUnique({ where: { chatId } });
    if (user?.userType === 'BRAND') {
      bot.sendMessage(
        chatId,
        'Just share your brand name along with some key details—location and industry which you want to update.'
      );
    } else if (user?.userType === 'CREATOR') {
      bot.sendMessage(
        chatId,
        '🕶️ Time to change! 🌟. Send us your info which you want to update'
      );
    }
    messageHistory.setLastMessage(chatId, {
      command: 'COMMAND_RECEIVE_UPDATE_PROFILE',
    });
  }
};

const handleViewProfile = async (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  const messageId = await sendLoadingMessage(query.message?.chat.id as number);
  await sendProfile({ bot, chatId: query.message?.chat.id as number });
  deleteMessage(bot, query.message?.chat.id as number, messageId);
};

const handleFindCreators = async (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  bot.sendMessage(
    query.message?.chat.id as number,
    'Todo: For next milestones'
  );
};

const handleCreatePackage = async (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  bot.sendMessage(
    query.message?.chat.id as number,
    'Todo: For next milestones'
  );
};

const handleViewPackages = async (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  bot.sendMessage(query.message?.chat.id as number, 'For next milestones');
};

const handleDeletePackage = async (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  const [, id] = data;
  const _package = await prisma.package.delete({
    where: { id },
  });
  if (_package) {
    bot.sendMessage(query.message?.chat.id as number, '🗑️ Package deleted');
  } else {
    bot.sendMessage(
      query.message?.chat.id as number,
      '📦 Package not found 🗑️'
    );
  }
};

const inlineQueryHandlers = (
  bot: typeof TelegramBot,
  query: TelegramBotTypes.CallbackQuery
) => {
  const register: {
    [x: string]: (
      bot: typeof TelegramBot,
      data: string[],
      query: TelegramBotTypes.CallbackQuery
    ) => void;
  } = {
    USER_TYPE: handleUserType,
    UPDATE_PROFILE: handleUpdateProfile,
    UPDATE_PROFILE_AGAIN: handleUpdateProfileAgain,
    VIEW_PROFILE: handleViewProfile,
    FIND_CREATORS: handleFindCreators,
    CREATE_PACKAGE: handleCreatePackage,
    VIEW_PACKAGES: handleViewPackages,
    DELETE_PACKAGE: handleDeletePackage,
  };
  const [command, data] = query.data?.split(':') || [];
  console.log('COMMAND>>', command, data);
  if (command && command in register) {
    register[command](bot, [command, data], query);
  }
};

export default inlineQueryHandlers;
