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
        return this.tool.call(this.chat.getId());
    }
}