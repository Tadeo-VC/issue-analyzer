import { Chat } from "../Chat"
import { GenerateResult, ToolCallResult, ResponseResult } from "./GenerateResult";
import { SystemPrompt } from "./Prompt";

export abstract class ClientLLM {

  async generateResponse(chat: Chat): Promise<GenerateResult> {

    const responseText: string = await this.sendRequest(
      this.buildPrompt(SystemPrompt.FIND_INTENTION),
      this.buildChatHistory(chat),
      this.buildLastMessage(chat)
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
          intentionResult.args,
          chat
        );
  
      case Intention.ANALYZE_COMPLEXITY:
        return new ToolCallResult(
          "analyzeComplexity",
          intentionResult.args,
          chat
        );

      case Intention.FIND_REPO:
        return new ToolCallResult(
          "findRepo",
          intentionResult.args,
          chat
        );  
  
      case Intention.LOGIN_GITHUB:
        return new ToolCallResult(
          "loginGithub",
          intentionResult.args,
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
        throw new Error(`Unsupported intention: ${intentionResult.intention}`);
    }
  }
  
  async generateToolResponse(toolResult: unknown, chat: Chat): Promise<ResponseResult> {
    const naturalLanguageResponse = await this.sendRequest(
      this.buildPrompt(SystemPrompt.EXPLAIN_RESULTS),
      [
        {
          role: LLMRole.TOOL,
          content: JSON.stringify(toolResult)
        }
      ].concat(this.buildChatHistory(chat)),
      this.buildLastMessage(chat)
    );
  
    return new ResponseResult(naturalLanguageResponse);
  }

  abstract sendRequest(
    systemPrompt: LLMMessage,
    messages: LLMMessage[],
    userInput: LLMMessage
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

  private buildLastMessage(chat: Chat): LLMMessage {
    return {
      role: LLMRole.USER,
      content: chat.userInput()
    }
  }

  private buildPrompt(prompt: SystemPrompt): LLMMessage {
    return {
      role: LLMRole.SYSTEM,
      content: prompt
    }
  }
}

enum Intention {
  ANALYZE_ISSUES_PRIORITY = "analyze_issues_priority",
  ANALYZE_COMPLEXITY = "analyze_complexity",
  FIND_REPO = "find_repo",
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