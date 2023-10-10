import ChatMessageHistory, { ILastMessage } from './ChatMessageHistory';

class MessageHistory {
  users: { [x: number]: ChatMessageHistory };
  constructor() {
    this.users = {};
  }
  addUser = (chatId: number) => {
    this.users[chatId] = new ChatMessageHistory(chatId);
  };
  getLastMessage = (chatId: number) => {
    return this.users[chatId]?.lastMessage;
  };
  setLastMessage = (chatId: number, m: ILastMessage) => {
    if (this.users[chatId]) {
      this.users[chatId].lastMessage = m;
    } else {
      const messageHistory = new ChatMessageHistory(chatId);
      messageHistory.lastMessage = m;
      this.users[chatId] = messageHistory;
    }
  };
}

export default MessageHistory;
