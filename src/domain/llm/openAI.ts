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