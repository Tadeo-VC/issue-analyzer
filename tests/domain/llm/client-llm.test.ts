import { describe, it, expect, vi } from "vitest";
import { ClientLLM } from "@/src/domain/llm/clientLLM";
import { Chat } from "@/src/domain/chat";
import { ResponseResult, ToolCallResult } from "@/src/domain/llm/generateResult";
import { Intention } from "@/src/domain/llm/llmMessage";
import { IntentData } from "@/src/domain/llm/intentData";

class TestClientLLM extends ClientLLM {
  sendRequest = vi.fn();
}

describe("ClientLLM", () => {
  const createMockChat = (): Chat => ({
    userInput: vi.fn().mockReturnValue("user input"),
    lastUserMessages: vi.fn().mockReturnValue(["msg1"]),
    lastAssistantMessages: vi.fn().mockReturnValue(["resp1"]),
  } as unknown as Chat);

  it("generateResponse returns ToolCallResult for ANALYZE_ISSUES_PRIORITY", async () => {
    const llm = new TestClientLLM();
    const intentData: IntentData = {
      intention: Intention.ANALYZE_ISSUES_PRIORITY,
      args: { priority: "high" }
    };
    llm.sendRequest.mockResolvedValue(intentData);

    const chat = createMockChat();
    const result = await llm.generateResponse(chat);

    expect(result).toBeInstanceOf(ToolCallResult);
    expect(llm.sendRequest).toHaveBeenCalledTimes(1);
  });

  it("generateResponse returns ResponseResult for GENERAL_CHAT", async () => {
    const llm = new TestClientLLM();
    const intentData: IntentData = {
      intention: Intention.GENERAL_CHAT,
      args: { message: "Hello" }
    };
    llm.sendRequest
      .mockResolvedValueOnce({ intention: Intention.GENERAL_CHAT, args: {} }) // first call for intention
      .mockResolvedValueOnce(intentData); // second for natural language

    const chat = createMockChat();
    const result = await llm.generateResponse(chat);

    expect(result).toBeInstanceOf(ResponseResult);
    expect(llm.sendRequest).toHaveBeenCalledTimes(2);
  });

  it("generateResponse throws error for unsupported intention", async () => {
    const llm = new TestClientLLM();
    const intentData: IntentData = {
      intention: "unknown" as any,
      args: {}
    };
    llm.sendRequest.mockResolvedValue(intentData);

    const chat = createMockChat();
    await expect(llm.generateResponse(chat)).rejects.toThrow("Unsupported intention: unknown");
  });

  it("generateToolResponse calls sendRequest and returns ResponseResult", async () => {
    const llm = new TestClientLLM();
    const intentData: IntentData = {
      intention: "general_chat",
      args: { message: "Explanation" }
    };
    llm.sendRequest.mockResolvedValue(intentData);

    const chat = createMockChat();
    const result = await llm.generateToolResponse({ result: "data" }, chat);

    expect(result).toBeInstanceOf(ResponseResult);
    expect(llm.sendRequest).toHaveBeenCalledWith(
      expect.any(Object), // system prompt
      expect.arrayContaining([
        expect.objectContaining({ content: JSON.stringify({ result: "data" }) })
      ]),
      expect.any(Object) // last message
    );
  });
});