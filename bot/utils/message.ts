import bot from '..';
import { messageHistory } from '../handlers';

export const deleteMessage = (chatId: number, messageId: number) => {
  try {
    if (messageId) bot.deleteMessage(chatId, messageId);
  } catch (err) {}
};

export const deleteLastMessage = (chatId: number) => {
  try {
    const lastMessage = messageHistory.getLastMessage(chatId);
    if (lastMessage?.messageId) {
      bot.deleteMessage(chatId, lastMessage.messageId);
    }
  } catch (err) {}
};
