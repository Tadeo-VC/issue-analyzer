import { Message } from "./message";
import { User } from "./user";
import { Agent } from "./agent";
export class Chat {
  private id: string;
  private title: string;
  private messages: Message[];
  private user: User;
  private agent: Agent;

  constructor(title: string, messages: Message[], user: User, agent: Agent, id?: string) {
    this.id = id || this.generateId();
    this.title = title;
    this.messages = messages;
    this.user = user;
    this.agent = agent;
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
    const response = await this.agent.receiveMessage(chat);
  }

  userInput(): string {
    return this.messages[this.messages.length - 1].getRequest()
  }

  lastUserMessages(): string[] {
    return this.lastTenMessages(this.messages).map(m => m.getRequest());
  }
  
  lastAssistantMessages(): string[] {
    return this.lastTenMessages(this.messages).map(m => m.getResponse());
  }  

  private lastTenMessages(messages: Message[]): Message[] {
    return this.messages.slice(-10);
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

  getAgent(): Agent {
    return this.agent;
  }

  getId(): string {
    return this.id;
  }

  setId(id: string): void {
    this.id = id;
  }
}