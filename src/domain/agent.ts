import type { ClientLLM } from "./llm";
import type { Message } from "./message";
import type { Tool } from "./tool";

export class Agent {
  private readonly llm: ClientLLM;
  private readonly tools: Map<string, Tool>;

  constructor(llm: ClientLLM, tools: Tool[] = []) {
    this.llm = llm;
    this.tools = new Map(tools.map((t) => [t.name, t]));
  }

  async receiveMessage(message: Message): Promise<string> {
    return this.llm.generateResponse(message);
  }

  async callTool(toolName: string, args: unknown): Promise<string> {
    const tool = this.tools.get(toolName);
    if (!tool) throw new Error(`Unknown tool: ${toolName}`);
    const result = await tool.call(args);
    this.llm.receiveToolResponse?.(result);
    return result;
  }

  getToolNames(): string[] {
    return [...this.tools.keys()];
  }
}
