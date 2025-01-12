import type * as TelegramBotTypes from 'node-telegram-bot-api';
import prisma from '../../prisma/prisma';
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
          // inline_keyboard: [
          //   [],
          // ]
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
  };
  const [command, data] = query.data?.split(':') || [];
  console.log('COMMAND>>', command, data);
  if (command && command in register) {
    register[command](bot, [command, data], query);
  }
};

export default inlineQueryHandlers;
