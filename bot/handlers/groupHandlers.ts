const TelegramBot = require('node-telegram-bot-api');
import type * as TelegramBotTypes from 'node-telegram-bot-api';
import {
  getChatId,
  getKnowledgeBase,
  initGroup,
  isCreatorGroup,
  sendRequestToEliza,
} from '../utils/groupHelpers';

export const groupHandler = async (
  bot: typeof TelegramBot,
  message: TelegramBotTypes.Message
) => {
  const { isCreator, isNewGroup } = await isCreatorGroup(message);
  if (isNewGroup) {
    await initGroup(message);
    bot.sendMessage(getChatId(message), 'Group initialized');
  } else {
    if (isCreator) {
      bot.sendMessage(
        getChatId(message),
        'Temp Message: will be removed because Chip dont reply to creators, only replies to buyers'
      );
    } else {
      const knowledgebase = await getKnowledgeBase(getChatId(message));
      const data = await sendRequestToEliza(
        getChatId(message),
        (message.text as string) +
          `\n\nNote: In most cases when client refers "You" that means the content creator.\n\nUse the following knowledgebase to help the user if required: \n${knowledgebase} \n`
      );
      bot.sendMessage(getChatId(message), data[0].text, {
        parse_mode: 'Markdown',
      });
    }
  }
};
