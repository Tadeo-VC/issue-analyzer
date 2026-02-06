
import { Tool } from "./tool";
import z from "zod";
import { ToolArgumentsError } from "../errors";
import { ChatContextRepository } from "../repositories/chatMemoryRepository";

export class PersistChat implements Tool {
    
    readonly name = "persist_chat";

    constructor() {}

    async call(args: unknown): Promise<string> {
        const result = toolSchema.safeParse(args);
        if (!result.success) {
            throw new ToolArgumentsError("persist_chat");
        }
        const chatId = result.data.args.chat_id;
        const chatMemoryRepository = await ChatContextRepository.getInstance();
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