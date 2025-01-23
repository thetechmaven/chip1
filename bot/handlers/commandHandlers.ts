import prisma from '../../prisma/prisma';
import { ILastMessage } from '../models/ChatMessageHistory';
import type * as TelegramBotTypes from 'node-telegram-bot-api';
import { sendProfile } from '../utils/send';
import { messageHistory, sellerCommands } from '.';
import { resetCommand } from '../utils/message';
import {
  USER_TYPE,
  USER_TYPE_BRAND,
  USER_TYPE_CREATOR,
} from '../contants/index';
import { sendRequestToGPT4 } from '../utils/openai';
import { deleteMessage, sendLoadingMessage } from './inline-query-handlers';
import { getResponseFormat } from '../utils/getCommand';

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

interface ICommandHandlerArgs {
  bot: typeof TelegramBot;
  command: string;
  message: TelegramBotTypes.Message;
  lastMessage?: ILastMessage | undefined;
}

export const handleCommandAddPackage = async ({
  bot,
  message,
}: ICommandHandlerArgs) => {
  console.log('Im called');
  const chatId = message.chat.id;
  const loadingMessageId = await sendLoadingMessage(chatId);
  const user = await prisma.user.findUnique({ where: { chatId } });
  const commandData = sellerCommands['ADD_PACKAGE'];
  if (user?.userType === USER_TYPE_CREATOR) {
    const profileData = {
      brandName: user.brandName || 'MISSING',
      location: user.brandLocation || 'MISSING',
      industry: user.brandIndustry || 'MISSING',
    };
    const prompt = `${
      commandData.commandPrompt
    }\n If required fields return an error message. List of fields:${JSON.stringify(
      commandData.data
    )}  \nOUTPUT AS JSON IN THIS Format: ${getResponseFormat({
      ...commandData.data,
      error: { details: 'Set it to true if required fields are missing' },
      message: {
        details:
          'Ask user to send message again if any required field is missing in data. If optional fields are missing, motivate user to send optional fields',
      },
    })}\n Text: ${message.text}`;
    const responseText = await sendRequestToGPT4(prompt);
    const response = JSON.parse(responseText);
    console.log('Res', response);
    if (!response.error) {
      await prisma.package.create({
        data: {
          status: 'ACTIVE',
          name: response.name,
          description: response.description || null,
          price: response.price,
          negotitationLimit: response.negotitationLimit || null,
          creator: {
            connect: {
              chatId,
            },
          },
        },
      });
      bot.sendMessage(chatId, response.message);
    } else {
      bot.sendMessage(chatId, response.message);
    }
    console.log('Response', response);
  }
};

export const handleNewUser = async ({ bot, message }: ICommandHandlerArgs) => {
  const chatId = message.chat.id;
  const firstName = message.from?.first_name;
  const welcomeMessage = `Hello ${firstName}, welcome to the bot! Please choose what type of user you are.`;

  let user = await prisma.user.findUnique({ where: { chatId } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        chatId,
        name: firstName,
      },
    });
  }
  bot.sendMessage(chatId, welcomeMessage, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '👨‍🎨 Creator',
            callback_data: `${USER_TYPE}:${USER_TYPE_CREATOR}`,
          },
        ],
        [
          {
            text: '🏢 Brand',
            callback_data: `${USER_TYPE}:${USER_TYPE_BRAND}`,
          },
        ],
      ],
    },
  });
};

export const handleUpdateName = async ({
  bot,
  message,
}: ICommandHandlerArgs) => {
  await prisma.user.update({
    where: { chatId: message.chat.id },
    data: { name: message.text },
  });
  sendProfile({ bot, chatId: message.chat.id });
  resetCommand(message.chat.id);
};

export const handleUpdatePicture = async ({
  bot,
  message: msg,
}: ICommandHandlerArgs) => {
  if (msg.photo && msg.photo[0]) {
    const filePath = await bot.downloadFile(
      msg.photo.slice(-1)[0].file_id,
      './public/bot-images'
    );
    const newName = `./public/bot-images/i-${msg.chat.id}.jpg`;
    fs.renameSync(filePath, newName, (err: Error) => {
      if (err) {
        bot.sendMessage(
          msg.chat.id,
          'There was an error while updating the photo. Please try again later'
        );
      } else {
        bot.sendMessage(
          msg.chat.id,
          'Your profile picture has been updated successfully'
        );
      }
    });
    bot.sendMessage(
      msg.chat.id,
      'Your profile picture has been updated successfully'
    );
    sendProfile({ bot, chatId: msg.chat.id });
    resetCommand(msg.chat.id);
  } else {
    bot.sendMessage(msg.chat.id, 'Error: No photo received');
  }
};

export const handleReceiveUpdateProfile = async ({
  bot,
  message,
}: ICommandHandlerArgs) => {
  const chatId = message.chat.id;
  const loadingMessageId = await sendLoadingMessage(chatId);
  const user = await prisma.user.findUnique({ where: { chatId } });
  if (user?.userType === USER_TYPE_BRAND) {
    const profileData = await sendRequestToGPT4(`
      Extract the data from the provided text and output it as a JSON object in the following format:  
      {
        "brandName": "name/brandName in this text",
        "brandLocation": "location of brand",
        "brandIndustry": "industry of brand"
      }  
      NB: If something is missing. set it null.
      Text: "${message.text}"
    `);
    const data = JSON.parse(profileData);
    for (let key in data) {
      if (data[key] === null) {
        delete data[key];
      }
    }
    await prisma.user.update({
      where: { chatId },
      data: {
        ...data,
      },
    });
    await sendProfile({ bot, chatId });
  } else if (user?.userType === USER_TYPE_CREATOR) {
    const profileData = await sendRequestToGPT4(`
      Extract the data from the provided text and output it as a JSON object in the following format:  
      {
        "name": "name/brandName in this text",
        "bio": "bio of creator",
        "telegramId": "telegram account of creator",
        "twitterId": "x/twitter handle",
        "facebookId": "facebook id of the creator",
        "youtubeId": "youtube profile of the creator",
        "evmWallet": "EVM Wallet Address of the creator",
        "solWallet": "Solana wallet address of the creator",
        "niche": "niche/field/industry of creator",
        "schedule": "Working schedule of the creator",
        "location": "Location of the creator"
      }  
      NB: If something is missing. set it null.
      Text: "${message.text}"
    `);
    console.log(profileData);
    const data = JSON.parse(profileData);
    for (let key in data) {
      if (data[key] === null) {
        delete data[key];
      }
    }
    await prisma.user.update({
      where: { chatId },
      data: {
        ...data,
      },
    });
    await sendProfile({ bot, chatId });
  }
  messageHistory.setLastMessage(chatId, {
    command: 'COMMAND_RECEIVE_UPDATE_PROFILE',
  });
  deleteMessage(bot, chatId, loadingMessageId);
};
