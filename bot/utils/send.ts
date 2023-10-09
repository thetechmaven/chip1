const TelegramBot = require('node-telegram-bot-api');

interface ISendProfile {
  bot: typeof TelegramBot;
  chatId: number;
}

export const sendProfile = ({}: ISendProfile) => {};
