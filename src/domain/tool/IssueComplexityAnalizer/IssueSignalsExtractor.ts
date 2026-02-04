import { GitHostingPlatform } from "../GitHostingPlatform/GitHostingPlatform";
import { Issue } from "../GitHostingPlatform/Issue";
import { IssueSignals } from "./Complexity";

export class IssueSignalsExtractor {

  private gitHostingPlatform: GitHostingPlatform;

  constructor(gitHostingPlatform: GitHostingPlatform) {
    this.gitHostingPlatform = gitHostingPlatform;
  }

  extract(issue: Issue): IssueSignals {
    return {
      hasAmbiguousDescription: this.detectAmbiguity(issue),
      requiresResearch: this.detectResearchNeed(issue),
      affectsMultipleComponents: this.detectScope(issue),
      requiresDesignDecisions: this.detectDesignDecisions(issue),
      hasExternalDependencies: this.detectDependencies(issue),
      unclearCompletionCriteria: this.detectTestability(issue),
    };
  }

  private detectAmbiguity(issue: Issue): boolean {
    // keywords tipo: "investigar", "parece", "no está claro"
  }

  private detectResearchNeed(issue: Issue): boolean {
    // menciones a spike, research, refactor grande, migración
  }

  private detectScope(issue: Issue): boolean {
    // frontend + backend, múltiples servicios, capas, etc
  }

  private detectDesignDecisions(issue: Issue): boolean {
    // "definir", "evaluar alternativas", "diseñar"
  }

  private detectDependencies(issue: Issue): boolean {
    // bloqueado por, depende de, links a otros issues
  }

  private detectTestability(issue: Issue): boolean {
    // no hay criterios de aceptación, resultado subjetivo
  }
}