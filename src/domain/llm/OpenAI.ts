import OpenAI from "openai";
import { ClientLLM } from "./ClientLLM";
import { LLMMessage, LLMRole } from "./LLMMessage";
import { Tool } from "openai/resources/responses/responses.js";

class OpenAILLM extends ClientLLM{
    
    private client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    private availableTools: Tool[]

    constructor(tools: Tool[]){
        super()
        this.availableTools = tools
    }

    async sendRequest(systemPrompt: LLMMessage, chatMessages: LLMMessage[], lastMessage: LLMMessage): Promise<string> {
    try {

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
   
      const response = await this.client.responses.create(requestBody);
    
      } catch (error) {
        console.error('Error en sendRequest:', error);
        throw new Error(`Failed to send request`);
      }
    }
}