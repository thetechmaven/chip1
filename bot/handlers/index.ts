import type * as TelegramBotTypes from 'node-telegram-bot-api';
import inlineQueryHandlers from './inline-query-handlers';
const TelegramBot = require('node-telegram-bot-api');
import prisma from '../../prisma/prisma';
import MessageHistory from '../models/MessageHistory';
import {
  handleCommandAddPackage,
  handleCommandUpdatePackage,
  handleFindCreators,
  handleNewUser,
  handleOther,
  handleProfileCommand,
  handleReceiveUpdateProfile,
  handleSendProfile,
  handleUpdateName,
  handleUpdatePicture,
  handleXLink,
  viewMyPackages,
} from './commandHandlers';
import { ILastMessage } from '../models/ChatMessageHistory';
import { deleteLastMessage } from '../utils/message';
import { getCommandAndData } from '../utils/getCommand';
import { USER_TYPE_BRAND, USER_TYPE_CREATOR } from '../contants';
import { groupHandler } from './groupHandlers';
import { buyerCommands, sellerCommands } from '../prompts/commandPrompts';
import { isXLink } from '../utils/isXLink';

export const messageHistory = new MessageHistory();

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
    UPDATE_PACKAGE: handleCommandUpdatePackage,
    COMMAND_VIEW_PACKAGES: viewMyPackages,
    COMMAND_VIEW_PROFILE: handleSendProfile,
    COMMAND_OTHER: handleOther,
    COMMAND_FIND_CREATORS: handleFindCreators,
  };

  bot.on('message', async (msg: TelegramBotTypes.Message) => {
    if (msg.text?.indexOf('/') === 0) {
      return;
    }
    if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
      console.log(`Message from [${msg.chat.title}]: ${msg.text}`);
      groupHandler(bot, msg);
    }
    const user = await prisma.user.findUnique({
      where: { chatId: msg.chat.id },
    });
    if (!user) {
      return;
    }
    if (isXLink(msg.text || '') && user.userType === USER_TYPE_CREATOR) {
      handleXLink({
        bot,
        message: msg,
        command: '',
      });
      return;
    }
    let command = messageHistory.getSuperCommand(msg.chat.id);
    if (!command) {
      const response = await getCommandAndData(
        msg.text || '',
        user.userType === USER_TYPE_BRAND ? buyerCommands : sellerCommands,
        msg.chat.id
      );
      command = response.command;
    }
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

  bot.onText(/\/profile/, async (msg: TelegramBotTypes.Message) => {
    handleProfileCommand({ bot, message: msg, command: '' });
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
