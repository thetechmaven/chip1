import type * as TelegramBotTypes from 'node-telegram-bot-api';
import inlineQueryHandlers from './inline-query-handlers';
const TelegramBot = require('node-telegram-bot-api');
import prisma from '../../prisma/prisma';
import MessageHistory from '../models/MessageHistory';
import { handleUpdateName, handleUpdatePicture } from './commandHandlers';
import { ILastMessage } from '../models/ChatMessageHistory';
import { deleteLastMessage } from '../utils/message';

export const messageHistory = new MessageHistory();

const handlers = (bot: typeof TelegramBot) => {
  type CommandHandlerArgs = {
    bot: typeof TelegramBot;
    command: string;
    message: TelegramBotTypes.Message;
    lastMessage: ILastMessage;
  };
  type CommandHandler = { [x: string]: (x: CommandHandlerArgs) => void };
  const commandHandlers: CommandHandler = {
    COMMAND_NAME: handleUpdateName,
    COMMAND_PICTURE: handleUpdatePicture,
  };

  bot.on('message', async (msg: TelegramBotTypes.Message) => {
    const lastMessage = messageHistory.getLastMessage(msg.chat.id);
    if (lastMessage?.command && lastMessage.command in commandHandlers) {
      commandHandlers[lastMessage.command]({
        bot,
        command: lastMessage.command,
        message: msg,
        lastMessage,
      });
    }
  });

  bot.onText(/\/start/, async (msg: TelegramBotTypes.Message) => {
    const chatId = msg.chat.id;
    const firstName = msg.from?.first_name;

    const welcomeMessage = `Hello`;

    bot.sendMessage(chatId, welcomeMessage, {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          //[],
        ],
      }),
    });
  });

  bot.on('callback_query', (query: TelegramBotTypes.CallbackQuery) => {
    inlineQueryHandlers(bot, query);
  });
};

export default handlers;
