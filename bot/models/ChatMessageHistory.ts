export interface ILastMessage {
  messageId?: number;
  command?: string;
}

class ChatMessageHistory {
  chatId: number;
  _lastMessage?: ILastMessage;
  constructor(chatId: number) {
    this.chatId = chatId;
  }

  get lastMessage() {
    return this._lastMessage;
  }

  set lastMessage(m: undefined | ILastMessage) {
    this._lastMessage = m;
  }
}

export default ChatMessageHistory;
