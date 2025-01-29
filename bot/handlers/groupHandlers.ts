const TelegramBot = require('node-telegram-bot-api');
import type * as TelegramBotTypes from 'node-telegram-bot-api';
import { isCreatorGroup } from '../utils/groupHelpers';

export const groupHandler = async (
  bot: typeof TelegramBot,
  message: TelegramBotTypes.Message
) => {
  const isCreator = await isCreatorGroup(message);
  console.log('Is creator', isCreator);
};
