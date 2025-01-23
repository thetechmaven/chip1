import { parse } from 'path';
import prisma from '../../prisma/prisma';
import { sendRequestToGPT4 } from './openai';
const TelegramBot = require('node-telegram-bot-api');

export const sendPackage = async (
  bot: typeof TelegramBot,
  chatId: number,
  packageId: string
) => {
  const _package = await prisma.package.findUnique({
    where: { id: packageId },
  });
  if (_package) {
    const message = `Package Name: ${_package.name}\nDescription: ${_package.description}\nPrice: ${_package.price} $\nNegotiation Limit: ${_package.negotitationLimit}`;
    const updatedMessage = await sendRequestToGPT4(`
            Update this message. Add emojis also. Im something is missing motivate user to add it. Format is markdown and highlight important things. Avoid adding a lot of extra text. Name should be on top. Make it friendly and natural.
            Text: ${message}
        `);
    await bot.sendMessage(chatId, updatedMessage, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
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
