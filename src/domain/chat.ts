import { Message } from "./Message";
import { User } from "./User";
import { Agent } from "./Agent";

export class Chat {
  private title: string;
  private messages: Message[];
  private user: User;
  private agent: Agent;

  constructor(title: string, messages: Message[], user: User, agent: Agent) {
    this.title = title;
    this.messages = messages;
    this.user = user;
    this.agent = agent;
  }

  newMessage(request: string): Message {
    const message = new Message(request);
    this.messages.push(message);
    return message;
  }

  async sendMessage(chat: Chat): Promise<void> {
    const response = await this.agent.receiveMessage(chat);
  }

  lastUserMessages(): string[] {
    return this.messages.slice(-10).map(m => m.getRequest());
  }
  
  lastAssistantMessages(): string[] {
    return this.messages.slice(-10).map(m => m.getResponse());
  }  
}