import { uuidv4 } from "zod/v4/mini";
import { User } from "../user";
import { Chat } from "../chat";
import { issuesComplexityAnalyzerTool, OpenAILLM, persistChatTool } from "../llm/openAI";
export class ChatFactory {

  static async createNewChat(title: string, user: User): Promise<Chat> {

    return new Chat(title, [], user, new OpenAILLM([issuesComplexityAnalyzerTool, persistChatTool]),  uuidv4().toString()); // At runtime, Zod UUID behaves just like a string.
  }
}