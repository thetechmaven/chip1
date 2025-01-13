import prisma from '../../prisma/prisma';
import { ILastMessage } from '../models/ChatMessageHistory';
import type * as TelegramBotTypes from 'node-telegram-bot-api';
import { sendProfile } from '../utils/send';
import { messageHistory } from '.';
import { resetCommand } from '../utils/message';
import {
  USER_TYPE,
  USER_TYPE_BRAND,
  USER_TYPE_CREATOR,
} from '../contants/index';
import { sendRequestToGPT4 } from '../utils/openai';

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

interface ICommandHandlerArgs {
  bot: typeof TelegramBot;
  command: string;
  message: TelegramBotTypes.Message;
  lastMessage?: ILastMessage;
}

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
    sendProfile({ bot, chatId });
  } else if (user?.userType === USER_TYPE_CREATOR) {
  }
  messageHistory.setLastMessage(chatId, {
    command: 'COMMAND_RECEIVE_UPDATE_PROFILE',
  });
};
