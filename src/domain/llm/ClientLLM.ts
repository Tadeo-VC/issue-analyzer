import { Chat } from "../Chat"
import { GenerateResult, ToolCallResult, ResponseResult } from "./GenerateResult";
import { Intention, LLMMessage, LLMRole } from "./LLMMessage";
import { IntentData } from "./IntentData";
import { SystemPrompt } from "./Prompt";

export abstract class ClientLLM {

  async generateResponse(chat: Chat): Promise<GenerateResult> {

    const responseText: IntentData = await this.sendRequest(
      this.buildPrompt(SystemPrompt.FIND_INTENTION),
      this.buildChatHistory(chat),
      this.buildLastMessage(chat)
    );
  
    switch (responseText.intention) {
      case Intention.ANALYZE_ISSUES_PRIORITY:
        return new ToolCallResult(
          "analyzeIssuesPriority",
          responseText.args,
          chat
        );
  
      case Intention.ANALYZE_COMPLEXITY:
        return new ToolCallResult(
          "analyzeComplexity",
          responseText.args,
          chat
        );

      case Intention.FIND_REPO:
        return new ToolCallResult(
          "findRepo",
          responseText.args,
          chat
        );  
  
      case Intention.LOGIN_GITHUB:
        return new ToolCallResult(
          "loginGithub",
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
        throw new Error(`Unsupported intention: ${responseText.intention}`);
    }
  }
  
  async generateToolResponse(toolResult: unknown, chat: Chat): Promise<ResponseResult> {
    const naturalLanguageResponse = await this.sendRequest(
      this.buildPrompt(SystemPrompt.EXPLAIN_RESULTS),
      [
        new LLMMessage(LLMRole.ASSISTANT,JSON.stringify(toolResult))
      ].concat(this.buildChatHistory(chat)),
      this.buildLastMessage(chat)
    );
  
    return new ResponseResult(naturalLanguageResponse);
  }

  abstract sendRequest(
    systemPrompt: LLMMessage,
    messages: LLMMessage[],
    userInput: LLMMessage
  ): Promise<IntentData>

  private buildChatHistory(chat: Chat): LLMMessage[] {
    const history: LLMMessage[] = [];
  
    const userMessages = chat.lastUserMessages();
    const assistantMessages = chat.lastAssistantMessages();
  
    const maxLength = Math.max(userMessages.length, assistantMessages.length);
  
    for (let i = 0; i < maxLength; i++) {
      if (i < userMessages.length) {
        history.push(new LLMMessage(LLMRole.USER, userMessages[i]));
      }
  
      if (i < assistantMessages.length) {
        history.push(new LLMMessage(LLMRole.ASSISTANT, assistantMessages[i]));
      }
    }
  
    return history;
  }

  private buildLastMessage(chat: Chat): LLMMessage {
    return new LLMMessage(LLMRole.USER, chat.userInput())
  }

  private buildPrompt(prompt: SystemPrompt): LLMMessage {
    return new LLMMessage(LLMRole.SYSTEM, prompt)
  }
}