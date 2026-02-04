import OpenAI from "openai";
import { ClientLLM } from "./ClientLLM";
import { LLMMessage } from "./LLMMessage";
import { Tool } from "openai/resources/responses/responses.js";
import { IntentData, IntentDataSchema } from "./IntentData";

class OpenAILLM extends ClientLLM{
    
    private client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    private availableTools: Tool[]

    constructor(tools: Tool[]){
        super()
        this.availableTools = tools
    }

    async sendRequest(systemPrompt: LLMMessage, chatMessages: LLMMessage[], lastMessage: LLMMessage): Promise<IntentData> {
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
    
      const text = response.output_text?.[0]; 

      let json: unknown;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(`LLM response is not valid JSON: ${text}`);
      }
      
      const result = IntentDataSchema.safeParse(json);
      
      if (!result.success) {
        throw new Error("LLM response does not match IntentData schema");
      }
      
      return result.data;

    } catch (error) {
      throw new Error(`Failed to send request`);
    }
  }
}