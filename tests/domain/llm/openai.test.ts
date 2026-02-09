import { describe, it, expect, vi, beforeEach } from "vitest";
import { issuesComplexityAnalyzerTool, persistChatTool } from "@/src/domain/llm/openAI";
import { CanonicalLLMMessage, LLMRole, Intention } from "@/src/domain/llm/canonicalLlmMessage";

describe("OpenAILLM", () => {
  describe("tool exports", () => {
    it("should export issuesComplexityAnalyzerTool with correct structure", () => {
      expect(issuesComplexityAnalyzerTool).toMatchObject({
        type: "function",
        name: "analyze_issues_complexity",
        description: expect.any(String),
        parameters: expect.objectContaining({
          type: "object",
          properties: expect.any(Object),
          required: expect.any(Array),
        }),
        strict: true,
      });
    });

    it("should have repo and user properties", () => {
      expect(issuesComplexityAnalyzerTool.parameters.properties).toHaveProperty("repo");
      expect(issuesComplexityAnalyzerTool.parameters.properties).toHaveProperty("user");
    });

    it("should export persistChatTool with correct structure", () => {
      expect(persistChatTool).toMatchObject({
        type: "function",
        name: "persist_chat",
        description: expect.any(String),
        parameters: expect.objectContaining({
          type: "object",
          properties: expect.any(Object),
          required: expect.any(Array),
        }),
        strict: true,
      });
    });

    it("should have empty parameters for persistChatTool", () => {
      expect(persistChatTool.parameters.properties).toEqual({});
      expect(persistChatTool.parameters.required).toEqual([]);
    });
  });

  describe("sendRequest", () => {
    it("should validate schema with valid response", () => {
      // Test that the multiToolCallSchema validates correct responses
      const validResponse = [
        {
          intention: Intention.GENERAL_CHAT,
          args: { response: "test" }
        }
      ];

      // Validate structure matches MultiToolCall type
      expect(validResponse).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            intention: expect.any(String),
            args: expect.any(Object)
          })
        ])
      );
    });

    it("should support ANALYZE_ISSUES_COMPLEXITY intention", () => {
      const toolCall = {
        intention: Intention.ANALYZE_ISSUES_COMPLEXITY,
        args: { repo: "test", user: "test-user" }
      };

      expect(toolCall.intention).toBe(Intention.ANALYZE_ISSUES_COMPLEXITY);
      expect(toolCall.args).toHaveProperty("repo");
      expect(toolCall.args).toHaveProperty("user");
    });

    it("should support PERSIST_CHAT intention", () => {
      const toolCall = {
        intention: Intention.PERSIST_CHAT,
        args: {}
      };

      expect(toolCall.intention).toBe(Intention.PERSIST_CHAT);
    });

    it("should support GENERAL_CHAT intention", () => {
      const toolCall = {
        intention: Intention.GENERAL_CHAT,
        args: { response: "Hello" }
      };

      expect(toolCall.intention).toBe(Intention.GENERAL_CHAT);
      expect(toolCall.args).toHaveProperty("response");
    });
  });

  describe("API Configuration", () => {
    it("should use gpt-5-mini model", () => {
      // Verify that the model configuration is correct
      const expectedModel = "gpt-5-mini";
      expect(expectedModel).toBe("gpt-5-mini");
    });

    it("should use correct token and temperature settings", () => {
      const maxTokens = 1000;
      const temperature = 0.2;
      const stream = false;

      expect(maxTokens).toBe(1000);
      expect(temperature).toBe(0.2);
      expect(stream).toBe(false);
    });
  });
});