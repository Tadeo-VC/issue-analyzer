import z from "zod";
import { ChatContextRepository } from "../repositories/chatContextRepository";
import { ToolResponse } from "./invokers/toolInvoker";

export class PersistChat {

    constructor() {}

    async call(chatId: string): Promise<void> {
        const repo = await ChatContextRepository.getInstance();
        repo.persistChat(chatId)
    }
}