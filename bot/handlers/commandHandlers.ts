import prisma from '../../prisma/prisma';
import { ILastMessage } from '../models/ChatMessageHistory';
import type * as TelegramBotTypes from 'node-telegram-bot-api';
import { sendProfile } from '../utils/send';
import { messageHistory } from '.';
import { resetCommand } from '../utils/message';

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

interface ICommandHandlerArgs {
  bot: typeof TelegramBot;
  command: string;
  message: TelegramBotTypes.Message;
  lastMessage?: ILastMessage;
}

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

export const handleUpdateEmail = async ({
  bot,
  message,
}: ICommandHandlerArgs) => {
  await prisma.user.update({
    where: { chatId: message.chat.id },
    data: { email: message.text },
  });
  sendProfile({ bot, chatId: message.chat.id });
  resetCommand(message.chat.id);
};

export const handleUpdateExperience = async ({
  bot,
  message,
}: ICommandHandlerArgs) => {
  await prisma.user.update({
    where: { chatId: message.chat.id },
    data: { experience: Number(message.text) },
  });
  messageHistory.setLastMessage(message.chat.id, {
    command: undefined,
    messageId: undefined,
  });
  sendProfile({ bot, chatId: message.chat.id });
  resetCommand(message.chat.id);
};

export const handleUpdateQualification = async ({
  bot,
  message,
}: ICommandHandlerArgs) => {
  await prisma.user.update({
    where: { chatId: message.chat.id },
    data: { qualification: message.text },
  });
  messageHistory.setLastMessage(message.chat.id, {
    command: undefined,
    messageId: undefined,
  });
  sendProfile({ bot, chatId: message.chat.id });
  resetCommand(message.chat.id);
};

export const handleUpdateCover = async ({
  bot,
  message,
}: ICommandHandlerArgs) => {
  await prisma.user.update({
    where: { chatId: message.chat.id },
    data: { cover: message.text },
  });
  messageHistory.setLastMessage(message.chat.id, {
    command: undefined,
    messageId: undefined,
  });
  sendProfile({ bot, chatId: message.chat.id });
  resetCommand(message.chat.id);
};

export const handleUpdateHp = async ({ bot, message }: ICommandHandlerArgs) => {
  await prisma.user.update({
    where: { chatId: message.chat.id },
    data: { hp: message.text },
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
      './bot-images'
    );
    const newName = `./bot-images/i-${msg.chat.id}.jpg`;
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
