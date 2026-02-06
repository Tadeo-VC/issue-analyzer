import { uuidv4 } from "zod/v4/mini";
import { Chat } from "./chat";
import { Agent } from "./agent";
import { User } from "./user";

export class ChatFactory {

  static createNewChat(title: string, user: User, agent: Agent): Chat {
    return new Chat(title, [], user, agent,  uuidv4().toString()); // At runtime, Zod UUID behaves just like a string.
  }
}