import { Message } from "./message";
import { User } from "./user";
import { Agent } from "./agent";

class Chat {
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
}