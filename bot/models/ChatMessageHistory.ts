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
  _lastMessage?: ILastMessage;
  recentConversation: IRecentConversation[];
  constructor(chatId: number) {
    this.chatId = chatId;
    this.recentConversation = [];
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
}

export default ChatMessageHistory;
