import { messageHistory } from '../handlers';

export const deleteMessage = (chatId: number, messageId: number) => {
  try {
    const bot = require('..');
    if (messageId) bot.deleteMessage(chatId, messageId);
  } catch (err) {}
};

export const deleteLastMessage = (chatId: number) => {
  try {
    const lastMessage = messageHistory.getLastMessage(chatId);
    if (lastMessage?.messageId) {
      const bot = require('..');
      bot.deleteMessage(chatId, lastMessage.messageId);
    }
  } catch (err) {}
};

export const resetCommand = (chatId: number) => {
  messageHistory.setLastMessage(chatId, {
    messageId: undefined,
    command: undefined,
  });
};
