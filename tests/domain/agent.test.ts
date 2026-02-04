import { Chat } from "@/src/domain/chat";
import { describe, it, expect, vi } from "vitest";
import { Agent } from "@/src/domain/agent";
import { UndefinedToolException } from "@/src/domain/errors";
import { ClientLLM } from "@/src/domain/llm/clientLLM";
import { Tool } from "@/src/domain/tool/tool";
import { GenerateResult, ResponseResult, ToolCallResult } from "@/src/domain/llm/generateResult";
import { IntentData } from "@/src/domain/llm/intentData";

describe("Agent", () => {

  const createMockChat = (): Chat => ({
    newMessage: vi.fn(),
    sendMessage: vi.fn(),
    userInput: vi.fn().mockReturnValue("user input"),
    lastUserMessages: vi.fn().mockReturnValue(["msg1", "msg2"]),
    lastAssistantMessages: vi.fn().mockReturnValue(["resp1", "resp2"]),
  } as unknown as Chat);

  
  const createMockTool = (result: string): Tool => ({
    name: "mockTool",
    call: vi.fn().mockResolvedValue(result),
  });

  const createMockLLM = (result: GenerateResult): ClientLLM => ({
    generateResponse: vi.fn().mockResolvedValue(result),
    generateToolResponse: vi.fn(),
    sendRequest: vi.fn()
  } as unknown as ClientLLM); 
  
  it("receiveMessage returns the text when the LLM returns ResponseResult", async () => {
    const intentData: IntentData = {
      intention: "general_chat" ,
      args: { message : "Hello" }
    };
    const llm = createMockLLM(new ResponseResult(intentData))
    const agent = new Agent(llm);

    const chat = createMockChat();
    const response = await agent.receiveMessage(chat);

    expect(response).toBe("Hello");
    expect(llm.generateResponse).toHaveBeenCalledWith(chat);
  });

  it("receiveMessage runs the tool and returns its result when the LLM returns ToolCallResult", async () => {
    const toolResult = "tool result";
    const tool = createMockTool(toolResult);
    const llm = createMockLLM(new ToolCallResult("mockTool", { q: "x" }, {} as Chat));
    const agent = new Agent(llm, [tool]);

    const chat = createMockChat();
    const response = await agent.receiveMessage(chat);

    expect(response).toBe(toolResult);
    expect(tool.call).toHaveBeenCalledWith({ q: "x" });
  });

  it("callTool throws UndefinedToolException when the tool does not exist", async () => {
    const llm = createMockLLM(new ResponseResult({ intention: "general_chat", args: {} }));
    const agent = new Agent(llm);

    const chat = createMockChat();
    await expect(agent.callTool("nonexistentTool", {}, chat)).rejects.toThrow(
      UndefinedToolException
    );
    await expect(agent.callTool("nonexistentTool", {}, chat)).rejects.toMatchObject({
      toolName: "nonexistentTool",
    });
  });

  it("getToolNames returns the names of the registered tools", () => {
    const tool1 = { name: "search", call: vi.fn() } as unknown as Tool;
    const tool2 = { name: "fetch", call: vi.fn() } as unknown as Tool;
    const agent = new Agent({ generateResponse: vi.fn() } as unknown as ClientLLM, [
      tool1,
      tool2,
    ]);

    expect(agent.getToolNames()).toEqual(["search", "fetch"]);
  });
});
