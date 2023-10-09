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
