import { describe, it, expect, vi } from "vitest";
import { Agent } from "@/src/domain/Agent";
import type { ClientLLM } from "@/src/domain/llm/ClientLLM";
import type { Message } from "@/src/domain/Message";
import type { GenerateResult } from "@/src/domain/llm/GenerateResult";
import { ResponseResult, ToolCallResult } from "@/src/domain/llm/GenerateResult";
import type { Tool } from "@/src/domain/Tool";
import { UndefinedToolException } from "@/src/domain/Errors";

describe("Agent", () => {
  const createMockMessage = (request = "hello"): Message =>
    ({ request } as unknown as Message);
  
  const createMockTool = (result: string): Tool => ({
    name: "mockTool",
    call: vi.fn().mockResolvedValue(result),
  });

  const createMockLLM = (result: GenerateResult): ClientLLM => ({
    generateResponse: vi.fn().mockResolvedValue(result),
    receiveToolResponse: vi.fn(),
  });
  
  it("receiveMessage returns the text when the LLM returns ResponseResult", async () => {
    const text = "Hello, I am the assistant.";
    const llm = createMockLLM(new ResponseResult(text));
    const agent = new Agent(llm);

    const message = createMockMessage();
    const response = await agent.receiveMessage(message);

    expect(response).toBe(text);
    expect(llm.generateResponse).toHaveBeenCalledWith(message);
  });

  it("receiveMessage runs the tool and returns its result when the LLM returns ToolCallResult", async () => {
    const toolResult = "tool result";
    const tool = createMockTool(toolResult);
    const llm = createMockLLM(new ToolCallResult("mockTool", { q: "x" }));
    const agent = new Agent(llm, [tool]);

    const message = createMockMessage();
    const response = await agent.receiveMessage(message);

    expect(response).toBe(toolResult);
    expect(tool.call).toHaveBeenCalledWith({ q: "x" });
  });

  it("callTool throws UndefinedToolException when the tool does not exist", async () => {
    const llm = createMockLLM(new ResponseResult(""));
    const agent = new Agent(llm);

    await expect(agent.callTool("nonexistentTool", {})).rejects.toThrow(
      UndefinedToolException
    );
    await expect(agent.callTool("nonexistentTool", {})).rejects.toMatchObject({
      toolName: "nonexistentTool",
    });
  });

  it("getToolNames returns the names of the registered tools", () => {
    const tool1 = { name: "search", call: vi.fn() } as unknown as Tool;
    const tool2 = { name: "fetch", call: vi.fn() } as unknown as Tool;
    const agent = new Agent({ generateResponse: vi.fn() } as ClientLLM, [
      tool1,
      tool2,
    ]);

    expect(agent.getToolNames()).toEqual(["search", "fetch"]);
  });
});
