import { Chat } from "@/src/domain/chat";
import { Message } from "@/src/domain/message";
import { User } from "@/src/domain/user";
import { ClientLLM } from "@/src/domain/llm/clientLLM";
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Chat", () => {
  let mockLLM: ClientLLM;
  let user: User;
  let chat: Chat;

  beforeEach(() => {
    mockLLM = {
      generateResponse: vi.fn().mockResolvedValue("assistant response"),
    } as unknown as ClientLLM;
    user = new User("name", "email", "user-id");
    chat = new Chat("title", [], user, mockLLM);
  });

  it("newMessage creates and adds a new message", () => {
    const message = chat.newMessage("request");
    expect(message).toBeInstanceOf(Message);
    expect(message.getRequest()).toBe("request");
  });

  it("lastUserMessages returns the last user messages", () => {
    chat.newMessage("msg1");
    chat.newMessage("msg2");
    expect(chat.lastUserMessages()).toEqual(["msg1", "msg2"]);
  });

  it("lastAssistantMessages returns the last assistant messages", () => {
    const msg1 = chat.newMessage("msg1");
    const msg2 = chat.newMessage("msg2");
    msg1.receiveResponse("resp1");
    msg2.receiveResponse("resp2");
    expect(chat.lastAssistantMessages()).toEqual(["resp1", "resp2"]);
  });

  it("sendMessage calls llm.generateResponse with the chat", async () => {
    const message = chat.newMessage("test");
    await chat.sendMessage(chat);
    
    expect(mockLLM.generateResponse).toHaveBeenCalledWith(chat);
    expect(message.hasResponse()).toBe(true);
    expect(message.getResponse()).toBe("assistant response");
  });
});