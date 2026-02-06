import z from "zod";
import { GitHostingPlatform } from "../gitHostingPlatform/gitHostingPlatform";
import { IssueComplexityEvaluator } from "./issueComplexityEvaluator";
import { IssueSignalsExtractor } from "./issueSignalsExtractor";
import { DBRepository } from "../../repositories/dbRepository";

export class IssueComplexityAnalyzer {

    private toolName = "analyze_issues_complexity";
    private issueComplexityEvaluator: IssueComplexityEvaluator;
    private issueSignalsExtractor: IssueSignalsExtractor;
    private gitHostingPlatform: GitHostingPlatform;
    private dbRepository: DBRepository;

    constructor(gitHostingPlatform: GitHostingPlatform, dbRepository: DBRepository) {
        this.issueComplexityEvaluator = new IssueComplexityEvaluator();
        this.issueSignalsExtractor = new IssueSignalsExtractor();
        this.gitHostingPlatform = gitHostingPlatform;
        this.dbRepository = dbRepository;
    }

    name(): string {
        return this.toolName;
    }

    call(args: unknown): Promise<string> {
        const result = analyzeIssuesSchema.safeParse(args);
        if (!result.success) {
            throw new Error("Invalid arguments for analyze_issues_complexity tool");
        }

        this.gitHostingPlatform.getRepositoryIssues(, result.data.args.user, result.data.args.repo)
            .then(issues => {
                const analyses = issues.map(issue => {
                    const signals = this.issueSignalsExtractor.extract(issue);
                    return this.issueComplexityEvaluator.evaluate(signals);
                });
                return analyses;
            })
            .catch(error => {
                console.error("Error fetching issues:", error);
            });
    }
}    

const analyzeIssuesSchema = z.object({
  intention: z.literal("analyze_issues_complexity"), // solo acepta esta intención
  args: z.object({
    repo: z.string(), 
    user: z.string(),
  })
});