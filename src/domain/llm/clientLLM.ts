import { Chat } from "../chat"
import { SystemPrompt } from "./prompts";
import z from "zod";
import { MultiToolResponse, ToolInvoker, ToolResponse } from "../tool/invokers/toolInvoker";
import { CanonicalLLMMessage, Intention, LLMRole } from "./canonicalLlmMessage";
import { PersistChatInvoker } from "../tool/invokers/persistChatInvoker";
import { PersistChat } from "../tool/persistChat";
import { ComplexityAnalyzerInvoker } from "../tool/invokers/complexityAnalyzerInvoker";
import { IssueComplexityAnalyzer } from "../tool/issueComplexityAnalyzer/issueComplexityAnalyzer";
import { IssueComplexityEvaluator } from "../tool/issueComplexityAnalyzer/issueComplexityEvaluator";
import { IssueSignalsExtractor } from "../tool/issueComplexityAnalyzer/issueSignalsExtractor";
import { GitHubClient } from "../tool/gitHostingPlatform/gitHubClient";
export abstract class ClientLLM {

  async generateResponse(chat: Chat): Promise<string> {

    const findIntentionPrompt: CanonicalLLMMessage = this.buildPrompt(SystemPrompt.FIND_USER_INTENTIONS);
    const chatHistory: CanonicalLLMMessage[] = this.buildChatHistory(chat);

    const llmResponse = await this.sendRequest([findIntentionPrompt, ...chatHistory]);
    
    const jsonLlmResponse = this.validateLLMResponse(llmResponse);

    if (jsonLlmResponse.length == 1 && jsonLlmResponse[0].intention === Intention.GENERAL_CHAT) {
      return jsonLlmResponse[0].args.response as string;
    } 

    const toolResults: MultiToolResponse = await this.callTools(jsonLlmResponse, chat);

    const explainResultsPrompt: CanonicalLLMMessage = this.buildPrompt(SystemPrompt.EXPLAIN_TOOL_RESULTS);
    const toolResultsMessages: CanonicalLLMMessage = this.buildToolResultsMessage(toolResults);

    const finalResponse = await this.sendRequest([explainResultsPrompt, toolResultsMessages, ...chatHistory]);

    return this.validateLLMResponse(finalResponse)[0].args.response as string;
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
    
    let invoker: ToolInvoker;
    switch (toolCall.intention) {
      case Intention.ANALYZE_ISSUES_COMPLEXITY:
        invoker = new ComplexityAnalyzerInvoker(chat, toolCall.args, new IssueComplexityAnalyzer(new IssueComplexityEvaluator(), new IssueSignalsExtractor(), new GitHubClient()));
        break
      case Intention.PERSIST_CHAT:
        invoker = new PersistChatInvoker(chat, new PersistChat());
        break
      default: 
        throw new ClientLLMException(`Unsupported intention: ${toolCall.intention}`);
    }
    
    return await invoker.invoke();
  }

  protected abstract sendRequest(
    messages: CanonicalLLMMessage[]
  ): Promise<MultiToolCall>;

  protected buildPrompt(systemPrompt: SystemPrompt): CanonicalLLMMessage {
    return new CanonicalLLMMessage(LLMRole.SYSTEM, systemPrompt);
  }

  protected validateLLMResponse(response: unknown): MultiToolCall {
    
    const zodResponse = multiToolCallSchema.safeParse([response]);
    if (!zodResponse.success) {
      throw new ClientLLMException(`Invalid LLM response: ${zodResponse.error.message}`);
    }

    const jsonResponse = zodResponse.data;
  
    if (jsonResponse.length === 0) {
      throw new ClientLLMException("LLM response is empty");
    }

    return jsonResponse;
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