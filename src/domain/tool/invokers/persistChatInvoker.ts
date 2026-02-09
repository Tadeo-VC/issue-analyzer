import { Chat } from "../../chat";
import { PersistChat } from "../persistChat";
import { ToolInvoker, ToolResponse } from "./toolInvoker";

export class PersistChatInvoker implements ToolInvoker {
    private chat: Chat;
    private tool: PersistChat;

    constructor(chat: Chat, tool: PersistChat) {
        this.chat = chat;
        this.tool = tool;
    }

    async invoke(): Promise<ToolResponse> {
        try {
            this.tool.call(this.chat.getId());
        } catch (error) {
            return {
                status: "error",
                message: "Failed to persist chat",
                error: {
                    details: (error as Error).message
                }
            };
        }
        
        return {
            status: "success",
            message: `Chat persisted successfully`,
            data: {}
        };
    }
}