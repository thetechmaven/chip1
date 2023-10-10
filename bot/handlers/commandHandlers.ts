import prisma from '../../prisma/prisma';
import { ILastMessage } from '../models/ChatMessageHistory';
import type * as TelegramBotTypes from 'node-telegram-bot-api';
import { sendProfile } from '../utils/send';
import { messageHistory } from '.';

const TelegramBot = require('node-telegram-bot-api');

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
};

export const handleUpdateHp = async ({ bot, message }: ICommandHandlerArgs) => {
  await prisma.user.update({
    where: { chatId: message.chat.id },
    data: { hp: message.text },
  });
  sendProfile({ bot, chatId: message.chat.id });
};
