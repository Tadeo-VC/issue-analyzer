import z from "zod";
import { Chat } from "../chat";
import { User } from "../user";
import { DBRepository } from "./dbRepository";
import { ChatSupabaseRepository } from "./supabaseRepository";
import { createSupabaseServerClient } from "@/src/utils/supabase/serverClient";

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
            this.instance = new ChatMemoryRepository(new ChatSupabaseRepository(await createSupabaseServerClient()));
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
            throw new Error("Auth token is required to save chat in memory");
        }

        if(!chat) {
            throw new Error("Chat is required to save chat in memory");
        }

        if (this.chats.has(chat.getId())) {
            return
        }

        this.chats.set(chat.getId(), { chat, authToken });
    }

    // every user message resets the TTL
    findChatById(chatId: string): Chat {
        const chatContext = ChatContextSchema.parse(this.chats.get(chatId));
        if (chatContext && chatContext.chat) {
            this.setTTL(chatContext.chat);
        }
        return chatContext.chat;
    }

    // for tool persistChat
    async persistChat(chatId: string) {
        const chatContext = this.chats.get(chatId);
        if (!chatContext) {
            throw new Error(`Chat with id ${chatId} not found in memory`);
        }
        this.dbRepository.saveChat(chatContext.chat, chatContext.chat.getUserId());
    }

    async getUserChats(user: User, authToken: string): Promise<Chat[]> {
        
        const supabaseChats = await this.dbRepository.getChatsByUserId(user.getId());
        supabaseChats.forEach(chat => {
            this.saveChat(chat, authToken);
        });

        const userChats: Chat[] = [];
        for (const chatContext of this.chats.values()) {
            if (chatContext.chat.getUserId() === user.getId() && chatContext.authToken === authToken) {
                userChats.push(chatContext.chat);
            }
        }

        return userChats;
    }

    async deleteChat(chat: Chat): Promise<void> {
        this.chats.delete(chat.getId());
        this.timers.delete(chat.getId());
        await this.dbRepository.deleteChat(chat.getId());
    }

    // analyze_issue_complexity
    getUserAuth(chatId: string): string {
        const chatContext = this.chats.get(chatId);
        if (!chatContext) {
            throw new Error(`Chat with id ${chatId} not found in memory`);
        }
        return chatContext.authToken; 
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