import { GitHostingPlatform } from "../gitHostingPlatform/gitHostingPlatform";
import { Issue } from "../gitHostingPlatform/issue";
import { IssueSignals } from "./complexity";

export class IssueSignalsExtractor {

  constructor() {}

  extract(issue: Issue): IssueSignals {
    const text = this.normalizeText(issue);

    return {
      hasAmbiguousDescription: this.detectAmbiguity(text),
      requiresResearch: this.detectResearchNeed(text),
      affectsMultipleComponents: this.detectScope(text),
      requiresDesignDecisions: this.detectDesignDecisions(text),
      hasExternalDependencies: this.detectDependencies(text),
      unclearCompletionCriteria: this.detectTestability(text),
    };
  }

  private normalizeText(issue: Issue): string {
    return `${issue.getTitle()} ${issue.getBody() ?? ""}`
    .toLowerCase()    
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  }

  private containsAny(text: string, patterns: RegExp[]): boolean {
    return patterns.some(pattern => pattern.test(text));
  }

  private detectAmbiguity(text: string): boolean {
    return this.containsAny(text, AMBIGUITY_PATTERNS);
  }

  private detectResearchNeed(text: string): boolean {
    return this.containsAny(text, RESEARCH_PATTERNS);
  }

  private detectScope(text: string): boolean {
    return this.containsAny(text, SCOPE_PATTERNS);
  }

  private detectDesignDecisions(text: string): boolean {
    return this.containsAny(text, DESIGN_PATTERNS);
  }

  private detectDependencies(text: string): boolean {
    return this.containsAny(text, DEPENDENCY_PATTERNS);
  }

  private detectTestability(text: string): boolean {
    return this.containsAny(text, TESTABILITY_PATTERNS);
  }
}
