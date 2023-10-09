import type * as TelegramBotTypes from 'node-telegram-bot-api';
import {
  MESSAGE_WHICH_GROUP,
  USER_TYPE_PARENT,
  USER_TYPE_TUTOR,
} from '../contants';
import inlineQueryHandlers from './inline-query-handlers';
const TelegramBot = require('node-telegram-bot-api');

const handlers = (bot: typeof TelegramBot) => {
  bot.onText(/\/start/, async (msg: TelegramBotTypes.Message) => {
    const chatId = msg.chat.id;
    const firstName = msg.from?.first_name;

    const welcomeMessage = `Hello, ${firstName}! \n${MESSAGE_WHICH_GROUP}`;

    bot.sendMessage(chatId, welcomeMessage, {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [
            {
              text: 'Tuition Agent/Parent',
              callback_data: USER_TYPE_PARENT,
            },
          ],
          [
            {
              text: 'Tutor',
              callback_data: USER_TYPE_TUTOR,
            },
          ],
        ],
      }),
    });
  });

  bot.on('callback_query', (query: TelegramBotTypes.CallbackQuery) => {
    inlineQueryHandlers(bot, query);
  });
};

export default handlers;
