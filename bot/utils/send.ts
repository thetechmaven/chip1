import prisma from '../../prisma/prisma';
import { PROFILE_UPDATED, VIEW_EDIT_PROFILE } from '../contants';
import {
  PROFILE_CITIZENSHIP,
  PROFILE_GROUP,
} from '../handlers/profile-options';

const TelegramBot = require('node-telegram-bot-api');

const groupMap: { [x: string]: string } = {};
PROFILE_GROUP.forEach((option) => {
  const key = option[0].callback_data.substring(6, 30);
  groupMap[key] = option[0].text;
});
const citizenShipMap: { [x: string]: string } = {};
PROFILE_CITIZENSHIP.forEach((option) => {
  const key = option[0].callback_data.substring(12, 30);
  citizenShipMap[key] = option[0].text;
});

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
  if (user?.group) {
    message += `\n*Group:* ${groupMap[user?.group]}`;
  }
  if (user?.name) {
    message += `\n*Name* ${replaceAll(
      replaceAll(user?.name, '_', '-'),
      '_',
      '-'
    )}`;
  }
  if (user?.email) {
    message += `\n*Email:* ${replaceAll(
      replaceAll(user?.email, '_', '-'),
      '_',
      '-'
    )}`;
  }

  message += `\n*Years:* ${user?.experience || ''}`;

  message += `\n*HP:*${user?.hp || ''}`;

  message += `\n*Gender*: ${user?.gender || ''}`;

  message += `\n*Race*: ${user?.race || ''}`;

  message += `\n*Citizenship:* ${
    citizenShipMap[user?.citizenship || ''] || ''
  }`;

  message += `\n*Qualification:* ${user?.qualification || ''}`;

  message += `\n*Experience:* ${user?.cover || ''}`;

  message += `\n*Location Preference:*${user?.locationPreference || ''}`;

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
