export enum Level {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export interface ComplexityCriteria {
  clarity: Level;
  uncertainty: Level;
  scope: Level;
  design: Level;
  dependencies: Level;
  testability: Level;
}

export interface ComplexityAnalysis {
  complexity: Level;
  criteria: ComplexityCriteria;
}

export interface IssueSignals {
  hasAmbiguousDescription: boolean;
  requiresResearch: boolean;
  affectsMultipleComponents: boolean;
  requiresDesignDecisions: boolean;
  hasExternalDependencies: boolean;
  unclearCompletionCriteria: boolean;
}