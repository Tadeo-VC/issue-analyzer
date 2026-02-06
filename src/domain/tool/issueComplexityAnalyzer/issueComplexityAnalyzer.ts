import z from "zod";
import { GitHostingPlatform } from "../gitHostingPlatform/gitHostingPlatform";
import { IssueComplexityEvaluator } from "./issueComplexityEvaluator";
import { IssueSignalsExtractor } from "./issueSignalsExtractor";
import { DBRepository } from "../../repositories/dbRepository";
import { ChatContextRepository } from "../../repositories/chatMemoryRepository";
import { Tool } from "../tool";
import {
  ToolArgumentsError,
  IssueComplexityAnalysisError,
} from "../../errors";

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
        const result = AnalyzeIssuesComplexityResultSchema.safeParse(args);
        if (!result.success) {
            throw new ToolArgumentsError("analyze_issues_complexity");
        }

        const authToken = await ChatContextRepository.getInstance()
            .then(repo => repo.getUserAuth(result.data.chatId));

        const analysis = this.gitHostingPlatform.getRepositoryIssues(authToken, result.data.result.args.user, result.data.result.args.repo)
            .then(issues => {
                const analyses = issues.map(issue => {
                    const signals = this.issueSignalsExtractor.extract(issue);
                    return this.issueComplexityEvaluator.evaluate(signals);
                });
                return analyses;
            })
            .catch(error => {
                throw new IssueComplexityAnalysisError((error as Error).message);
            });
        return JSON.stringify(analysis);
    }
}    

export const AnalyzeIssuesComplexityResultSchema = z.object({
  chatId: z.string(),
  result: z.object({
    intention: z.literal("analyze_issues_complexity"),
    args: z.object({
      repo: z.string(),
      user: z.string(),
    }),
  }),
});