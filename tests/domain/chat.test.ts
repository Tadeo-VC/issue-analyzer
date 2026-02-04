import { describe, it, expect, vi } from "vitest";
import { Chat } from "@/src/domain/Chat";
import { Message } from "@/src/domain/Message";
import { User } from "@/src/domain/User";
import type { Agent } from "@/src/domain/Agent";

describe("Chat", () => {
  const createMockAgent = (): Agent => ({
    receiveMessage: vi.fn().mockResolvedValue("response"),
    callTool: vi.fn(),
    getToolNames: vi.fn().mockReturnValue([]),
  } as unknown as Agent);

  const user = new User("name", "email", "pass");
  const agent = createMockAgent();

  it("newMessage creates and adds a new message", () => {
    const chat = new Chat("title", [], user, agent);
    const message = chat.newMessage("request");
    expect(message).toBeInstanceOf(Message);
    expect(message.getRequest()).toBe("request");
    // Assuming messages are private, can't check directly, but userInput should work
  });

  it("userInput returns the last message's request", () => {
    const chat = new Chat("title", [], user, agent);
    chat.newMessage("first");
    chat.newMessage("second");
    expect(chat.userInput()).toBe("second");
  });

  it("sendMessage calls agent.receiveMessage with the chat", async () => {
    const chat = new Chat("title", [], user, agent);
    await chat.sendMessage(chat);
    expect(agent.receiveMessage).toHaveBeenCalledWith(chat);
  });

  it("lastUserMessages returns the last user messages", () => {
    const chat = new Chat("title", [], user, agent);
    chat.newMessage("msg1");
    chat.newMessage("msg2");
    expect(chat.lastUserMessages()).toEqual(["msg1", "msg2"]);
  });

  it("lastAssistantMessages returns the last assistant messages", () => {
    const chat = new Chat("title", [], user, agent);
    const msg1 = chat.newMessage("msg1");
    const msg2 = chat.newMessage("msg2");
    msg1.receiveResponse("resp1");
    msg2.receiveResponse("resp2");
    expect(chat.lastAssistantMessages()).toEqual(["resp1", "resp2"]);
  });
});