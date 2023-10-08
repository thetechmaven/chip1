import type * as TelegramBotTypes from 'node-telegram-bot-api';
import { deleteMessage } from '../utils/message';
const TelegramBot = require('node-telegram-bot-api');

const handlers = (bot: typeof TelegramBot) => {
  bot.onText(/\/start/, async (msg: TelegramBotTypes.Message) => {
    const chatId = msg.chat.id;
    const firstName = msg.from?.first_name;

    const welcomeMessage = `Hello, ${firstName}! Welcome to your Telegram Bot. You can use this bot to perform various tasks.`;

    const response = await bot.sendMessage(chatId, welcomeMessage);
    deleteMessage(response.chat.id, response.message_id);
  });
};

export default handlers;
