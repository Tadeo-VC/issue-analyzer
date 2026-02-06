import { ChatSupabaseRepository } from "../repositories/chatSupabaseRepository";
import { ChatMemoryRepository } from "../repositories/chatMemoryRepository";
import { Tool } from "./tool";
import z from "zod";

export class PersistChat implements Tool {
    
    private toolName = "persist_chat";

    constructor() {}

    name(): string {
        return this.toolName;
    }

    async call(args: unknown): Promise<string> {
        const result = toolSchema.safeParse(args);
        if (!result.success) {
            throw new Error("Invalid arguments for persist_chat tool");
        }
        const chatId = result.data.args.chat_id;
        const chatMemoryRepository = await ChatMemoryRepository.getInstance();
        try {
            chatMemoryRepository.persistChat(chatId);
            return `{
                    "success": true,
                    "chatId": "${chatId}"
                    }`;
        } catch (error) {
            return `{
                        "success": false,
                        "error": "${(error as Error).message}"
                    }`;
        }
    }
}

const toolSchema = z.object({
  intention: z.literal("persist_chat"),    
  args: z.object({
    chat_id: z.string(),        
  })
});