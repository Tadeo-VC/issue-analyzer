import OpenAI from "openai";
import { ClientLLM } from "./clientLLM";
import { LLMMessage } from "./llmMessage";
import { Tool } from "openai/resources/responses/responses.js";
import { IntentData, IntentDataSchema } from "./intentData";
import { OpenAIError } from "../errors";

export class OpenAILLM extends ClientLLM{
    
    private client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    private availableTools: Tool[]

    constructor(tools: Tool[]){
        super()
        this.availableTools = tools
    }

    async sendRequest(systemPrompt: LLMMessage, chatMessages: LLMMessage[], lastMessage: LLMMessage): Promise<IntentData> {
    const apiMessages = [
      systemPrompt.toOpenAIFormat(),
      ...chatMessages.flatMap(msg => msg.toOpenAIFormat()),
      lastMessage.toOpenAIFormat()
    ];
    
    const requestBody = {
      input: apiMessages,
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
      throw new OpenAIError(`Failed to send request`);
    }
    
    const text = response.output_text?.[0]; 

    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      throw new OpenAIError(`LLM response is not valid JSON: ${text}`);
    }
    
    const result = IntentDataSchema.safeParse(json);
    
    if (!result.success) {
      throw new OpenAIError("LLM response does not match IntentData schema");
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