import { Chat } from "../chat"
import { SystemPrompt } from "./prompts";
import z from "zod";
import { MultiToolResponse, ToolInvoker, ToolResponse } from "../tool/toolInvoker";
import { CanonicalLLMMessage, Intention, LLMRole } from "./canonicalLlmMessage";
export abstract class ClientLLM {

  async generateResponse(chat: Chat) {

    const findIntentionPrompt: CanonicalLLMMessage = this.buildPrompt(SystemPrompt.FIND_USER_INTENTIONS);
    const chatHistory: CanonicalLLMMessage[] = this.buildChatHistory(chat);

    const llmResponse= await this.sendRequest([findIntentionPrompt, ...chatHistory]);
    
    const zodLlmResponse = multiToolCallSchema.safeParse([llmResponse]);
    if (!zodLlmResponse.success) {
      throw new ClientLLMException(`Invalid LLM response: ${zodLlmResponse.error.message}`);
    }

    const jsonLlmResponse = zodLlmResponse.data;
  
    if (jsonLlmResponse.length === 0) {
      throw new ClientLLMException("LLM response is empty");
    }

    if (jsonLlmResponse.length == 1 && jsonLlmResponse[0].intention === Intention.GENERAL_CHAT) {
      return jsonLlmResponse[0].args.response as string;
    } 

    const toolResults: MultiToolResponse = await this.callTools(jsonLlmResponse, chat);

    const explainResultsPrompt: CanonicalLLMMessage = this.buildPrompt(SystemPrompt.EXPLAIN_TOOL_RESULTS);
    const toolResultsMessages: CanonicalLLMMessage = this.buildToolResultsMessage(toolResults);

    const finalResponse = await this.sendRequest([explainResultsPrompt, toolResultsMessages, ...chatHistory]);

    return finalResponse;
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

  protected abstract sendRequest(
    messages: CanonicalLLMMessage[]
  ): Promise<MultiToolCall>;

  protected buildPrompt(systemPrompt: SystemPrompt): CanonicalLLMMessage {
    return new CanonicalLLMMessage(LLMRole.SYSTEM, systemPrompt);
  }

  protected buildChatHistory(chat: Chat): CanonicalLLMMessage[] {
    
    const history: CanonicalLLMMessage[] = [];
    
    chat.getMessages().forEach(m => {
      
      history.push(new CanonicalLLMMessage(LLMRole.USER, m.getRequest()));
      
      const response = m.getResponse();
      if(response !== undefined){
        history.push(new CanonicalLLMMessage(LLMRole.ASSISTANT, response));
      }

    });

    return history;
  }

  protected buildToolResultsMessage(toolResults: MultiToolResponse): CanonicalLLMMessage {
    return new CanonicalLLMMessage(
      LLMRole.ASSISTANT,
      JSON.stringify(toolResults)
    );
  }
}


const toolCallSchema = z.object({
  intention: z.enum([Intention.ANALYZE_ISSUES_COMPLEXITY, Intention.PERSIST_CHAT, Intention.GENERAL_CHAT]),
  args: z.record(z.string(), z.unknown())
});

type ToolCall = z.infer<typeof toolCallSchema>;

export const multiToolCallSchema = z.array(toolCallSchema);

export type MultiToolCall = z.infer<typeof multiToolCallSchema>;

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


}
*/