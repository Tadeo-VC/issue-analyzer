import z from "zod";
import { Chat } from "../chat";
import { User } from "../user";
import { DBRepository } from "./dbRepository";
import { createSupabaseServerClient } from "@/src/utils/supabase/serverClient";
import {
  MissingAuthTokenError,
  InvalidChatError,
  ChatNotFoundError,
} from "../errors";
import { SupabaseRepository } from "./supabaseRepository";

interface ChatContext {
    chat: Chat
    authToken: string;
}

export const ChatContextSchema = z.object({
  chat: z.instanceof(Chat),
  authToken: z.string(),
});

export class ChatMemoryRepository {
    private chats: Map<string, ChatContext>;
    private dbRepository: DBRepository;
    private static instance: ChatMemoryRepository;
    private ttlMs = 30 * 60 * 1000; // 30 minutes, time to live minutes
    private timers: Map<string, NodeJS.Timeout>;

    public static async getInstance(): Promise<ChatMemoryRepository> {
        if (!this.instance) {
            this.instance = new ChatMemoryRepository(new SupabaseRepository(await createSupabaseServerClient()));
        }
        return this.instance;
    }

    constructor(dbRepository: DBRepository) {
        this.chats = new Map<string, ChatContext>();
        this.dbRepository = dbRepository;
        this.timers = new Map<string, NodeJS.Timeout>();
    }

    saveChat(chat: Chat, authToken: string) {
        
        if(!authToken || authToken.trim() === "") {
            throw new MissingAuthTokenError();
        }

        if(!chat) {
            throw new InvalidChatError("Chat");
        }

        if (this.chats.has(chat.getId())) {
            return
        }

        this.chats.set(chat.getId(), { chat, authToken });
        this.setTTL(chat);
    }

    // every user message resets the TTL
    findChatById(chatId: string): Chat | null {
        const context = this.chats.get(chatId) || null;
        if (context) {
            this.setTTL(context.chat);
            return context.chat;
        }
        return null;
    }

    // for tool persistChat
    async persistChat(chatId: string) {
        const context = this.chats.get(chatId);
        if (!context) {
            throw new ChatNotFoundError(chatId);
        }
        this.dbRepository.saveChat(context.chat, context.chat.getUserId());
    }

    async getUserChats(user: User): Promise<Chat[]> {
        
        const supabaseChats = await this.dbRepository.getChatsByUserId(user.getId());
        supabaseChats.forEach(chat => {
            const context = { chat, authToken: "" };
            this.chats.set(chat.getId(), context);
        });

        const userChats: Chat[] = [];
        for (const context of this.chats.values()) {
            if (context.chat.getUserId() === user.getId()) {
                userChats.push(context.chat);
            }
        }

        return userChats;
    }

    async getUserAuth(chatId: string): Promise<string> {
        const context = this.chats.get(chatId);
        if (!context) {
            throw new ChatNotFoundError(chatId);
        }
        return context.authToken;
    }

    async deleteChat(chat: Chat): Promise<void> {
        this.chats.delete(chat.getId());
        this.timers.delete(chat.getId());
        await this.dbRepository.deleteChat(chat.getId());
    }

    private setTTL(chat: Chat): void {
        const existingTimer = this.timers.get(chat.getId());
        if (existingTimer) clearTimeout(existingTimer);

        const timer = setTimeout(() => {
            this.deleteChat(chat);
        }, this.ttlMs);

        this.timers.set(chat.getId(), timer);
    }
}