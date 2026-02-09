import { describe, it, expect, vi, beforeEach } from "vitest";
import { ClientLLM } from "@/src/domain/llm/clientLLM";
import { Chat } from "@/src/domain/chat";
import { User } from "@/src/domain/user";
import { CanonicalLLMMessage, LLMRole, Intention } from "@/src/domain/llm/canonicalLlmMessage";
import { MultiToolCall } from "@/src/domain/llm/clientLLM";

// Create a concrete implementation for testing
class TestClientLLM extends ClientLLM {
  sendRequest = vi.fn();
}

describe("ClientLLM", () => {
  let llm: TestClientLLM;
  let mockChat: Chat;
  let user: User;

  beforeEach(() => {
    llm = new TestClientLLM();
    user = new User("Test User", "test@example.com", "user-123");
    mockChat = new Chat("Test Chat", [], user, llm, "chat-123");
  });

  describe("generateResponse", () => {
    it("should return response for GENERAL_CHAT intention directly", async () => {
      const mockResponse: MultiToolCall = [
        {
          intention: Intention.GENERAL_CHAT,
          args: { response: "Hello, this is a response" }
        }
      ];
      
      vi.mocked(llm.sendRequest).mockResolvedValue(mockResponse);

      const result = await llm.generateResponse(mockChat);

      expect(result).toBe("Hello, this is a response");
      expect(llm.sendRequest).toHaveBeenCalledTimes(1);
    });

    it("should call buildPrompt to create system message", async () => {
      const mockResponse: MultiToolCall = [
        {
          intention: Intention.GENERAL_CHAT,
          args: { response: "test" }
        }
      ];
      
      vi.mocked(llm.sendRequest).mockResolvedValue(mockResponse);
      const buildPromptSpy = vi.spyOn(llm as any, "buildPrompt");

      await llm.generateResponse(mockChat);

      expect(buildPromptSpy).toHaveBeenCalled();
    });

    it("should call buildChatHistory to include conversation context", async () => {
      const mockResponse: MultiToolCall = [
        {
          intention: Intention.GENERAL_CHAT,
          args: { response: "test" }
        }
      ];
      
      vi.mocked(llm.sendRequest).mockResolvedValue(mockResponse);
      const buildChatHistorySpy = vi.spyOn(llm as any, "buildChatHistory");

      await llm.generateResponse(mockChat);

      expect(buildChatHistorySpy).toHaveBeenCalledWith(mockChat);
    });
  });

  describe("buildChatHistory", () => {
    it("should build history with user and assistant messages", () => {
      const msg1 = mockChat.newMessage("Hello");
      msg1.receiveResponse("Hi there");
      const msg2 = mockChat.newMessage("How are you?");
      msg2.receiveResponse("I'm good");

      const history = (llm as any).buildChatHistory(mockChat);

      expect(history).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ role: LLMRole.USER, content: "Hello" }),
          expect.objectContaining({ role: LLMRole.ASSISTANT, content: "Hi there" }),
          expect.objectContaining({ role: LLMRole.USER, content: "How are you?" }),
          expect.objectContaining({ role: LLMRole.ASSISTANT, content: "I'm good" }),
        ])
      );
    });

    it("should only include messages with responses", () => {
      const msg1 = mockChat.newMessage("Hello");
      msg1.receiveResponse("Hi there");
      const msg2 = mockChat.newMessage("Unanswered question");
      // msg2 has no response

      const history = (llm as any).buildChatHistory(mockChat);

      const assistantMessages = history.filter((m: CanonicalLLMMessage) => m.role === LLMRole.ASSISTANT);
      expect(assistantMessages).toHaveLength(1);
      expect(assistantMessages[0].content).toBe("Hi there");
    });

    it("should handle empty chat", () => {
      const emptyChat = new Chat("Empty", [], user, llm, "empty-chat");
      const history = (llm as any).buildChatHistory(emptyChat);

      expect(history).toEqual([]);
    });

    it("should preserve message order", () => {
      mockChat.newMessage("First");
      mockChat.newMessage("Second");
      mockChat.newMessage("Third");

      const history = (llm as any).buildChatHistory(mockChat);
      const userMessages = history.filter((m: CanonicalLLMMessage) => m.role === LLMRole.USER);

      expect(userMessages[0].content).toBe("First");
      expect(userMessages[1].content).toBe("Second");
      expect(userMessages[2].content).toBe("Third");
    });
  });

  describe("buildPrompt", () => {
    it("should create system prompt message with SYSTEM role", () => {
      const prompt = (llm as any).buildPrompt("Test system prompt");

      expect(prompt).toMatchObject({
        role: LLMRole.SYSTEM,
        content: "Test system prompt"
      });
    });

    it("should preserve prompt text exactly", () => {
      const promptText = "Custom system prompt with special chars !@#";
      const prompt = (llm as any).buildPrompt(promptText);

      expect(prompt.content).toBe(promptText);
    });
  });

  describe("validateLLMResponse", () => {
    it("should validate correct MultiToolCall response", () => {
      const response = [
        {
          intention: Intention.GENERAL_CHAT,
          args: { response: "test" }
        }
      ];

      const validated = (llm as any).validateLLMResponse(response);

      expect(validated).toEqual(response);
    });

    it("should throw error for invalid response schema", () => {
      const invalidResponse = [
        {
          invalid: "schema"
        }
      ];

      expect(() => (llm as any).validateLLMResponse(invalidResponse)).toThrow("Invalid LLM response");
    });

    it("should throw error for empty response", () => {
      expect(() => (llm as any).validateLLMResponse([])).toThrow("LLM response is empty");
    });

    it("should validate ANALYZE_ISSUES_COMPLEXITY intention", () => {
      const response = [
        {
          intention: Intention.ANALYZE_ISSUES_COMPLEXITY,
          args: { repo: "test", user: "testuser" }
        }
      ];

      const validated = (llm as any).validateLLMResponse(response);

      expect(validated[0].intention).toBe(Intention.ANALYZE_ISSUES_COMPLEXITY);
    });

    it("should validate PERSIST_CHAT intention", () => {
      const response = [
        {
          intention: Intention.PERSIST_CHAT,
          args: {}
        }
      ];

      const validated = (llm as any).validateLLMResponse(response);

      expect(validated[0].intention).toBe(Intention.PERSIST_CHAT);
    });
  });;

  describe("buildToolResultsMessage", () => {
    it("should create JSON message from tool results", () => {
      const toolResults = [
        {
          status: "success",
          message: "Tool executed successfully"
        }
      ];

      const message = (llm as any).buildToolResultsMessage(toolResults);

      expect(message.role).toBe(LLMRole.ASSISTANT);
      expect(message.content).toContain(JSON.stringify(toolResults));
    });

    it("should handle empty tool results array", () => {
      const toolResults: any[] = [];

      const message = (llm as any).buildToolResultsMessage(toolResults);

      expect(message.content).toBe(JSON.stringify(toolResults));
    });

    it("should handle complex tool results", () => {
      const toolResults = [
        {
          status: "success",
          data: {
            issues: [
              { id: 1, complexity: "HIGH" },
              { id: 2, complexity: "MEDIUM" }
            ]
          }
        }
      ];

      const message = (llm as any).buildToolResultsMessage(toolResults);

      expect(message.content).toContain("HIGH");
      expect(message.content).toContain("MEDIUM");
    });
  });

  describe("sendRequest abstract method", () => {
    it("should be overridable in subclass", () => {
      expect(typeof (llm as any).sendRequest).toBe("function");
    });

    it("should be marked as a mock function in test", () => {
      expect(llm.sendRequest).toBeDefined();
    });
  });
});