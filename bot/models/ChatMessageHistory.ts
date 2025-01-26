export interface ILastMessage {
  messageId?: number;
  command?: string;
}

export interface IRecentConversation {
  time: number;
  query: string;
  answer: string;
}

class ChatMessageHistory {
  chatId: number;
  loadingMessages: number[];
  _lastMessage?: ILastMessage;
  superCommand: string;
  recentConversation: IRecentConversation[];
  constructor(chatId: number) {
    this.chatId = chatId;
    this.recentConversation = [];
    this.loadingMessages = [];
    this.superCommand = '';
  }

  get lastMessage() {
    return this._lastMessage;
  }

  set lastMessage(m: undefined | ILastMessage) {
    this._lastMessage = m;
  }

  addRecentConversation = (conversation: IRecentConversation) => {
    if (this.recentConversation.length >= 7) {
      this.recentConversation.shift();
    }
    this.recentConversation.push(conversation);
  };

  getRecentConversations = () => {
    return this.recentConversation;
  };

  addLoadingMessage = (messageId: number) => {
    this.loadingMessages.push(messageId);
  };

  deleteLoadingMessages = (bot: any) => {
    try {
      this.loadingMessages.forEach((messageId) => {
        bot.deleteMessage(this.chatId, messageId);
      });
      this.loadingMessages = [];
    } catch (error) {
      console.error(
        `Failed to delete loading messages in chat ${this.chatId}:`,
        error
      );
    }
  };

  setSuperCommand = (command: string) => {
    this.superCommand = command;
  };
  getSuperCommand = () => {
    const superCommand = this.superCommand;
    this.superCommand = '';
    return superCommand;
  };
}

export default ChatMessageHistory;
