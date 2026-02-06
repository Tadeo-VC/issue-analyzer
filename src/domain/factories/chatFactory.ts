import { uuidv4 } from "zod/v4/mini";
import { User } from "../user";
import { Chat } from "../chat";
import { Agent } from "../agent";
import { AgentFactory } from "./agentFactory";

export class ChatFactory {

  static async createNewChat(title: string, user: User): Promise<Chat> {
    const agent = await AgentFactory.createAgent()
    return new Chat(title, [], user, agent,  uuidv4().toString()); // At runtime, Zod UUID behaves just like a string.
  }
}