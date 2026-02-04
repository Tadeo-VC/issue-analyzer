import { EasyInputMessage, ResponseInputItem } from "openai/resources/responses/responses.js";

export enum Intention {
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
}

export interface FindIntentionResult {
  intention: Intention;
  args?: Record<string, unknown>;
}

export class LLMMessage {
  private role: LLMRole;
  private content: string;
  private id: string;

  constructor(
    role: LLMRole,  // Public para acceso directo
    content: string,
  ) {
    this.role = role;
    this.content = content;
    this.id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  toOpenAIFormat(): EasyInputMessage {
    return {
      role: this.role as "user" | "system" | "assistant" ,             
      content: [
        {
          type: "input_text",      
          text: this.content,       
        }
      ]
    };
  }

  toString(): string {
    return JSON.stringify({  
      role: this.role,
      content: this.content,
    });
  }
}