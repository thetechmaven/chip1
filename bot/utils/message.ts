import bot from '..';

export const deleteMessage = (chatId: number, messageId: number) => {
  bot.deleteMessage(chatId, messageId);
};
