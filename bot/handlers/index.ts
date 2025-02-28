import type * as TelegramBotTypes from 'node-telegram-bot-api';
import inlineQueryHandlers from './inline-query-handlers';
const TelegramBot = require('node-telegram-bot-api');
import prisma from '../../prisma/prisma';
import MessageHistory from '../models/MessageHistory';
import {
  handleBadgeCommand,
  handleCommandAddPackage,
  handleCommandUpdatePackage,
  handleEditProfileField,
  handleFindCreators,
  handleNewUser,
  handleOther,
  handlePackageCommand,
  handleProfileCommand,
  handleReceiveUpdateProfile,
  handleSendProfile,
  handleUpdateName,
  handleUpdatePicture,
  handleXLink,
  viewMyPackages,
} from './commandHandlers';
import { ILastMessage } from '../models/ChatMessageHistory';
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
    commandData?: string;
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
    COMMAND_HANDLE_EDIT_PROFILE_FIELD: handleEditProfileField,
  };

  const commands = [
    { command: 'profile', description: 'Update your profile' },
    { command: 'badge', description: 'Get your badge' },
    { command: 'package', description: 'Manage Packages' },
  ];

  bot
    .setMyCommands(commands)
    .then(() => console.log('Bot commands set successfully'))
    .catch((err: any) => console.error('Error setting bot commands:', err));

  bot.on('message', async (msg: TelegramBotTypes.Message) => {
    if (msg.text?.indexOf('/') === 0) {
      return;
    }
    if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
      console.log(
        `Message from [${msg.chat.title}]: ${JSON.stringify(msg.text, null, 2)}`
      );
      groupHandler(bot, msg);
    }
    const user = await prisma.user.findUnique({
      where: { chatId: msg.chat.id },
    });
    if (!user) {
      return;
    }
    const lastMessage = messageHistory.getLastMessage(msg.chat.id);
    if (
      isXLink(msg.text || '') &&
      user.userType === USER_TYPE_CREATOR &&
      lastMessage?.command === 'COMMAND_RECEIVE_X_LINK'
    ) {
      handleXLink({
        bot,
        message: msg,
        command: '',
      });
      return;
    }
    let command = messageHistory.getSuperCommand(msg.chat.id);
    let commandData = '';
    if (command) {
      [command, commandData] = command.split(':');
    }
    if (!command) {
      const response = await getCommandAndData(
        msg.text || '',
        user.userType === USER_TYPE_BRAND ? buyerCommands : sellerCommands,
        msg.chat.id
      );
      command = response.command;
    }
    console.log('Command', command, commandData);
    const currentCommand = command || lastMessage?.command;
    if (currentCommand && commandHandlers[currentCommand]) {
      commandHandlers[currentCommand]({
        bot,
        command: currentCommand,
        message: msg,
        lastMessage,
        commandData,
      });
    } else {
      handleOther({ bot, message: msg, command: '' });
    }
  });

  bot.onText(/\/profile/, async (msg: TelegramBotTypes.Message) => {
    handleProfileCommand({ bot, message: msg, command: '' });
  });
  bot.onText(/\/badge/, async (msg: TelegramBotTypes.Message) => {
    handleBadgeCommand({ bot, message: msg, command: '' });
  });
  bot.onText(/\/package/, async (msg: TelegramBotTypes.Message) => {
    handlePackageCommand({ bot, message: msg, command: '' });
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
