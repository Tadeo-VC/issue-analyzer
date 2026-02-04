import { Agent } from "../agent";
import { Chat } from "../chat";
import { IntentData } from "./intentData";

export interface GenerateResult {
  getResponse(runner: Agent): Promise<string>;
}

export class ResponseResult implements GenerateResult {

  private readonly text: string

  constructor(json: IntentData) {
    this.text = json.args.message as string
  }
  async getResponse(): Promise<string> {
    return this.text;
  }
}

export class ToolCallResult implements GenerateResult {
  constructor(
    private readonly toolName: string,
    private readonly args: unknown,
    private readonly chat: Chat
  ) {}
  async getResponse(runner: Agent): Promise<string> {
    return runner.callTool(this.toolName, this.args, this.chat);
  }
}
