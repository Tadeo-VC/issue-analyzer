import { z } from "zod";

// Enum Level como literal
export enum Level {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export const LevelSchema = z.nativeEnum(Level);

// IssueSignals schema
export const IssueSignalsSchema = z.object({
  hasAmbiguousDescription: z.boolean(),
  requiresResearch: z.boolean(),
  affectsMultipleComponents: z.boolean(),
  requiresDesignDecisions: z.boolean(),
  hasExternalDependencies: z.boolean(),
  unclearCompletionCriteria: z.boolean(),
});

export type IssueSignals = z.infer<typeof IssueSignalsSchema>;

// ComplexityCriteria schema
export const ComplexityCriteriaSchema = z.object({
  clarity: LevelSchema,
  uncertainty: LevelSchema,
  scope: LevelSchema,
  design: LevelSchema,
  dependencies: LevelSchema,
  testability: LevelSchema,
});

export type ComplexityCriteria = z.infer<typeof ComplexityCriteriaSchema>;

// ComplexityAnalysis schema
export const ComplexityAnalysisSchema = z.object({
  complexity: LevelSchema,
  criteria: ComplexityCriteriaSchema,
});

export type ComplexityAnalysis = z.infer<typeof ComplexityAnalysisSchema>;