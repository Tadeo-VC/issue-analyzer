import OpenAI from "openai";
import { ClientLLM, MultiToolCall, multiToolCallSchema } from "./clientLLM";
import { Tool } from "openai/resources/responses/responses.js";
import { CanonicalLLMMessage } from "./canonicalLlmMessage";

export class OpenAILLM extends ClientLLM{
    
    private client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    private availableTools: Tool[]

    constructor(tools: Tool[]){
        super()
        this.availableTools = tools
    }

    async sendRequest(messages: CanonicalLLMMessage[]): Promise<MultiToolCall> {
    
    const requestBody = {
      input: messages.map(m => m.toOpenAIFormat()),
      tools: this.availableTools,
      model: "gpt-5-mini",
      max_tokens: 1000,
      temperature: 0.2,
      stream: false as const,
      };
   
    let response;

    try {
      response = await this.client.responses.create(requestBody);
    } catch (error) {
      throw new OpenAIException(`Failed to send request: ${error}`);
    }
    
    const text = response.output_text?.[0]; 

    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch (error) {
      throw new OpenAIException(`LLM response is not valid JSON: ${text}`);
    }
    
    const result = multiToolCallSchema.safeParse(json);
    
    if (!result.success) {
      throw new OpenAIException(`LLM response does not match MultiToolCall schema: ${result.error.message}`);
    }
    
    return result.data;
  }
}

// tools 
export const analyzeIssuesComplexityTool = {
    type: "function" as const,
    function: {
        name: "analyze_issues_complexity" as const,
        description:
        "Analyze the complexity of GitHub issues for a repository using predefined heuristics and classify overall complexity.",
        parameters: {
        type: "object",
        properties: {
            chat_id: {
            type: "string",
            description: "Identifier of the existing chat context",
            },
            user: {
            type: "string",
            description: "GitHub username or organization",
            },
            repo: {
            type: "string",
            description: "GitHub repository name",
            },
        },
        required: ["chat_id", "user", "repo"],
        additionalProperties: false,
        },
    },
};

export const persistChatTool = {
    type: "function" as const,
    function: {
        name: "persist_chat" as const,
        description:
        "Persist the current state of an existing chat into permanent storage.",
        parameters: {
        type: "object",
        properties: {
            chat_id: {
            type: "string",
            description: "Identifier of the chat to persist",
            },
        },
        required: ["chat_id"],
        additionalProperties: false,
        },
    },
};

class OpenAIException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenAIException";
    Object.setPrototypeOf(this, OpenAIException.prototype);
  }
}