import { UndefinedToolException } from "./Errors";
import type { ClientLLM } from "./llm/ClientLLM";
import type { Message } from "./Message";
import type { Tool } from "./Tool";

export class Agent {
  private readonly llm: ClientLLM;
  private readonly tools: Map<string, Tool>;

  constructor(llm: ClientLLM, tools: Tool[] = []) {
    this.llm = llm;
    this.tools = new Map(tools.map((t) => [t.name, t]));
  }

  async receiveMessage(message: Message): Promise<string> {
    const result = await this.llm.generateResponse(message);
    return result.getResponse(this);
  }

  async callTool(toolName: string, args: unknown): Promise<string> {
    const tool = this.tools.get(toolName);
    if (!tool) throw new UndefinedToolException(toolName);
    const result = await tool.call(args);
    this.llm.receiveToolResponse?.(result);
    return result;
  }

  getToolNames(): string[] {
    return [...this.tools.keys()];
  }
}
