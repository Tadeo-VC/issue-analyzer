import { SupabaseClient } from "@supabase/supabase-js";
import { Agent } from "../agent";
import { ClientLLM } from "../llm/clientLLM";
import { GitHubClient } from "../tool/gitHostingPlatform/gitHubClient";
import { IssueComplexityAnalyzer } from "../tool/issueComplexityAnalyzer/issueComplexityAnalyzer";
import { PersistChat } from "../tool/persistChat";
import { ToolInterface } from "../tool/tool";
import { createSupabaseServerClient } from "@/src/utils/supabase/serverClient";
import { SupabaseRepository } from "../repositories/supabaseRepository";
import { Tool } from "openai/resources/responses/responses.js";
import { analyzeIssuesComplexityTool, OpenAILLM, persistChatTool } from "../llm/openAI";

export class AgentFactory {

  static async createAgent(): Promise<Agent> {
    const llm = new OpenAILLM(this.createOpenAITools());
    const tools = await this.createAgentTools();
    return new Agent(llm, tools);
  }

  static async createAgentTools(): Promise<ToolInterface[]> {
    const persistChat: ToolInterface = new PersistChat();

    const supabaseClient: SupabaseClient = await createSupabaseServerClient();
    const analizeIssuesComplexity: ToolInterface = new IssueComplexityAnalyzer(new GitHubClient(), new SupabaseRepository(supabaseClient));
    return [persistChat, analizeIssuesComplexity]; 
  }

  static createOpenAITools(): Tool[] {

    return [analyzeIssuesComplexityTool, persistChatTool];
  }
}