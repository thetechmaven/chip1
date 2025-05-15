const TelegramBot = require('node-telegram-bot-api');
import type * as TelegramBotTypes from 'node-telegram-bot-api';
import {
  dealOpenaiWrapper,
  getChatId,
  getKnowledgeBase,
  initGroup,
  isCreatorGroup,
  sendRequestToEliza,
} from '../utils/groupHelpers';
import { sendLoadingMessage } from './inline-query-handlers';
import { messageHistory } from '.';

export const groupHandler = async (
  bot: typeof TelegramBot,
  message: TelegramBotTypes.Message
) => {
  console.log('Group handler triggered');
  try {
    if ((message as any).new_chat_member?.status === 'left') {
      return;
    }
    const { isCreator, isNewGroup } = await isCreatorGroup(message);
    if (isNewGroup) {
      if (isCreator) {
        await initGroup(message);
        const initializationMessage = await bot.sendMessage(
          getChatId(message),
          'Hi there! Chip here—ready to help with any questions you have.'
        );
      } else {
        bot.sendMessage(
          getChatId(message),
          'This group is not for you. Please leave the group.'
        );
      }
    } else {
      if (isCreator) {
        console.log('HERE 1');
        await dealOpenaiWrapper(getChatId(message), [
          {
            role: 'user',
            name: 'Creator',
            content: [
              {
                type: 'text',
                text:
                  (message.text as string) +
                  `This is the creators message. He is telling something to ${
                    message.from?.first_name || 'Client'
                  }. Just save this for your later use. You need not to respond to it now.`,
              },
            ],
          },
        ]);
      } else {
        console.log('HERE 2');
        const knowledgebase = await getKnowledgeBase(getChatId(message));
        sendLoadingMessage(getChatId(message));
        //const data = await sendRequestToEliza(
        //  getChatId(message),
        //  (message.text as string) +
        //    `\n\nNote: In most cases when client refers "You" that means the content creator.\n\nUse the following knowledgebase to help the user if required: \n${knowledgebase} \n`
        //);

        const text = await dealOpenaiWrapper(getChatId(message), [
          {
            role: 'user',
            name: message.from?.first_name || 'Client',
            content: [
              {
                type: 'text',
                text:
                  (message.text as string) +
                  `\n\nNote: In most cases when client refers "You" that means the content creator.\n\nUse the following knowledgebase to help the user if required: \n${knowledgebase} \n`,
              },
            ],
          },
        ]);

        bot.sendMessage(getChatId(message), text, {
          parse_mode: 'Markdown',
        });

        messageHistory.deleteLoadingMessages(getChatId(message), bot);
      }
    }
  } catch (err) {
    console.error('Error handling group message:', err);
  }
};
