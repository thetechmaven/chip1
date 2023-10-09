import type * as TelegramBotTypes from 'node-telegram-bot-api';
import * as constants from '../contants';
import * as options from './profile-options';
import { messageHistory } from '.';
import prisma from '../../prisma/prisma';
import { deleteMessage } from '../utils/message';
import { sendProfile } from '../utils/send';
const TelegramBot = require('node-telegram-bot-api');

export const updateName = (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  messageHistory.setLastMessage(query.message?.chat.id as number, {
    messageId: query.message?.message_id as number,
    command: constants.COMMAND_NAME,
  });
  bot.sendMessage(query.message?.chat.id, 'What is your name', {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          {
            text: 'Back',
            callback_data: constants.VIEW_EDIT_PROFILE,
          },
        ],
      ],
    }),
  });
};

export const updateEmail = (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  messageHistory.setLastMessage(query.message?.chat.id as number, {
    messageId: query.message?.message_id as number,
    command: constants.COMMAND_EMAIL,
  });
  bot.sendMessage(query.message?.chat.id, 'What is your email', {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          {
            text: 'Back',
            callback_data: constants.VIEW_EDIT_PROFILE,
          },
        ],
      ],
    }),
  });
};

export const updateExperience = (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  bot.sendMessage(
    query.message?.chat.id,
    'How many years of experience do you have',
    {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [
            {
              text: 'Back',
              callback_data: constants.VIEW_EDIT_PROFILE,
            },
          ],
        ],
      }),
    }
  );
};

export const updateGender = (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  bot.sendMessage(query.message?.chat.id, 'Choose your gender', {
    reply_markup: JSON.stringify({
      inline_keyboard: options.PROFILE_GENDER,
    }),
  });
};

export const handleUpdateGender = async (
  bot: typeof TelegramBot,
  [, data]: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  await prisma.user.update({
    where: { chatId: query.message?.chat.id },
    data: { gender: data as 'MALE' | 'FEMALE' },
  });
  deleteMessage(
    query.message?.chat.id as number,
    query.message?.message_id as number
  );
  sendProfile({ bot, chatId: query.message?.chat.id as number });
};

export const updateRace = (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  bot.sendMessage(
    query.message?.chat.id,
    'Select your race. If it is not in the list, type it in the message box',
    {
      reply_markup: JSON.stringify({
        inline_keyboard: options.PROFILE_RACE,
      }),
    }
  );
};

export const handleUpdateRace = async (
  bot: typeof TelegramBot,
  [_, data]: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  await prisma.user.update({
    where: { chatId: query.message?.chat.id },
    data: { race: data },
  });
  deleteMessage(
    query.message?.chat.id as number,
    query.message?.message_id as number
  );
  sendProfile({ bot, chatId: query.message?.chat.id as number });
};

export const updateCitizen = (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  bot.sendMessage(query.message?.chat.id, 'Please select your citizenship', {
    reply_markup: JSON.stringify({
      inline_keyboard: options.PROFILE_CITIZENSHIP,
    }),
  });
};
export const handleUpdateCitizen = async (
  bot: typeof TelegramBot,
  [_, data]: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  await prisma.user.update({
    where: { chatId: query.message?.chat.id },
    data: { citizenship: data },
  });
  deleteMessage(
    query.message?.chat.id as number,
    query.message?.message_id as number
  );
  sendProfile({ bot, chatId: query.message?.chat.id as number });
};

export const updateQualification = (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  messageHistory.setLastMessage(query.message?.chat.id as number, {
    messageId: query.message?.message_id as number,
    command: constants.COMMAND_QUALIFICATION,
  });
  bot.sendMessage(
    query.message?.chat.id,
    constants.MESSAGE_PROFILE_QUALIFICATION,
    {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [{ text: 'Back', callback_data: constants.VIEW_EDIT_PROFILE }],
        ],
      }),
      parse_mode: 'markdown',
    }
  );
};

export const updateCover = (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  messageHistory.setLastMessage(query.message?.chat.id as number, {
    messageId: query.message?.message_id as number,
    command: constants.COMMAND_COVER,
  });
  bot.sendMessage(query.message?.chat.id, constants.MESSAGE_COVER, {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: 'Back', callback_data: constants.VIEW_EDIT_PROFILE }],
      ],
    }),
    parse_mode: 'markdown',
  });
};

export const updatePicture = (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  bot.sendMessage(query.message?.chat.id, constants.MESSAGE_PICTURE, {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: 'Back', callback_data: constants.VIEW_EDIT_PROFILE }],
      ],
    }),
    parse_mode: 'markdown',
  });
};

export const updateJobCategory = async (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  const user = await prisma.user.findUnique({
    where: { chatId: query.message?.chat.id },
  });
  bot.sendMessage(query.message?.chat.id, constants.MESSAGE_PICTURE, {
    reply_markup: JSON.stringify({
      inline_keyboard: options.PROFILE_JOB_CATEGORY(
        user?.categoryPreference || []
      ),
    }),
    parse_mode: 'markdown',
  });
};

export const handleUpdateJobCategory = async (
  bot: typeof TelegramBot,
  [, data]: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  let user = await prisma.user.findUnique({
    where: { chatId: query.message?.chat.id },
  });
  if (user?.categoryPreference.includes(data)) {
    user = await prisma.user.update({
      where: { chatId: query.message?.chat.id },
      data: {
        categoryPreference: user?.categoryPreference.filter((p) => p !== data),
      },
    });
  } else {
    user = await prisma.user.update({
      where: { chatId: query.message?.chat.id },
      data: { categoryPreference: { push: data } },
    });
  }
  bot.editMessageReplyMarkup(
    { inline_keyboard: options.PROFILE_JOB_CATEGORY(user.categoryPreference) },
    {
      chat_id: query.message?.chat.id,
      message_id: query.message?.message_id,
    }
  );
};

export const updateJobPreference = async (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  const user = await prisma.user.findUnique({
    where: { chatId: query.message?.chat.id },
  });
  bot.sendMessage(query.message?.chat.id, constants.MESSAGE_JOB_PREFERENCE, {
    reply_markup: JSON.stringify({
      inline_keyboard: options.PROFILE_JOB_PREFERENCE(
        user?.typePreference || []
      ),
    }),
    parse_mode: 'markdown',
  });
};

export const handleUpdateJobPreference = async (
  bot: typeof TelegramBot,
  [, data]: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  let user = await prisma.user.findUnique({
    where: { chatId: query.message?.chat.id },
  });
  if (user?.typePreference.includes(data)) {
    user = await prisma.user.update({
      where: { chatId: query.message?.chat.id },
      data: { typePreference: user?.typePreference.filter((p) => p !== data) },
    });
  } else {
    user = await prisma.user.update({
      where: { chatId: query.message?.chat.id },
      data: { typePreference: { push: data } },
    });
  }
  bot.editMessageReplyMarkup(
    { inline_keyboard: options.PROFILE_JOB_PREFERENCE(user.typePreference) },
    {
      chat_id: query.message?.chat.id,
      message_id: query.message?.message_id,
    }
  );
};

export const updateLocationPreference = (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  bot.sendMessage(query.message?.chat.id, constants.MESSAGE_JOB_PREFERENCE, {
    reply_markup: JSON.stringify({
      inline_keyboard: options.PROFILE_LOCATION_PREFERENCES(),
    }),
    parse_mode: 'markdown',
  });
};

export const handleUpdateLocationPreference = async (
  bot: typeof TelegramBot,
  [_, data]: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  await prisma.user.update({
    where: { chatId: query.message?.chat.id },
    data: { locationPreference: data },
  });
  deleteMessage(
    query.message?.chat.id as number,
    query.message?.message_id as number
  );
  sendProfile({ bot, chatId: query.message?.chat.id as number });
};
