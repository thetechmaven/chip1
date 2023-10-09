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
  const user = await prisma.user.findUnique({ where: { chatId } });

  let message = `This is your profile\n`;
  if (user?.name) {
    message += `\n*Name* ${replaceAll(
      replaceAll(user.name, '_', '-'),
      '_',
      '-'
    )}`;
  }
  if (user?.email) {
    message += `\n*Email:* ${replaceAll(
      replaceAll(user.email, '_', '-'),
      '_',
      '-'
    )}`;
  }
  if (user?.experience) {
    message += `\n*Expereince:* ${user?.experience}`;
  }
  if (user?.gender) {
    message += `\n*Gender*: ${user.gender}`;
  }
  if (user?.race) {
    message += `\n*Race*: ${user.race}`;
  }
  if (user?.citizenship) {
    message += `\n*Citizenship:* ${user.citizenship}`;
  }

  bot.sendMessage(chatId, message, {
    parse_mode: 'markdown',
  });
};
