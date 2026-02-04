import { describe, it, expect, vi } from "vitest";
import { ResponseResult, ToolCallResult } from "@/src/domain/llm/GenerateResult";
import { IntentData } from "@/src/domain/llm/IntentData";
import type { Agent } from "@/src/domain/Agent";
import { Chat } from "@/src/domain/Chat";

describe("GenerateResult", () => {
  describe("ResponseResult", () => {
    it("getResponse returns the message from IntentData", async () => {
      const intentData: IntentData = {
        intention: "general_chat",
        args: { message: "Hello world" }
      };
      const result = new ResponseResult(intentData);
      expect(await result.getResponse({} as Agent)).toBe("Hello world");
    });
  });

  describe("ToolCallResult", () => {
    it("getResponse calls runner.callTool with correct params", async () => {
      const mockAgent: Agent = {
        callTool: vi.fn().mockResolvedValue("tool result"),
        receiveMessage: vi.fn(),
        getToolNames: vi.fn(),
      } as unknown as Agent;
      const chat = {} as Chat;
      const result = new ToolCallResult("toolName", { arg: "value" }, chat);
      const response = await result.getResponse(mockAgent);
      expect(mockAgent.callTool).toHaveBeenCalledWith("toolName", { arg: "value" }, chat);
      expect(response).toBe("tool result");
    });
  });
});