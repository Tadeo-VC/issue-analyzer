import z from "zod";
import { GitHostingPlatform } from "../gitHostingPlatform/gitHostingPlatform";
import { IssueComplexityEvaluator } from "./issueComplexityEvaluator";
import { IssueSignalsExtractor } from "./issueSignalsExtractor";
import { DBRepository } from "../../repositories/dbRepository";
import { ChatMemoryRepository } from "../../repositories/chatMemoryRepository";
import { Tool } from "../tool";

export class IssueComplexityAnalyzer implements Tool {

    readonly name = "analyze_issues_complexity";
    private issueComplexityEvaluator: IssueComplexityEvaluator;
    private issueSignalsExtractor: IssueSignalsExtractor;
    private gitHostingPlatform: GitHostingPlatform;

    constructor(gitHostingPlatform: GitHostingPlatform, dbRepository: DBRepository) {
        this.issueComplexityEvaluator = new IssueComplexityEvaluator();
        this.issueSignalsExtractor = new IssueSignalsExtractor();
        this.gitHostingPlatform = gitHostingPlatform;
    }

    async call(args: unknown): Promise<string> {
        const result = analyzeIssuesSchema.safeParse(args);
        if (!result.success) {
            throw new Error("Invalid arguments for analyze_issues_complexity tool");
        }

        const authToken = await ChatMemoryRepository.getInstance()
            .then(repo => repo.getUserAuth(result.data.args.chat_id));

        const analysis = this.gitHostingPlatform.getRepositoryIssues(authToken, result.data.args.user, result.data.args.repo)
            .then(issues => {
                const analyses = issues.map(issue => {
                    const signals = this.issueSignalsExtractor.extract(issue);
                    return this.issueComplexityEvaluator.evaluate(signals);
                });
                return analyses;
            })
            .catch(error => {
                throw new Error(`Failed to analyze issues complexity: ${(error as Error).message}`);
            });
        return JSON.stringify(analysis);
    }
}    

const analyzeIssuesSchema = z.object({
  intention: z.literal("analyze_issues_complexity"), // solo acepta esta intención
  args: z.object({
    chat_id: z.string(),
    repo: z.string(), 
    user: z.string(),
  })
});