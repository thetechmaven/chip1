import type * as TelegramBotTypes from 'node-telegram-bot-api';
import prisma from '../../prisma/prisma';
import { messageHistory } from '.';
const TelegramBot = require('node-telegram-bot-api');

const handleUserType = async (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  if (query.message?.chat.id) {
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
  };
  const [command, data] = query.data?.split(':') || [];
  console.log('COMMAND>>', command, data);
  if (command && command in register) {
    register[command](bot, [command, data], query);
  }
};

export default inlineQueryHandlers;
