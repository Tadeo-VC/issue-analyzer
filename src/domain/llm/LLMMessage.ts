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
  TOOL = "tool"
}

export interface FindIntentionResult {
  intention: Intention;
  args?: Record<string, unknown>;
}

export class LLMMessage {
  private role: LLMRole;
  private content: string;

  constructor(role: LLMRole, content: string){
    this.role = role
    this.content = content
  }

  toString(): string {
    return JSON.stringify({  
      role: this.role,
      content: this.content
    });
  }
}