import { Agent } from "../Agent";

export interface GenerateResult {
  getResponse(runner: Agent): Promise<string>;
}

export class ResponseResult implements GenerateResult {
  constructor(private readonly text: string) {}
  async getResponse(): Promise<string> {
    return this.text;
  }
}

export class ToolCallResult implements GenerateResult {
  constructor(
    private readonly toolName: string,
    private readonly args: unknown
  ) {}
  async getResponse(runner: Agent): Promise<string> {
    return runner.callTool(this.toolName, this.args);
  }
}
