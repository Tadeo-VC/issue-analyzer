import { ComplexityAnalysis, ComplexityCriteria, IssueSignals, Level } from "./Complexity";
import { IssueSignalsExtractor } from "./IssueSignalsExtractor";

export class IssueComplexityEvaluator {

  private extractor: IssueSignalsExtractor;

  constructor(extractor: IssueSignalsExtractor) {
    this.extractor = extractor;
  }

  evaluate(signals: IssueSignals): ComplexityAnalysis {
    const criteria: ComplexityCriteria = {
      clarity: this.evaluateClarity(signals),
      uncertainty: this.evaluateUncertainty(signals),
      scope: this.evaluateScope(signals),
      design: this.evaluateDesign(signals),
      dependencies: this.evaluateDependencies(signals),
      testability: this.evaluateTestability(signals),
    };

    const complexity = this.summarizeComplexity(criteria);

    return {
      complexity,
      criteria,
    };
  }

  private evaluateClarity(signals: IssueSignals): Level {
    return signals.hasAmbiguousDescription
      ? Level.LOW
      : Level.HIGH;
  }

  private evaluateUncertainty(signals: IssueSignals): Level {
    return signals.requiresResearch
      ? Level.HIGH
      : Level.LOW;
  }

  private evaluateScope(signals: IssueSignals): Level {
    return signals.affectsMultipleComponents
      ? Level.HIGH
      : Level.LOW;
  }

  private evaluateDesign(signals: IssueSignals): Level {
    return signals.requiresDesignDecisions
      ? Level.HIGH
      : Level.LOW;
  }

  private evaluateDependencies(signals: IssueSignals): Level {
    return signals.hasExternalDependencies
      ? Level.MEDIUM
      : Level.LOW;
  }

  private evaluateTestability(signals: IssueSignals): Level {
    return signals.unclearCompletionCriteria
      ? Level.MEDIUM
      : Level.LOW;
  }

  private summarizeComplexity(criteria: ComplexityCriteria): Level {
    const values = Object.values(criteria);

    const highCount = values.filter(v => v === Level.HIGH).length;
    const mediumOrHighCount = values.filter(
      v => v === Level.MEDIUM || v === Level.HIGH
    ).length;

    if (
      criteria.uncertainty === Level.HIGH ||
      criteria.clarity === Level.LOW ||
      highCount >= 2
    ) {
      return Level.HIGH;
    }

    if (mediumOrHighCount >= 2) {
      return Level.MEDIUM;
    }

    return Level.LOW;
  }
}
