import { Message } from "./message";
import { User } from "./user";
import { ClientLLM } from "./llm/clientLLM";
export class Chat {

  private id: string;
  private title: string;
  private messages: Message[];
  private user: User;
  private llm: ClientLLM;

  constructor(title: string, messages: Message[], user: User, llm: ClientLLM, id: string) {
    this.id = id || this.generateId();
    this.title = title;
    this.messages = messages;
    this.user = user;
    this.llm = llm;
  }

  private generateId(): string {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  newMessage(request: string): Message {
    const message = new Message(request);
    this.messages.push(message);
    return message;
  }

  async sendMessage(chat: Chat): Promise<void> {
    const response = await this.llm.generateResponse(chat);
    const lastMessage = this.messages[this.messages.length - 1];
    lastMessage.receiveResponse(response);
  }

  lastUserMessages(): string[] {
    const userMessages: string[] = [];
    for (let i = this.messages.length - 1; i >= 0 && userMessages.length < 10; i--) {
      userMessages.unshift(this.messages[i].getRequest());
    }
    return userMessages;
  }
  
  lastAssistantMessages(): string[] {
    const assistantMessages: string[] = [];
    for (let i = this.messages.length - 1; i >= 0 && assistantMessages.length < 10; i--) {
      const message = this.messages[i];
      if (message.hasResponse()) {
        assistantMessages.unshift(message.getResponse()!);
      }
    }
    return assistantMessages;
  }  

  getUserName(): string {
    return this.user.getName();
  }

  getTitle(): string {
    return this.title;
  }

  getMessages(): Message[] {
    return this.messages;
  }

  getUser(): User {
    return this.user;
  }

  getLlm(): ClientLLM {
    return this.llm;
  }

  getId(): string {
    return this.id;
  }

  setId(id: string): void {
    this.id = id;
  }

  getUserId(): string {
    return this.user.getId();
  }
}