import type * as TelegramBotTypes from 'node-telegram-bot-api';
import {
  APPLY_FOR_JOBS,
  MESSAGE_WHICH_GROUP,
  TUTOR_BACK,
  VIEW_EDIT_PROFILE,
} from '../contants';
import * as profileOptions from './profile-options';
import {
  handleDone,
  handleProfileUpdated,
  handleSelectUserType,
  handleUpdateCitizen,
  handleUpdateGender,
  handleUpdateGroup,
  handleUpdateJobCategory,
  handleUpdateJobPreference,
  handleUpdateLocationPreference,
  handleUpdateRace,
  updateCitizen,
  updateCover,
  updateEmail,
  updateExperience,
  updateGender,
  updateGroup,
  updateJobCategory,
  updateJobPreference,
  updateLocationPreference,
  updateName,
  updatePicture,
  updateProfileHp,
  updateQualification,
  updateRace,
} from './profile-handlers';
import prisma from '../../prisma/prisma';
import { handleUpdateHp, handleUpdatePicture } from './commandHandlers';
import { messageHistory } from '.';
const TelegramBot = require('node-telegram-bot-api');

const handleUserType = async (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  if (query.message?.chat.id) {
    const user = await prisma.user.upsert({
      where: { chatId: query.message.chat.id },
      create: {
        name:
          (query.message.chat?.first_name || '') +
          ' ' +
          (query.message.chat?.last_name || ''),
        chatId: query.message.chat.id,
        categoryPreference: [],
        username: query.message.chat.username,
      },
      update: {},
    });
    if (user.phone) {
      bot.editMessageReplyMarkup(
        {
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
                callback_data: 'SELECT_USER_TYPE',
              },
            ],
          ],
        },
        {
          chat_id: query.message?.chat.id,
          message_id: query.message?.message_id,
        }
      );
      /*
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
      */
    } else {
      const message = await bot.sendMessage(
        query.message.chat.id,
        'Please provide your phone number',
        {
          reply_markup: JSON.stringify({
            keyboard: [
              [
                {
                  text: 'Share my phone number',
                  request_contact: true,
                  one_time_keyboard: true,
                },
              ],
            ],
          }),
        }
      );
      messageHistory.setLastMessage(query.message.chat.id, {
        messageId: message.message_id,
      });
    }
  }
};

const handleUpdateTutorProfile = async (
  bot: typeof TelegramBot,
  data: string[],
  query: TelegramBotTypes.CallbackQuery
) => {
  if (true) {
    bot.editMessageText(MESSAGE_WHICH_GROUP, {
      chat_id: query.message?.chat.id,
      message_id: query.message?.message_id,
    });
    bot.editMessageReplyMarkup(
      { inline_keyboard: profileOptions.ADD_EDIT_PROFILE },
      {
        chat_id: query.message?.chat.id,
        message_id: query.message?.message_id,
      }
    );
  } else {
    const message = await bot.sendMessage(query.message?.chat.id, '&nbsp;', {
      reply_markup: JSON.stringify({
        inline_keyboard: profileOptions.ADD_EDIT_PROFILE,
      }),
    });
    messageHistory.setLastMessage(query.message?.chat.id as number, {
      messageId: message.message_id,
    });
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
    VIEW_EDIT_PROFILE: handleUpdateTutorProfile,
    PROFILE_NAME: updateName,
    PROFILE_EMAIL: updateEmail,
    PROFILE_EXPERIENCE: updateExperience,
    PROFILE_GENDER: updateGender,
    PROFILE_RACE: updateRace,
    PROFILE_CITIZENSHIP: updateCitizen,
    PROFILE_QUALIFICATION: updateQualification,
    PROFILE_COVER: updateCover,
    PROFILE_JOB_CATEGORY: updateJobCategory,
    PROFILE_JOB_PREFERENCE: updateJobPreference,
    PROFILE_LOCATION_PREFERENCE: updateLocationPreference,
    PROFILE_HP: updateProfileHp,
    PROFILE_GROUP: updateGroup,
    PROFILE_PICTURE: updatePicture,

    GENDER: handleUpdateGender,
    RACE: handleUpdateRace,
    CITIZENSHIP: handleUpdateCitizen,
    JOB_CATEGORY: handleUpdateJobCategory,
    JOB_PREFERENCE: handleUpdateJobPreference,
    LOCATION: handleUpdateLocationPreference,
    PROFILE_DONE: handleDone,
    PROFILE_UPDATED: handleProfileUpdated,
    COMMAND_HP: handleUpdateHp,
    COMMAND_PICTURE: handleUpdatePicture,
    GROUP: handleUpdateGroup,
    SELECT_USER_TYPE: handleSelectUserType,
  };
  const [command, data] = query.data?.split(':') || [];
  console.log('COMMAND>>', command, data);
  if (command && command in register) {
    register[command](bot, [command, data], query);
  }
};

export default inlineQueryHandlers;
