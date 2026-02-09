import z from "zod";
import { ChatContextRepository } from "../repositories/chatContextRepository";
import { ToolResponse } from "./invokers/toolInvoker";

export class PersistChat {

    constructor() {}

    async call(chatId: string): Promise<ToolResponse> {
        const chatContextRepository = await ChatContextRepository.getInstance();
        try {
            chatContextRepository.persistChat(chatId);
            return {
                status: "success",
                message: `Chat persisted successfully`,
                data: {}
            };
        } catch (error) {
            return {
                status: "error",
                message: "Failed to persist chat",
                error: {
                    details: (error as Error).message
                }
            };
        }
    }
}