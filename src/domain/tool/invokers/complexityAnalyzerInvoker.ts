import z from "zod";
import { Chat } from "../../chat";
import { ToolInvoker, ToolResponse } from "./toolInvoker";
import { IssueComplexityAnalyzer } from "../issueComplexityAnalyzer/issueComplexityAnalyzer";

export class ComplexityAnalyzerInvoker implements ToolInvoker {

    private chat: Chat
    private params: unknown
    private issueComplexityAnalyzer: IssueComplexityAnalyzer

    constructor(chat: Chat, params: unknown, issueComplexityAnalyzer: IssueComplexityAnalyzer) {
        this.chat = chat;    
        this.params = params;
        this.issueComplexityAnalyzer = issueComplexityAnalyzer;
    }

    async invoke(): Promise<ToolResponse> {
        
        const parseResult = complexityAnalyzerParamsSchema.safeParse(this.params);
        if (!parseResult.success) {
            return Promise.resolve({
                status: "error",
                message: "Invalid parameters for complexity analysis",
                error: {
                    details: parseResult.error.issues
                }
             });
        }

        try {
            const complexityResult = await this.issueComplexityAnalyzer.call(this.chat.getId(), parseResult.data.repo, parseResult.data.user || this.chat.getUserName());
            return {
                status: "success",
                message: "Complexity analysis completed successfully",
                data: complexityResult
            };
        } catch (error) {
            return {
                status: "error",
                message: "An error occurred during complexity analysis",
                error: {
                    details: (error as Error).message
                }
            };
        }
        
    }
}

const complexityAnalyzerParamsSchema = z.object({
    repo: z.string(),
    user: z.string().optional()
});