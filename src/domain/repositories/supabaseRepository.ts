import { SupabaseClient } from "@supabase/supabase-js";
import { Chat } from "../chat";
import { Message } from "../message";
import { User } from "../user";
import {
  DatabaseOperationError,
  UserNotFoundError,
} from "../errors";
import { th } from "zod/locales";

export interface DBRepository {
  saveChat(chat: Chat, userId: string): Promise<void>;
  getChatById(chatId: string): Promise<Chat | null>;
  getChatsByUserId(userId: string): Promise<Chat[]>;
  updateChat(chatId: string, chat: Chat): Promise<void>;
  deleteChat(chatId: string): Promise<void>;
  findUserById(userId: string): Promise<User | null>;
}

interface ChatRow {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface MessageRow {
  id: string;
  chat_id: string;
  request: string;
  response: string | null;
  response_state: string;
  created_at: string;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  password?: string | null;
  created_at?: string;
  updated_at?: string;
}

export class ChatSupabaseRepository implements DBRepository {
  private supabase: SupabaseClient;
  private chatsTable = "chats";
  private messagesTable = "messages";
  private usersTable = "users";

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  async saveChat(chat: Chat, userId: string): Promise<void> {
    const chatId = chat.getId();
    
    const { data, error } = await this.supabase
      .from(this.chatsTable)
      .insert([
        {
          id: chatId,
          title: chat.getTitle(),
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select("id")
      .single();

    if (error) {
      throw new DatabaseOperationError("save chat", error.message);
    }

    // Save all messages for this chat
    if (chat.getMessages().length > 0) {
      await this.saveMessages(chatId, chat.getMessages());
    }
  }

  private async saveMessages(chatId: string, messages: Message[]): Promise<void> {
    const messageRows = messages.map((msg) => ({
      chat_id: chatId,
      request: msg.getRequest(),
      response: msg.hasResponse() ? msg.getResponse() : null,
      response_state: msg.getResponseState(),
      created_at: new Date().toISOString(),
    }));

    const { error } = await this.supabase
      .from(this.messagesTable)
      .insert(messageRows);

    if (error) {
      throw new DatabaseOperationError("save messages", error.message);
    }
  }

  async getChatById(chatId: string): Promise<Chat | null> {
    const { data: chatData, error: chatError } = await this.supabase
      .from(this.chatsTable)
      .select("*")
      .eq("id", chatId)
      .single();

    if (chatError) {
      if (chatError.code === "PGRST116") {
        return null;
      }
      throw new DatabaseOperationError("fetch chat", chatError.message);
    }

    const { data: messagesData, error: messagesError } = await this.supabase
      .from(this.messagesTable)
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (messagesError) {
      throw new DatabaseOperationError("fetch messages", messagesError.message);
    }

    const messages = messagesData?.map(
      (msg: MessageRow) => this.mapMessageFromRow(msg)
    ) || [];

    return this.mapChatFromRow(chatData as ChatRow, messages);
  }

  async getChatsByUserId(userId: string): Promise<Chat[]> {
    const { data: chatsData, error: chatsError } = await this.supabase
      .from(this.chatsTable)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (chatsError) {
      throw new DatabaseOperationError("fetch chats", chatsError.message);
    }

    const chats: Chat[] = [];

    for (const chatRow of chatsData || []) {
      const { data: messagesData, error: messagesError } = await this.supabase
        .from(this.messagesTable)
        .select("*")
        .eq("chat_id", chatRow.id)
        .order("created_at", { ascending: true });

      if (messagesError) {
        throw new DatabaseOperationError("fetch messages", messagesError.message);
      }

      const messages = messagesData?.map((msg: MessageRow) =>
        this.mapMessageFromRow(msg)
      ) || [];

      chats.push(await this.mapChatFromRow(chatRow, messages));
    }

    return chats;
  }

  async updateChat(chatId: string, chat: Chat): Promise<void> {
    const { error } = await this.supabase
      .from(this.chatsTable)
      .update({
        title: chat.getTitle(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", chatId);

    if (error) {
      throw new DatabaseOperationError("update chat", error.message);
    }

    // Delete existing messages and insert new ones
    await this.supabase.from(this.messagesTable).delete().eq("chat_id", chatId);

    if (chat.getMessages().length > 0) {
      await this.saveMessages(chatId, chat.getMessages());
    }
  }

  async deleteChat(chatId: string): Promise<void> {
    // Delete messages first (foreign key constraint)
    const { error: messagesError } = await this.supabase
      .from(this.messagesTable)
      .delete()
      .eq("chat_id", chatId);

    if (messagesError) {
      throw new DatabaseOperationError("delete messages", messagesError.message);
    }

    // Delete chat
    const { error: chatError } = await this.supabase
      .from(this.chatsTable)
      .delete()
      .eq("id", chatId);

    if (chatError) {
      throw new DatabaseOperationError("delete chat", chatError.message);
    }
  }

  async findUserById(userId: string): Promise<User> {
    const { data, error } = await this.supabase
      .from(this.usersTable)
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new UserNotFoundError(userId);
      }
      throw new DatabaseOperationError("fetch user", error.message);
    }

    if (!data) {
      throw new UserNotFoundError(userId);
    }

    return this.mapUserFromRow(data as UserRow);
  }

  private async mapChatFromRow(row: ChatRow, messages: Message[]): Promise<Chat> {

    // Note: Agent is intentionally not persisted (transient)
    return new Chat(row.title, messages, await this.findUserById(row.user_id), null as any, row.id);
  }

  private mapMessageFromRow(row: MessageRow): Message {
    const message = new Message(row.request);
    if (row.response) {
      message.receiveResponse(row.response);
    }
    return message;
  }

  private mapUserFromRow(row: UserRow): User {
    return new User(row.name, row.email, row.id);
  }
}