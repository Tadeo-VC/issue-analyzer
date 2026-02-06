import { Chat } from "../chat";
import { User } from "../user";
import { DBRepository } from "./dbRepository";
import { ChatSupabaseRepository } from "./supabaseRepository";
import { createSupabaseServerClient } from "@/src/utils/supabase/serverClient";

export class ChatMemoryRepository {
    private chats: Map<string, Chat>;
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
        this.chats = new Map<string, Chat>();
        this.dbRepository = dbRepository;
        this.timers = new Map<string, NodeJS.Timeout>();
    }

    saveChat(chat: Chat) {
        this.chats.set(chat.getId(), chat);
    }

    // every user message resets the TTL
    findChatById(chatId: string): Chat | null {
        const chat = this.chats.get(chatId) || null;
        if (chat) {
            this.setTTL(chat);
        }
        return chat;
    }

    // for tool persistChat
    async persistChat(chatId: string) {
        const chat = this.chats.get(chatId);
        if (!chat) {
            throw new Error(`Chat with id ${chatId} not found in memory`);
        }
        this.dbRepository.saveChat(chat, chat.getUserId());
    }

    async getUserChats(user: User): Promise<Chat[]> {
        
        const supabaseChats = await this.dbRepository.getChatsByUserId(user.getId());
        supabaseChats.forEach(chat => {
            this.saveChat(chat);
        });

        const userChats: Chat[] = [];
        for (const chat of this.chats.values()) {
            if (chat.getUserId() === user.getId()) {
                userChats.push(chat);
            }
        }

        return userChats;
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