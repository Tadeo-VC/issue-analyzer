
export class UndefinedToolException extends Error {
  constructor(public readonly toolName: string) {
    super(`Unknown tool: ${toolName}`);
    this.name = "UndefinedToolException";
    Object.setPrototypeOf(this, UndefinedToolException.prototype);
  }
}

export class ToolArgumentsError extends Error {
  constructor(toolName: string = "tool") {
    super(`Invalid arguments for ${toolName} tool`);
    this.name = "ToolArgumentsError";
    Object.setPrototypeOf(this, ToolArgumentsError.prototype);
  }
}

export class ChatNotFoundError extends Error {
  constructor(public readonly chatId: string) {
    super(`Chat with id ${chatId} not found in memory`);
    this.name = "ChatNotFoundError";
    Object.setPrototypeOf(this, ChatNotFoundError.prototype);
  }
}

export class InvalidChatError extends Error {
  constructor(missingField: string) {
    super(`${missingField} is required to save chat in memory`);
    this.name = "InvalidChatError";
    Object.setPrototypeOf(this, InvalidChatError.prototype);
  }
}

export class OpenAIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenAIError";
    Object.setPrototypeOf(this, OpenAIError.prototype);
  }
}

export class MissingAuthTokenError extends Error {
  constructor() {
    super("Auth token is required to save chat in memory");
    this.name = "MissingAuthTokenError";
    Object.setPrototypeOf(this, MissingAuthTokenError.prototype);
  }
}

export class DatabaseOperationError extends Error {
  constructor(
    operation: string,
    public readonly originalError: string
  ) {
    super(`Failed to ${operation}: ${originalError}`);
    this.name = "DatabaseOperationError";
    Object.setPrototypeOf(this, DatabaseOperationError.prototype);
  }
}

export class UserNotFoundError extends Error {
  constructor(public readonly userId: string) {
    super(`User with id ${userId} not found`);
    this.name = "UserNotFoundError";
    Object.setPrototypeOf(this, UserNotFoundError.prototype);
  }
}

export class MessageResponseNotFoundError extends Error {
  constructor() {
    super("The message has no response");
    this.name = "MessageResponseNotFoundError";
    Object.setPrototypeOf(this, MessageResponseNotFoundError.prototype);
  }
}

export class GitHubRateLimitError extends Error {
  constructor() {
    super("GitHub rate limit exceeded");
    this.name = "GitHubRateLimitError";
    Object.setPrototypeOf(this, GitHubRateLimitError.prototype);
  }
}

export class GitHubAPIError extends Error {
  constructor(
    statusCode: number,
    statusText: string
  ) {
    super(`GitHub API error: ${statusCode} ${statusText}`);
    this.name = "GitHubAPIError";
    Object.setPrototypeOf(this, GitHubAPIError.prototype);
  }
}

export class GitHubRequestTimeoutError extends Error {
  constructor() {
    super("Request timed out");
    this.name = "GitHubRequestTimeoutError";
    Object.setPrototypeOf(this, GitHubRequestTimeoutError.prototype);
  }
}

export class GitHubInvalidResponseError extends Error {
  constructor(public readonly details: string) {
    super(`GitHub API response structure is invalid: ${details}`);
    this.name = "GitHubInvalidResponseError";
    Object.setPrototypeOf(this, GitHubInvalidResponseError.prototype);
  }
}

export class UnsupportedIntentionError extends Error {
  constructor(intention: string) {
    super(`Unsupported intention: ${intention}`);
    this.name = "UnsupportedIntentionError";
    Object.setPrototypeOf(this, UnsupportedIntentionError.prototype);
  }
}

export class MissingEnvironmentVariableError extends Error {
  constructor(variables: string[]) {
    super(`Missing ${variables.join(" or ")}`);
    this.name = "MissingEnvironmentVariableError";
    Object.setPrototypeOf(this, MissingEnvironmentVariableError.prototype);
  }
}

export class IssueComplexityAnalysisError extends Error {
  constructor(public readonly originalError: string) {
    super(`Failed to analyze issues complexity: ${originalError}`);
    this.name = "IssueComplexityAnalysisError";
    Object.setPrototypeOf(this, IssueComplexityAnalysisError.prototype);
  }
}