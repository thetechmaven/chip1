import { parse } from 'path';
import prisma from '../../prisma/prisma';
import { sendRequestToGPT4 } from './openai';
import { messageHistory } from '../handlers';
import getPrompt from './getPrompts';
const TelegramBot = require('node-telegram-bot-api');
import getText from '../../utils/getText';

export const sendPackage = async (
  bot: typeof TelegramBot,
  chatId: number,
  packageId: string
) => {
  const _package = await prisma.package.findUnique({
    where: { id: packageId },
  });
  if (_package) {
    const message = `Package Name: ${_package.name}\nDescription: ${_package.description}\nPrice: ${_package.price} $\nNegotiation Limit: ${_package.negotiation}`;
    const p = await getPrompt('sendPackage');
    const updatedMessage = await sendRequestToGPT4(
      getText(p?.value as string, {
        message,
      })
    );
    await bot.sendMessage(chatId, updatedMessage, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Edit',
              callback_data: `EDIT_PACKAGE:${_package.id}`,
            },
            {
              text: 'Delete',
              callback_data: `DELETE_PACKAGE:${_package.id}`,
            },
          ],
        ],
      },
    });
  } else {
    await bot.sendMessage(chatId, 'Package not found');
  }
};
