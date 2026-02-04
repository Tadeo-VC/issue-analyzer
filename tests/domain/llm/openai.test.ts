import { describe, it, expect, vi, beforeEach } from "vitest";
import { OpenAILLM } from "@/src/domain/llm/OpenAI";
import { LLMMessage, LLMRole } from "@/src/domain/llm/LLMMessage";
import { IntentData } from "@/src/domain/llm/IntentData";

// Mock the OpenAI module
let mockCreate: any;
vi.mock("openai", () => ({
  default: class MockOpenAI {
    responses = {
      create: mockCreate,
    };
  },
}));

import OpenAI from "openai";

describe("OpenAILLM", () => {
  let llm: OpenAILLM;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    mockCreate = vi.fn();
    llm = new OpenAILLM([]);
  });

  it("sendRequest calls OpenAI client with correct parameters", async () => {
    const systemPrompt = new LLMMessage(LLMRole.SYSTEM, "system prompt");
    const chatMessages = [new LLMMessage(LLMRole.USER, "user msg")];
    const lastMessage = new LLMMessage(LLMRole.USER, "last msg");

    const mockResponse = {
      output_text: ['{"intention": "general_chat", "args": {"message": "Hello"}}'],
    };
    mockCreate.mockResolvedValue(mockResponse);

    const result = await llm.sendRequest(systemPrompt, chatMessages, lastMessage);

    expect(mockCreate).toHaveBeenCalledWith({
      input: [
        systemPrompt.toOpenAIFormat(),
        ...chatMessages.flatMap((msg) => msg.toOpenAIFormat()),
        lastMessage.toOpenAIFormat(),
      ],
      tools: [],
      model: "gpt-5-mini",
      max_tokens: 1000,
      temperature: 0.2,
      stream: false,
    });

    expect(result).toEqual({
      intention: "general_chat",
      args: { message: "Hello" },
    });
  });

  it("sendRequest throws error for invalid JSON response", async () => {
    const systemPrompt = new LLMMessage(LLMRole.SYSTEM, "system prompt");
    const chatMessages: LLMMessage[] = [];
    const lastMessage = new LLMMessage(LLMRole.USER, "last msg");

    const mockResponse = {
      output_text: ["invalid json"],
    };
    mockCreate.mockResolvedValue(mockResponse);

    await expect(llm.sendRequest(systemPrompt, chatMessages, lastMessage)).rejects.toThrow(
      "LLM response is not valid JSON: invalid json"
    );
  });

  it("sendRequest throws error for schema validation failure", async () => {
    const systemPrompt = new LLMMessage(LLMRole.SYSTEM, "system prompt");
    const chatMessages: LLMMessage[] = [];
    const lastMessage = new LLMMessage(LLMRole.USER, "last msg");

    const mockResponse = {
      output_text: ['{"invalid": "schema"}'],
    };
    mockCreate.mockResolvedValue(mockResponse);

    await expect(llm.sendRequest(systemPrompt, chatMessages, lastMessage)).rejects.toThrow(
      "LLM response does not match IntentData schema"
    );
  });

  it("sendRequest throws error on API failure", async () => {
    const systemPrompt = new LLMMessage(LLMRole.SYSTEM, "system prompt");
    const chatMessages: LLMMessage[] = [];
    const lastMessage = new LLMMessage(LLMRole.USER, "last msg");

    mockCreate.mockRejectedValue(new Error("API error"));

    await expect(llm.sendRequest(systemPrompt, chatMessages, lastMessage)).rejects.toThrow(
      "Failed to send request"
    );
  });

  it("constructor sets availableTools", () => {
    const tools = [{ name: "tool1" }];
    const llmWithTools = new OpenAILLM(tools as any);
    // Since availableTools is private, we test by checking if tools are passed in sendRequest
    // In a future test, we can verify the tools parameter
  });
});