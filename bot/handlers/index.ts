import type * as TelegramBotTypes from 'node-telegram-bot-api';
import {
  MESSAGE_WHICH_GROUP,
  USER_TYPE_PARENT,
  USER_TYPE_TUTOR,
} from '../contants';
import inlineQueryHandlers from './inline-query-handlers';
const TelegramBot = require('node-telegram-bot-api');
import prisma from '../../prisma/prisma';
import MessageHistory from '../models/MessageHistory';
import { handleUpdateEmail, handleUpdateName } from './commandHandlers';
import { ILastMessage } from '../models/ChatMessageHistory';

export const messageHistory = new MessageHistory();

const handlers = (bot: typeof TelegramBot) => {
  bot.on('contact', async (msg: TelegramBotTypes.Message) => {
    const phone = msg.contact?.phone_number;
    const chatId = msg.chat?.id;
    await prisma.user.update({
      where: { chatId },
      data: { phone },
    });
    bot.sendMessage(
      chatId,
      'Phone number saved. Choose a user type to continue',
      {
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [
              {
                text: 'Tuition Agent/Parent',
                callback_data: USER_TYPE_PARENT,
              },
            ],
            [
              {
                text: 'Tutor',
                callback_data: USER_TYPE_TUTOR,
              },
            ],
          ],
        }),
      }
    );
  });

  type CommandHandlerArgs = {
    bot: typeof TelegramBot;
    command: string;
    message: TelegramBotTypes.Message;
    lastMessage: ILastMessage;
  };
  type CommandHandler = { [x: string]: (x: CommandHandlerArgs) => void };
  const commandHandlers: CommandHandler = {
    COMMAND_NAME: handleUpdateName,
    COMMAND_EMAIL: handleUpdateEmail,
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

    const welcomeMessage = `Hello, ${firstName}! \n${MESSAGE_WHICH_GROUP}`;

    bot.sendMessage(chatId, welcomeMessage, {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [
            {
              text: 'Tuition Agent/Parent',
              callback_data: USER_TYPE_PARENT,
            },
          ],
          [
            {
              text: 'Tutor',
              callback_data: USER_TYPE_TUTOR,
            },
          ],
        ],
      }),
    });
  });

  bot.on('callback_query', (query: TelegramBotTypes.CallbackQuery) => {
    inlineQueryHandlers(bot, query);
  });
};

export default handlers;
