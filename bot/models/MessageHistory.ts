import ChatMessageHistory, {
  ILastMessage,
  IRecentConversation,
} from './ChatMessageHistory';

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
  addRecentConversation = (
    chatId: number,
    conversation: IRecentConversation
  ) => {
    if (this.users[chatId]) {
      this.users[chatId].addRecentConversation(conversation);
    } else {
      this.users[chatId] = new ChatMessageHistory(chatId);
      this.users[chatId].addRecentConversation(conversation);
    }
  };
  getRecentConversations = (chatId: number) => {
    return this.users[chatId]?.getRecentConversations() || [];
  };
  addLoadingMessage = (chatId: number, messageId: number) => {
    if (this.users[chatId]) {
      this.users[chatId].addLoadingMessage(messageId);
    } else {
      this.users[chatId] = new ChatMessageHistory(chatId);
      this.users[chatId].addLoadingMessage(messageId);
    }
  };
  deleteLoadingMessages = (chatId: number, bot: any) => {
    this.users[chatId]?.deleteLoadingMessages(bot);
  };

  setSuperCommand = (chatId: number, command: string) => {
    if (this.users[chatId]) {
      this.users[chatId].setSuperCommand(command);
    } else {
      this.users[chatId] = new ChatMessageHistory(chatId);
      this.users[chatId].setSuperCommand(command);
    }
  };
  getSuperCommand = (chatId: number) => {
    return this.users[chatId]?.getSuperCommand() || '';
  };
}

export default MessageHistory;
