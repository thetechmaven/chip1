import type * as TelegramBotTypes from 'node-telegram-bot-api';
import inlineQueryHandlers from './inline-query-handlers';
const TelegramBot = require('node-telegram-bot-api');
import prisma from '../../prisma/prisma';
import MessageHistory from '../models/MessageHistory';
import {
  handleNewUser,
  handleReceiveUpdateProfile,
  handleUpdateName,
  handleUpdatePicture,
} from './commandHandlers';
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
    COMMAND_RECEIVE_UPDATE_PROFILE: handleReceiveUpdateProfile,
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

    let user = await prisma.user.findUnique({ where: { chatId } });
    console.log(user?.userType);
    if (user && user.userType) {
      let message = '';
      if (user.userType === 'BRAND') {
        message = "Hey there, brand owner! Let's choose what you want to do";
      } else {
        message =
          'Hey there, creative genius! 🚀 Let’s make magic happen! Choose an option to continue 🌟';
      }
      bot.sendMessage(chatId, message, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '👤 View Profile',
                callback_data: 'VIEW_PROFILE',
              },
            ],
            [
              {
                text: '✏️ Update Profile',
                callback_data: 'UPDATE_PROFILE',
              },
            ],
            ...(user.userType === 'BRAND'
              ? [
                  [
                    {
                      text: '🔍 Find Creators',
                      callback_data: 'FIND_CREATORS',
                    },
                  ],
                ]
              : [
                  [
                    {
                      text: '📦 View My Packages',
                      callback_data: 'VIEW_PACKAGES',
                    },
                    {
                      text: '➕ Create Package',
                      callback_data: 'CREATE_PACKAGE',
                    },
                  ],
                ]),
          ],
        },
      });
    } else {
      handleNewUser({ bot, message: msg, command: '' });
    }
  });

  bot.on('callback_query', (query: TelegramBotTypes.CallbackQuery) => {
    inlineQueryHandlers(bot, query);
  });
};

export default handlers;
