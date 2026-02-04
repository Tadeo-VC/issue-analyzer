import { UndefinedToolException } from "./Errors";
import type { Chat } from "./Chat";
import type { ClientLLM } from "./llm/ClientLLM";
import type { Tool } from "./tool/Tool";

export class Agent {
  private readonly llm: ClientLLM;
  private readonly tools: Map<string, Tool>;

  constructor(llm: ClientLLM, tools: Tool[] = []) {
    this.llm = llm;
    this.tools = new Map(tools.map((t) => [t.name, t]));
  }

  async receiveMessage(chat: Chat): Promise<string> {
    const result = await this.llm.generateResponse(chat);
    return result.getResponse(this);
  }

  async callTool(toolName: string, args: unknown, chat: Chat): Promise<string> {
    const tool = this.tools.get(toolName);
    if (!tool) throw new UndefinedToolException(toolName);
    const result = await tool.call(args);
    this.llm.generateToolResponse?.(result, chat);
    return result;
  }

  getToolNames(): string[] {
    return [...this.tools.keys()];
  }
}
