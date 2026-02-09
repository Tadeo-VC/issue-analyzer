import { IssueSignalsExtractor } from "@/src/domain/tool/issueComplexityAnalyzer/issueSignalsExtractor";
import { Issue, Label } from "@/src/domain/tool/gitHostingPlatform/issue";
import { describe, it, expect } from "vitest";

describe("IssueSignalsExtractor", () => {
  const extractor = new IssueSignalsExtractor();

  describe("extract", () => {
    it("should detect ambiguous description", () => {
      const issue = new Issue(
        1,
        "Issue with unclear behavior",
        new Date(),
        new Date(),
        "This appears to be causing issues sometimes"
      );

      const signals = extractor.extract(issue);

      expect(signals.hasAmbiguousDescription).toBe(true);
    });

    it("should detect research needs", () => {
      const issue = new Issue(
        1,
        "Research spike on new architecture",
        new Date(),
        new Date(),
        "Need to explore and investigate different approaches"
      );

      const signals = extractor.extract(issue);

      expect(signals.requiresResearch).toBe(true);
    });

    it("should detect multiple component impact", () => {
      const issue = new Issue(
        1,
        "Major refactor across layers",
        new Date(),
        new Date(),
        "Full stack migration needed"
      );

      const signals = extractor.extract(issue);

      expect(signals.affectsMultipleComponents).toBe(true);
    });

    it("should detect design decisions needed", () => {
      const issue = new Issue(
        1,
        "Architectural decision needed",
        new Date(),
        new Date(),
        "Need to design and define system strategy"
      );

      const signals = extractor.extract(issue);

      expect(signals.requiresDesignDecisions).toBe(true);
    });

    it("should detect external dependencies", () => {
      const issue = new Issue(
        1,
        "Blocked by API integration",
        new Date(),
        new Date(),
        "Depends on external service implementation"
      );

      const signals = extractor.extract(issue);

      expect(signals.hasExternalDependencies).toBe(true);
    });

    it("should detect unclear completion criteria", () => {
      const issue = new Issue(
        1,
        "Update functionality",
        new Date(),
        new Date(),
        "No acceptance criteria defined for validation"
      );

      const signals = extractor.extract(issue);

      expect(signals.unclearCompletionCriteria).toBe(true);
    });

    it("should handle issue without body", () => {
      const issue = new Issue(
        1,
        "Simple fix",
        new Date(),
        new Date(),
        undefined
      );

      const signals = extractor.extract(issue);

      expect(signals).toBeDefined();
      expect(signals.hasAmbiguousDescription).toBe(false);
    });

    it("should normalize text correctly", () => {
      const issue = new Issue(
        1,
        "Issue Title With Special-Characters!@#",
        new Date(),
        new Date(),
        "Body with Áccénts and spëciål çhars"
      );

      const signals = extractor.extract(issue);

      expect(signals).toBeDefined();
    });

    it("should handle case-insensitive pattern matching", () => {
      const issue = new Issue(
        1,
        "RESEARCH SPIKE",
        new Date(),
        new Date(),
        "INVESTIGATE AND EXPLORE NEW APPROACHES"
      );

      const signals = extractor.extract(issue);

      expect(signals.requiresResearch).toBe(true);
    });

    it("should return all signals for a complex issue", () => {
      const issue = new Issue(
        1,
        "Spike on major refactor with unclear requirements",
        new Date(),
        new Date(),
        "Need to design a full stack migration, currently blocked by external dependency, no acceptance criteria"
      );

      const signals = extractor.extract(issue);

      expect(signals.hasAmbiguousDescription).toBeDefined();
      expect(signals.requiresResearch).toBeDefined();
      expect(signals.affectsMultipleComponents).toBeDefined();
      expect(signals.requiresDesignDecisions).toBeDefined();
      expect(signals.hasExternalDependencies).toBeDefined();
      expect(signals.unclearCompletionCriteria).toBeDefined();
    });
  });
});
