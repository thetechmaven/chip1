import bot from '..';

export const deleteMessage = (chatId: number, messageId: number) => {
  try {
    if (messageId) bot.deleteMessage(chatId, messageId);
  } catch (err) {}
};
