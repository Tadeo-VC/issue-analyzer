import { Chat } from "../chat"
import { GenerateResult, ToolCallResult, ResponseResult } from "./generateResult";
import { IntentData } from "./intentData";
import { Intention, LLMMessage, LLMRole } from "./llmMessage";
import { SystemPrompt } from "./prompts";
import { UnsupportedIntentionError } from "../errors";

export abstract class ClientLLM {

  async generateResponse(chat: Chat): Promise<GenerateResult> {

    const responseText: IntentData = await this.sendRequest(
      this.buildPrompt(SystemPrompt.FIND_INTENTION),
      this.buildChatHistory(chat),
      this.buildLastMessage(chat)
    );
  
    switch (responseText.intention) {
      case Intention.ANALYZE_ISSUES_COMPLEXITY:
        return new ToolCallResult(
          "analyze-issues-complexity",
          responseText.args,
          chat
        );
  
      case Intention.GENERAL_CHAT: {
        const naturalLanguageResponse = await this.sendRequest(
          this.buildPrompt(SystemPrompt.GENERAL_CHAT),
          this.buildChatHistory(chat),
          this.buildLastMessage(chat)
        );
  
        return new ResponseResult(naturalLanguageResponse);
      }
  
      default:
        throw new UnsupportedIntentionError(responseText.intention);
    }
  }
  
  async generateToolResponse(toolResult: unknown, chat: Chat): Promise<ResponseResult> {
    const naturalLanguageResponse = await this.sendRequest(
      this.buildPrompt(SystemPrompt.EXPLAIN_TOOL_RESULT),
      [
        new LLMMessage(LLMRole.ASSISTANT,JSON.stringify(toolResult))
      ].concat(this.buildChatHistory(chat)),
      this.buildLastMessage(chat)
    );
  
    return new ResponseResult(naturalLanguageResponse);
  }

  protected abstract sendRequest(
    systemPrompt: LLMMessage,
    chatHistory: LLMMessage[],
    latestMessage: LLMMessage
  ): Promise<any>;

  protected buildPrompt(systemPrompt: SystemPrompt): LLMMessage {
    return new LLMMessage(LLMRole.SYSTEM, systemPrompt);
  }

  protected buildChatHistory(chat: Chat): LLMMessage[] {
    return chat.getMessages().map(message => new LLMMessage(LLMRole.USER, message.getRequest()));
  }

  protected buildLastMessage(chat: Chat): LLMMessage {
    const lastMessage = chat.getMessages()[chat.getMessages().length - 1];
    return new LLMMessage(LLMRole.USER, lastMessage.getRequest());
  }
}