import prisma from '../../prisma/prisma';
import { PROFILE_UPDATED, VIEW_EDIT_PROFILE } from '../contants';

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
  if (user?.group) {
    message += `\n*Group:* ${user.group}`;
  }
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
    message += `\n*Years:* ${user?.experience}`;
  }
  if (user?.hp) {
    message += `\n*HP:*${user.hp}`;
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
  if (user?.qualification) {
    message += `\n*Qualification:* ${user.qualification}`;
  }
  if (user?.cover) {
    message += `\n*Experience:* ${user?.cover}`;
  }
  if (user?.locationPreference) {
    message += `\n*Location Preference:*${user.locationPreference}`;
  }

  bot.sendMessage(chatId, message, {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: 'Yes, save my profile', callback_data: PROFILE_UPDATED }],
        [
          {
            text: 'No, I would like to do more changes',
            callback_data: VIEW_EDIT_PROFILE,
          },
        ],
      ],
    }),
    parse_mode: 'markdown',
  });
};
