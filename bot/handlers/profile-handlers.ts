import type * as TelegramBotTypes from 'node-telegram-bot-api';
import * as constants from '../contants';
import * as options from './profile-options';
const TelegramBot = require('node-telegram-bot-api');

export const updateName = (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
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

export const handleUpdateGender = () => {
  console.log('Implement Handle update gender');
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

export const updateQualification = (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
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

export const updateJobCategory = (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  bot.sendMessage(query.message?.chat.id, constants.MESSAGE_PICTURE, {
    reply_markup: JSON.stringify({
      inline_keyboard: options.PROFILE_JOB_CATEGORY([]),
    }),
    parse_mode: 'markdown',
  });
};

export const updateJobPreference = (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  bot.sendMessage(query.message?.chat.id, constants.MESSAGE_JOB_PREFERENCE, {
    reply_markup: JSON.stringify({
      inline_keyboard: options.PROFILE_JOB_PREFERENCE(),
    }),
    parse_mode: 'markdown',
  });
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
