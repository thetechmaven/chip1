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
import { config } from '../config';
import {
  COMMAND_HANDLE_EDIT_PROFILE_FIELD,
  EDIT_PROFILE_FIELD,
} from '../../constants';
const TelegramBot = require('node-telegram-bot-api');

export async function sendLoadingMessage(
  chatId: number,
  showProcessMessage = '📝 Typing...'
) {
  const message = await bot.sendMessage(chatId, '🤔 Thinking...');
  messageHistory.addLoadingMessage(chatId, message.message_id);

  try {
    setTimeout(() => {
      bot.editMessageText(showProcessMessage, {
        chat_id: chatId,
        message_id: message.message_id,
      });
    }, 1000);
  } catch (err) {}

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
    const message =
      userType === USER_TYPE_BRAND
        ? config.brandStartMessage
        : config.creatorStartMessage;
    messageHistory.addRecentConversation(chatId, {
      query: `I am a new ${userType}`,
      answer: message,
      time: Date.now(),
    });
    messageHistory.setLastMessage(chatId, {
      command: 'NEW_PROFILE_UPDATE',
    });
    messageHistory.deleteLoadingMessages(chatId, bot);
    bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
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
    let message = '';
    if (user?.userType === 'BRAND') {
      message =
        'Alright, we’re ready to dive in. Just share your brand name along with some key details—location, industry, the works. Let’s build something legendary together!';
      bot.sendMessage(chatId, message);
    } else if (user?.userType === 'CREATOR') {
      message =
        'Hey there, creative genius! 🚀 Let’s make magic happen! Drop your name, social links, and both SOL and EVM wallet addresses so we can make sure those well-deserved payments flow right into your pocket. 🕶️ Time to level up your creator! 🌟';
      bot.sendMessage(chatId, message);
    }
    messageHistory.setLastMessage(chatId, {
      command: 'COMMAND_RECEIVE_UPDATE_PROFILE',
    });
    messageHistory.addRecentConversation(chatId, {
      query: 'Im a new ' + user?.userType,
      answer: message,
      time: Date.now(),
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
  await sendLoadingMessage(query.message?.chat.id as number);
  await sendProfile({ bot, chatId: query.message?.chat.id as number });
  messageHistory.deleteLoadingMessages(query.message?.chat.id as number, bot);
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
    'Hey Creator! Let’s create a package for your services. Please send the package details including name, price, description and negotitation limit.'
  );
  messageHistory.setSuperCommand(
    query.message?.chat.id as number,
    'COMMAND_ADD_PACKAGE'
  );
};

const handleViewPackages = async (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  const chatId = query.message?.chat.id as number;
  await sendLoadingMessage(chatId);
  const user = await prisma.user.findUnique({ where: { chatId } });
  if (user?.userType === USER_TYPE_CREATOR) {
    const packages = await prisma.package.findMany({
      where: {
        creatorId: user.id,
      },
    });
    if (packages.length === 0) {
      bot.sendMessage(chatId, 'You have no packages yet');
    } else {
      packages.forEach((pack) => {
        bot.sendMessage(
          chatId,
          `*${pack.name}*\n${pack.description || ''}\nPrice: ${
            pack.price
          } \nNegotiation Limit: ${pack.negotitationLimit || 'Not set'}`,
          {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: 'Edit',
                    callback_data: `EDIT_PACKAGE:${pack.id}`,
                  },
                  {
                    text: 'Delete',
                    callback_data: `DELETE_PACKAGE:${pack.id}`,
                  },
                ],
              ],
            },
          }
        );
      });
    }
  }
  messageHistory.deleteLoadingMessages(chatId, bot);
};

const handleDeletePackage = async (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  try {
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
  } catch (err) {}
};

const handleUpdatePackage = async (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  const [, id] = data;
  const _package = await prisma.package.findUnique({
    where: { id },
  });
  if (!_package) {
    bot.sendMessage(
      query.message?.chat.id as number,
      '📦 Package not found 🗑️'
    );
    return;
  }
  bot.sendMessage(
    query.message?.chat.id as number,
    '📦 Please send the updated package details! ✏️'
  );
  messageHistory.setSuperCommand(
    query.message?.chat?.id as number,
    'UPDATE_PACKAGE'
  );
  messageHistory.setLastMessage(query.message?.chat?.id as number, {
    command: `COMMAND_UPDATE_PACKAGE:${id}`,
  });
};

const handleEditProfileField = async (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  const [, field] = data;
  console.log('Field', field);
  const chatId = query.message?.chat.id as number;
  const user = await prisma.user.findUnique({ where: { chatId } });
  if (!user) {
    return;
  }
  let message = '';
  if (user.userType === USER_TYPE_BRAND) {
    switch (field) {
      case 'name':
        message = 'Please send your brand name';
        break;
      case 'location':
        message = 'Please send your location';
        break;
      case 'industry':
        message = 'Please send your industry';
        break;
      default:
        message = 'Please send your brand name';
    }
  } else if (user.userType === USER_TYPE_CREATOR) {
    switch (field) {
      case 'bio':
        message = 'Please send your bio';
        break;
      case 'twitterId':
        message = 'Please send your X/Twitter Profile link';
        break;
      case 'youtubeId':
        message = 'Please send your Youtube Profile link';
        break;
      case 'tiktokId':
        message = 'Please send your Tiktok Profile link';
        break;
      case 'discordId':
        message = 'Please send your Discord Profile link';
        break;
      case 'twitchId':
        message = 'Please send your Twitch Profile link';
        break;
      case 'solWallet':
        message = 'Please send your SOL wallet address';
        break;
      case 'evmWallet':
        message = 'Please send your EVM wallet address';
        break;
      case 'location':
        message = 'Please send your location';
        break;
      case 'location':
        message = 'Please send your location';
        break;
      case 'contentStyle':
        message = 'Please send your content style';
        break;
      case 'niche':
        message = 'Please send your niche';
        break;
      case 'schedule':
        message = 'Please send your schedule';
        break;
      case 'negotationLimit':
        message = 'Please send your negotation limit';
        break;
      default:
        message = 'Please send your name';
    }
  }
  messageHistory.setSuperCommand(
    chatId,
    `${COMMAND_HANDLE_EDIT_PROFILE_FIELD}:${field}`
  );
  bot.sendMessage(chatId, message);
  messageHistory.setLastMessage(chatId, {
    command: 'COMMAND_RECEIVE_UPDATE_PROFILE',
  });
};

export const handleCompleteProfileSetup = async (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  const chatId = query.message?.chat.id as number;
  const user = await prisma.user.findUnique({
    where: { chatId },
    include: { packages: true },
  });
  if (!user) {
    return;
  }
  if (
    user.bio &&
    user.twitterId &&
    user.solWallet &&
    user.evmWallet &&
    user.contentStyle &&
    user.niche
  ) {
    bot.sendMessage(
      chatId,
      'Congrats! You’re officially represented by CAAA - here’s your badge of approval. I’ve already got your first paid deal!! Over $100k in rewards up for grabs. Just need you to share this badge on X and tag ME @ChipTheAgent - then come back and share that tweet link here!'
    );
  } else if (user.packages.length === 0) {
    bot.sendMessage(
      chatId,
      'You need to create a package to proceed. Please create a package to proceed. Use /package command to manage packages.'
    );
  } else {
    bot.sendMessage(
      chatId,
      'Your profile is incomplete. Please complete your profile to proceed. The fields with * symbol are mandatory.'
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
    VIEW_MY_PACKAGES: handleViewPackages,
    DELETE_PACKAGE: handleDeletePackage,
    EDIT_PACKAGE: handleUpdatePackage,
    EDIT_PROFILE_FIELD: handleEditProfileField,
    COMPLETE_SETUP: handleCompleteProfileSetup,
    ADD_PACKAGE: handleCreatePackage,
  };
  const [command, data] = query.data?.split(':') || [];
  console.log('COMMAND>>', command, data);
  if (command && command in register) {
    register[command](bot, [command, data], query);
  }
};

export default inlineQueryHandlers;
