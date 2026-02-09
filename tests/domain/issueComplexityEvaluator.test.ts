import { IssueComplexityEvaluator } from "@/src/domain/tool/issueComplexityAnalyzer/issueComplexityEvaluator";
import { IssueSignals, Level } from "@/src/domain/tool/issueComplexityAnalyzer/complexityConcepts";
import { describe, it, expect } from "vitest";

describe("IssueComplexityEvaluator", () => {
  const evaluator = new IssueComplexityEvaluator();

  describe("evaluate", () => {
    it("should return HIGH complexity when uncertainty is HIGH", () => {
      const signals: IssueSignals = {
        hasAmbiguousDescription: false,
        requiresResearch: true, // HIGH uncertainty
        affectsMultipleComponents: false,
        requiresDesignDecisions: false,
        hasExternalDependencies: false,
        unclearCompletionCriteria: false,
      };

      const result = evaluator.evaluate(signals);

      expect(result.complexity).toBe(Level.HIGH);
    });

    it("should return HIGH complexity when clarity is LOW", () => {
      const signals: IssueSignals = {
        hasAmbiguousDescription: true, // LOW clarity
        requiresResearch: false,
        affectsMultipleComponents: false,
        requiresDesignDecisions: false,
        hasExternalDependencies: false,
        unclearCompletionCriteria: false,
      };

      const result = evaluator.evaluate(signals);

      expect(result.complexity).toBe(Level.HIGH);
    });

    it("should return HIGH complexity when 2 or more criteria are HIGH", () => {
      const signals: IssueSignals = {
        hasAmbiguousDescription: false,
        requiresResearch: false,
        affectsMultipleComponents: true, // HIGH scope
        requiresDesignDecisions: true, // HIGH design
        hasExternalDependencies: false,
        unclearCompletionCriteria: false,
      };

      const result = evaluator.evaluate(signals);

      expect(result.complexity).toBe(Level.HIGH);
    });

    it("should return MEDIUM complexity when 2 or more criteria are MEDIUM or HIGH", () => {
      const signals: IssueSignals = {
        hasAmbiguousDescription: false,
        requiresResearch: false,
        affectsMultipleComponents: false,
        requiresDesignDecisions: false,
        hasExternalDependencies: true, // MEDIUM dependencies
        unclearCompletionCriteria: true, // MEDIUM testability
      };

      const result = evaluator.evaluate(signals);

      expect(result.complexity).toBe(Level.MEDIUM);
    });

    it("should return LOW complexity when all criteria are LOW", () => {
      const signals: IssueSignals = {
        hasAmbiguousDescription: false,
        requiresResearch: false,
        affectsMultipleComponents: false,
        requiresDesignDecisions: false,
        hasExternalDependencies: false,
        unclearCompletionCriteria: false,
      };

      const result = evaluator.evaluate(signals);

      expect(result.complexity).toBe(Level.LOW);
    });

    it("should evaluate all criteria correctly", () => {
      const signals: IssueSignals = {
        hasAmbiguousDescription: true,
        requiresResearch: true,
        affectsMultipleComponents: true,
        requiresDesignDecisions: false,
        hasExternalDependencies: false,
        unclearCompletionCriteria: false,
      };

      const result = evaluator.evaluate(signals);

      expect(result.criteria.clarity).toBe(Level.LOW);
      expect(result.criteria.uncertainty).toBe(Level.HIGH);
      expect(result.criteria.scope).toBe(Level.HIGH);
      expect(result.criteria.design).toBe(Level.LOW);
      expect(result.criteria.dependencies).toBe(Level.LOW);
      expect(result.criteria.testability).toBe(Level.LOW);
    });

    it("should return MEDIUM when exactly 2 medium criteria are present", () => {
      const signals: IssueSignals = {
        hasAmbiguousDescription: false,
        requiresResearch: false,
        affectsMultipleComponents: false,
        requiresDesignDecisions: false,
        hasExternalDependencies: true, // MEDIUM
        unclearCompletionCriteria: true, // MEDIUM
      };

      const result = evaluator.evaluate(signals);

      expect(result.complexity).toBe(Level.MEDIUM);
    });
  });
});
