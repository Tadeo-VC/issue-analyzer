import { Chat } from "../chat"
import { GenerateResult, ToolCallResult, ResponseResult } from "./generateResult";
import { IntentData } from "./intentData";
import { Intention, LLMMessage, LLMRole } from "./llmMessage";
import { SystemPrompt } from "./prompts";
import z from "zod";
import { MultiToolResponse, ToolInvoker, ToolResponse } from "../tool/toolInvoker";
export abstract class ClientLLM {

  async generateResponse(chat: Chat) {

    const llmResponse: IntentData = await this.sendRequest(
      this.buildPrompt(SystemPrompt.FIND_USER_INTENTIONS),
      this.buildChatHistory(chat),
      this.buildLastMessage(chat)
    );
    
    const zodLlmResponse = multiToolCallSchema.safeParse([llmResponse]);
    if (!zodLlmResponse.success) {
      throw new ClientLLMException(`Invalid LLM response: ${zodLlmResponse.error.message}`);
    }

    const jsonLlmResponse = zodLlmResponse.data;
  
    if (jsonLlmResponse.length === 0) {
      throw new ClientLLMException("LLM response is empty");
    }

    if (jsonLlmResponse.length == 1 && jsonLlmResponse[0].intention === Intention.GENERAL_CHAT) {
      // pasamos directamente la respuesta del llm al usuario, sin pasar por el sistema de herramientas
    } 

    return this.callTools(jsonLlmResponse, chat);
  }

  protected async callTools(tools: MultiToolCall, chat: Chat): Promise<MultiToolResponse> {
    const toolResults: MultiToolResponse = [];
    for (const tool of tools) {
      try {
      toolResults.push(await this.generateToolResponse(tool, chat));
      } catch (error) {

        const errorResponse: ToolResponse = {
            status: "error",
            message: "The requested operation could not be completed",
            error: {
              code: "TOOL_EXECUTION_FAILED",
            }
        }

        toolResults.push(errorResponse);
        return toolResults
      }
    }

    return toolResults;
  }
  protected async generateToolResponse(toolCall: ToolCall, chat: Chat): Promise<ToolResponse> {
    
    let handler: ToolInvoker;
    switch (toolCall.intention) {
      case Intention.ANALYZE_ISSUES_COMPLEXITY:
        handler = new IssueComplexityAnalyzerHandler(toolCall.args, chat);
        break
      case Intention.PERSIST_CHAT:
        handler = new PersistChatHandler(chat);
        break
      default: 
        throw new ClientLLMException(`Unsupported intention: ${toolCall.intention}`);
    }
    
    return await handler.handle();
  }
}


const toolCallSchema = z.object({
  intention: z.enum([Intention.ANALYZE_ISSUES_COMPLEXITY, Intention.PERSIST_CHAT, Intention.GENERAL_CHAT]),
  args: z.record(z.string(), z.unknown())
});

type ToolCall = z.infer<typeof toolCallSchema>;

const multiToolCallSchema = z.array(toolCallSchema);

type MultiToolCall = z.infer<typeof multiToolCallSchema>;

export class ClientLLMException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClientLLMException";
  }
}

/*
    let payload = {}

    switch (responseText.intention) {
      case Intention.ANALYZE_ISSUES_COMPLEXITY:

          payload = {
            chatId: chat.getId(),
            result: responseText,
          };

        return new ToolCallResult(
          "analyze-issues-complexity",
          payload,
          chat
        );

      case Intention.PERSIST_CHAT:

          payload = {
            chatId: chat.getId(),
            result: responseText,
          };

        return new ToolCallResult(
          "analyze-issues-complexity",
          payload,
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
        throw new UnsupportedIntentionError(responseText.intention);
    }
  }
  
  async generateToolResponse(toolResult: unknown, chat: Chat): Promise<ResponseResult> {
    const naturalLanguageResponse = await this.sendRequest(
      this.buildPrompt(SystemPrompt.EXPLAIN_TOOL_RESULT),
      [
        new LLMMessage(LLMRole.ASSISTANT,JSON.stringify(toolResult))
      ].concat(this.buildChatHistory(chat)),
      this.buildLastMessage(chat)
    );
  
    return new ResponseResult(naturalLanguageResponse);
  }

  protected abstract sendRequest(
    systemPrompt: LLMMessage,
    chatHistory: LLMMessage[],
    latestMessage: LLMMessage
  ): Promise<any>;

  protected buildPrompt(systemPrompt: SystemPrompt): LLMMessage {
    return new LLMMessage(LLMRole.SYSTEM, systemPrompt);
  }

  protected buildChatHistory(chat: Chat): LLMMessage[] {
    return chat.getMessages().map(message => new LLMMessage(LLMRole.USER, message.getRequest()));
  }

  protected buildLastMessage(chat: Chat): LLMMessage {
    const lastMessage = chat.getMessages()[chat.getMessages().length - 1];
    return new LLMMessage(LLMRole.USER, lastMessage.getRequest());
  }
}
*/