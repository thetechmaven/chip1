import type * as TelegramBotTypes from 'node-telegram-bot-api';
import prisma from '../../prisma/prisma';
import { messageHistory } from '.';
import {
  UPDATE_PROFILE,
  USER_TYPE_BRAND,
  USER_TYPE_CREATOR,
} from '../contants';
const TelegramBot = require('node-telegram-bot-api');

const handleUserType = async (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
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
  };
  const [command, data] = query.data?.split(':') || [];
  console.log('COMMAND>>', command, data);
  if (command && command in register) {
    register[command](bot, [command, data], query);
  }
};

export default inlineQueryHandlers;
