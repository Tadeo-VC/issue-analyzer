import { Chat } from "../Chat"
import { GenerateResult, ToolCallResult, ResponseResult } from "./GenerateResult";
import { SystemPrompt } from "./Prompt";

export abstract class ClientLLM {
  async generateResponse(chat: Chat): Promise<GenerateResult> {

    const responseText: string = await this.sendRequest(
      SystemPrompt.FIND_INTENTION,
      this.buildChatHistory(chat)
    );

    // catching typing and parsing errors
    let intentionResult: FindIntentionResult;

    try {
      intentionResult = JSON.parse(responseText) as FindIntentionResult;
    } catch (e) {
      throw new SyntaxError(`Failed to parse LLM response as JSON: ${e}`);
    }
    
    if (!intentionResult.intention) {
      throw new Error(
        `Parsed JSON is missing required field 'intention': ${JSON.stringify(intentionResult)}`
      );
    }
    //
  
    switch (intentionResult.intention) {
      case Intention.ANALYZE_ISSUES_PRIORITY:
        return new ToolCallResult(
          "analyzeIssuesPriority",
          intentionResult.args
        );
  
      case Intention.ANALYZE_COMPLEXITY:
        return new ToolCallResult(
          "analyzeComplexity",
          intentionResult.args
        );
  
      case Intention.LOGIN_GITHUB:
        return new ToolCallResult(
          "loginGithub",
          intentionResult.args
        );
  
      case Intention.GENERAL_CHAT: {
        const naturalLanguageResponse = await this.sendRequest(
          SystemPrompt.GENERAL_CHAT,
          this.buildChatHistory(chat)
        );
  
        return new ResponseResult(naturalLanguageResponse);
      }
  
      default:
        throw new Error(`Unsupported intention: ${intentionResult.intention}`);
    }
  }
  
  async generateToolResponse(chat: Chat,toolResult: unknown): Promise<ResponseResult> {
    const naturalLanguageResponse = await this.sendRequest(
      SystemPrompt.EXPLAIN_RESULTS,
      [
        {
          role: LLMRole.TOOL,
          content: JSON.stringify(toolResult)
        }
      ].concat(this.buildChatHistory(chat))
    );
  
    return new ResponseResult(naturalLanguageResponse);
  }

  abstract sendRequest(
    systemPrompt: string,
    messages: LLMMessage[]
  ): Promise<string>

  private buildChatHistory(chat: Chat): LLMMessage[] {
    const history: LLMMessage[] = [];
  
    const userMessages = chat.lastUserMessages();
    const assistantMessages = chat.lastAssistantMessages();
  
    const maxLength = Math.max(userMessages.length, assistantMessages.length);
  
    for (let i = 0; i < maxLength; i++) {
      if (i < userMessages.length) {
        history.push({
          role: LLMRole.USER,
          content: userMessages[i]
        });
      }
  
      if (i < assistantMessages.length) {
        history.push({
          role: LLMRole.ASSISTANT,
          content: assistantMessages[i]
        });
      }
    }
  
    return history;
  }
}

enum Intention {
  ANALYZE_ISSUES_PRIORITY = "analyze_issues_priority",
  ANALYZE_COMPLEXITY = "analyze_complexity",
  LOGIN_GITHUB = "login_github",
  GENERAL_CHAT = "general_chat"
}

export enum LLMRole {
  SYSTEM = "system",
  USER = "user",
  ASSISTANT = "assistant",
  TOOL = "tool"
}

interface FindIntentionResult {
  intention: Intention;
  args?: Record<string, unknown>;
}

export interface LLMMessage {
  role: LLMRole;
  content: string;
}