import type * as TelegramBotTypes from 'node-telegram-bot-api';
import {
  APPLY_FOR_JOBS,
  TUTOR_BACK,
  TUTOR_MAIN_MENU,
  VIEW_EDIT_PROFILE,
} from '../contants';
import * as profileOptions from './profile-options';
import {
  handleUpdateGender,
  updateCitizen,
  updateCover,
  updateEmail,
  updateExperience,
  updateGender,
  updateJobCategory,
  updateJobPreference,
  updateLocationPreference,
  updateName,
  updateQualification,
  updateRace,
} from './profile-handlers';
const TelegramBot = require('node-telegram-bot-api');

const handleUserType = (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  bot.sendMessage(query.message?.chat.id, TUTOR_MAIN_MENU, {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          {
            text: 'Apply for Jobs',
            callback_data: APPLY_FOR_JOBS,
          },
        ],
        [
          {
            text: 'View/Edit Profile',
            callback_data: VIEW_EDIT_PROFILE,
          },
        ],
        [
          {
            text: 'BACK',
            callback_data: TUTOR_BACK,
          },
        ],
      ],
    }),
  });
};

const handleUpdateTutorProfile = (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  bot.sendMessage(query.message?.chat.id, '&nbsp;', {
    reply_markup: JSON.stringify({
      inline_keyboard: profileOptions.ADD_EDIT_PROFILE,
    }),
  });
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
    VIEW_EDIT_PROFILE: handleUpdateTutorProfile,
    PROFILE_NAME: updateName,
    PROFILE_EMAIL: updateEmail,
    PROFILE_EXPERIENCE: updateExperience,
    PROFILE_GENDER: updateGender,
    GENDER: handleUpdateGender,
    PROFILE_RACE: updateRace,
    PROFILE_CITIZENSHIP: updateCitizen,
    PROFILE_QUALIFICATION: updateQualification,
    PROFILE_COVER: updateCover,
    PROFILE_JOB_CATEGORY: updateJobCategory,
    PROFILE_JOB_PREFERENCE: updateJobPreference,
    PROFILE_LOCATION_PREFERENCE: updateLocationPreference,
  };
  const [command, data] = query.data?.split(':') || [];
  console.log(command);
  if (command && command in register) {
    register[command](bot, [command, data], query);
  }
};

export default inlineQueryHandlers;
