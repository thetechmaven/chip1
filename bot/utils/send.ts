import prisma from '../../prisma/prisma';

const TelegramBot = require('node-telegram-bot-api');

interface ISendProfile {
  bot: typeof TelegramBot;
  chatId: number;
}

function replaceAll(inputString: string, search: string, replacement: string) {
  const regex = new RegExp(search, 'g');
  return inputString.replace(regex, replacement);
}

export const sendProfile = async ({ bot, chatId }: ISendProfile) => {
  const user = await prisma.user?.findUnique({ where: { chatId } });

  let message = `This is your profile\n`;
  bot.sendMessage(chatId, message, {
    reply_markup: JSON.stringify({
      // inline_keyboard: [
      //
      // ],
    }),
    parse_mode: 'markdown',
  });
};
