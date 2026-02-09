export const AMBIGUITY_PATTERNS: RegExp[] = [
  /investigate/,
  /seems/,
  /appears/,
  /might be/,
  /possibly/,
  /not clear/,
  /unclear/,
  /sometimes/,
  /unexpected behavior/,
  /unknown cause/,
];

export const RESEARCH_PATTERNS: RegExp[] = [
  /spike/,
  /research/,
  /explore/,
  /investigation/,
  /proof of concept/,
  /\bpoc\b/,
  /refactor/,
  /major refactor/,
  /\bmigration/,
  /technical debt/,
];

export const SCOPE_PATTERNS: RegExp[] = [
  /frontend and backend/,
  /full stack/,
  /api and ui/,
  /multiple services/,
  /microservices?/,
  /several modules/,
  /across layers/,
  /end[- ]to[- ]end/,
];

export const DESIGN_PATTERNS: RegExp[] = [
  /define/,
  /design/,
  /redesign/,
  /evaluate alternatives?/,
  /choose approach/,
  /architecture/,
  /architectural decision/,
  /strategy/,
  /proposal/,
];

export const DEPENDENCY_PATTERNS: RegExp[] = [
  /blocked by/,
  /depends on/,
  /dependency/,
  /waiting for/,
  /after .* is completed/,
  /related issue/,
  /linked issue/,
];

export const TESTABILITY_PATTERNS: RegExp[] = [
  /no acceptance criteria/,
  /to be validated/,
  /hard to reproduce/,
  /manual verification/,
  /expected behavior unclear/,
  /subjective result/,
];