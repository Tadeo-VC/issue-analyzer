import { describe, it, expect } from "vitest";
import { LLMMessage, LLMRole } from "@/src/domain/llm/llmMessage";

describe("LLMMessage", () => {
  it("constructor sets role and content", () => {
    const message = new LLMMessage(LLMRole.USER, "content");
    expect(message.toString()).toContain('"role":"user"');
    expect(message.toString()).toContain('"content":"content"');
  });

  it("toOpenAIFormat returns correct format", () => {
    const message = new LLMMessage(LLMRole.SYSTEM, "system prompt");
    const format = message.toOpenAIFormat();
    expect(format).toEqual({
      role: "system",
      content: [{ type: "input_text", text: "system prompt" }]
    });
  });

  it("toString returns JSON string", () => {
    const message = new LLMMessage(LLMRole.ASSISTANT, "response");
    const str = message.toString();
    expect(str).toBe('{"role":"assistant","content":"response"}');
  });
});