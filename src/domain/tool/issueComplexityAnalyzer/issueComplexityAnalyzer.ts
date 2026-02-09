import { GitHostingPlatform } from "../gitHostingPlatform/gitHostingPlatform";
import { IssueComplexityEvaluator } from "./issueComplexityEvaluator";
import { IssueSignalsExtractor } from "./issueSignalsExtractor";
import { ChatContextRepository } from "../../repositories/chatContextRepository";
import { ComplexityAnalysis } from "./complexity";

export class IssueComplexityAnalyzer {

    private issueComplexityEvaluator: IssueComplexityEvaluator;
    private issueSignalsExtractor: IssueSignalsExtractor;
    private gitHostingPlatform: GitHostingPlatform;

    constructor(issueComplexityEvaluator: IssueComplexityEvaluator, issueSignalsExtractor: IssueSignalsExtractor, gitHostingPlatform: GitHostingPlatform) {
        this.issueComplexityEvaluator = issueComplexityEvaluator;
        this.issueSignalsExtractor = issueSignalsExtractor;
        this.gitHostingPlatform = gitHostingPlatform;
    }

    async call(chatId: string, repo: string, user: string): Promise<ComplexityAnalysis[]> {

        const authToken = await ChatContextRepository.getInstance().then(repo => repo.getUserAuth(chatId));

        const analysis = this.gitHostingPlatform.getRepositoryIssues(authToken, user, repo)
            .then(issues => {
                const analyses = issues.map(issue => {
                    const signals = this.issueSignalsExtractor.extract(issue);
                    return this.issueComplexityEvaluator.evaluate(signals);
                });
                return analyses;
            })
            .catch(error => {
                throw new IssueComplexityAnalyzerException((error as Error).message);
            });
        return analysis;
    }
}    

class IssueComplexityAnalyzerException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "IssueComplexityAnalyzerException";
    }
}