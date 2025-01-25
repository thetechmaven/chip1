import type * as TelegramBotTypes from 'node-telegram-bot-api';
import inlineQueryHandlers from './inline-query-handlers';
const TelegramBot = require('node-telegram-bot-api');
import prisma from '../../prisma/prisma';
import MessageHistory from '../models/MessageHistory';
import {
  handleCommandAddPackage,
  handleFindCreators,
  handleNewUser,
  handleOther,
  handleReceiveUpdateProfile,
  handleSendProfile,
  handleUpdateName,
  handleUpdatePicture,
  viewMyPackages,
} from './commandHandlers';
import { ILastMessage } from '../models/ChatMessageHistory';
import { deleteLastMessage } from '../utils/message';
import { getCommandAndData } from '../utils/getCommand';
import { USER_TYPE_BRAND } from '../contants';

export const messageHistory = new MessageHistory();

export const sellerCommands = {
  VIEW_PROFILE: {
    condition: 'Choose this command if user wants to view his profile',
  },
  ADD_PACKAGE: {
    condition:
      'Choose this command if the creator has sent a message in which he asks to save/create/add a package',
    commandPrompt: 'The user is a creator and wants to add a package.',
    data: {
      name: {
        details: 'Name of the package',
        required: true,
      },
      description: {
        details:
          'Description of the package, nicely formatted. Empty string if missing',
        required: false,
      },
      price: {
        details: 'Price of the package. It should be a float number',
        required: true,
      },
      negotitationLimit: {
        details: 'Negotiation limit. 0 if missing',
        required: false,
      },
    },
  },
  UPDATE_PROFILE: {
    condition: 'Choose if user want to update their profile',
  },
  VIEW_PACKAGES: {
    condition: 'Choose this command if you the user wants to view his packages',
  },
  OTHER: {
    condition:
      'Choose this command if you want to do something else or the user has asked a suggestion or a question. Also choose other if user is asking what data in their profile or packages is missing. Choose other if user is asking how can they improve their packages',
  },
};

const buyerCommands = {
  FIND_CREATORS: {
    condition: 'Choose this command if you want to find creators',
  },
  UPDATE_PROFILE: {
    condition: 'Choose if user want to update their profile',
  },
  VIEW_PROFILE: {
    condition: 'Choose this command if user wants to view his profile',
  },
  OTHER: {
    condition:
      'Choose this command if you want to do something else or the user has asked a suggestion or a question. Also choose other if user is asking what data in their profile or search is missing.',
  },
};

const handlers = (bot: typeof TelegramBot) => {
  type CommandHandlerArgs = {
    bot: typeof TelegramBot;
    command: string;
    message: TelegramBotTypes.Message;
    lastMessage: ILastMessage | undefined;
  };
  type CommandHandler = { [x: string]: (x: CommandHandlerArgs) => void };
  const commandHandlers: CommandHandler = {
    COMMAND_NAME: handleUpdateName,
    COMMAND_PICTURE: handleUpdatePicture,
    COMMAND_RECEIVE_UPDATE_PROFILE: handleReceiveUpdateProfile,
    COMMAND_UPDATE_PROFILE: handleReceiveUpdateProfile,
    COMMAND_ADD_PACKAGE: handleCommandAddPackage,
    COMMAND_VIEW_PACKAGES: viewMyPackages,
    COMMAND_VIEW_PROFILE: handleSendProfile,
    COMMAND_OTHER: handleOther,
    COMMAND_FIND_CREATORS: handleFindCreators,
  };

  bot.on('message', async (msg: TelegramBotTypes.Message) => {
    const user = await prisma.user.findUnique({
      where: { chatId: msg.chat.id },
    });
    if (!user) {
      return;
    }

    const { command } = await getCommandAndData(
      msg.text || '',
      user.userType === USER_TYPE_BRAND ? buyerCommands : sellerCommands,
      msg.chat.id
    );
    console.log('Command', command);
    const lastMessage = messageHistory.getLastMessage(msg.chat.id);
    const currentCommand = command || lastMessage?.command;
    if (currentCommand && commandHandlers[currentCommand]) {
      commandHandlers[currentCommand]({
        bot,
        command: currentCommand,
        message: msg,
        lastMessage,
      });
    } else {
      handleOther({ bot, message: msg, command: '' });
    }
  });

  bot.onText(/\/start/, async (msg: TelegramBotTypes.Message) => {
    const chatId = msg.chat.id;

    let user = await prisma.user.findUnique({ where: { chatId } });
    console.log(user?.userType);
    if (user && user.userType) {
      let message = '';
      if (user.userType === 'BRAND') {
        message = 'Hey there, brand owner! Let me know what do you need';
      } else {
        message =
          'Hey there, creative genius! 🚀 Let’s make magic happen! Send me what you want to do🌟';
      }
      bot.sendMessage(chatId, message, {});
    } else {
      handleNewUser({ bot, message: msg, command: '' });
    }
  });

  bot.on('callback_query', (query: TelegramBotTypes.CallbackQuery) => {
    inlineQueryHandlers(bot, query);
  });
};

export default handlers;
