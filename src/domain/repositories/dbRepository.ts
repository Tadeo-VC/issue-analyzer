import { Chat } from "../chat";
import { User } from "../user";

export interface DBRepository {
  saveChat(chat: Chat, userId: string): Promise<void>;
  getChatById(chatId: string): Promise<Chat | null>;
  getChatsByUserId(userId: string): Promise<Chat[]>;
  updateChat(chatId: string, chat: Chat): Promise<void>;
  deleteChat(chatId: string): Promise<void>;
  findUserById(userId: string): Promise<User>;
}