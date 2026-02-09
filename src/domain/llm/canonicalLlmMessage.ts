import { EasyInputMessage } from "openai/resources/responses/responses.js";

export enum Intention {
    ANALYZE_ISSUES_COMPLEXITY = "analyze_issues_complexity",
    GENERAL_CHAT = "general_chat",
    PERSIST_CHAT = "persist_chat"
}

export enum LLMRole {
  SYSTEM = "system",
  USER = "user",
  ASSISTANT = "assistant",
}

export class CanonicalLLMMessage {
  private role: LLMRole;
  private content: string;

  constructor(
    role: LLMRole, 
    content: string,
  ) {
    this.role = role;
    this.content = content;
  }
  
  toOpenAIFormat(): EasyInputMessage {
    return {
      role: this.role as LLMRole.ASSISTANT | LLMRole.USER | LLMRole.SYSTEM ,             
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