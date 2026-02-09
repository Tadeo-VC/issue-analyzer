import { IssueComplexityAnalyzer } from "@/src/domain/tool/issueComplexityAnalyzer/issueComplexityAnalyzer";
import { IssueComplexityEvaluator } from "@/src/domain/tool/issueComplexityAnalyzer/issueComplexityEvaluator";
import { IssueSignalsExtractor } from "@/src/domain/tool/issueComplexityAnalyzer/issueSignalsExtractor";
import { GitHostingPlatform } from "@/src/domain/tool/gitHostingPlatform/gitHostingPlatform";
import { Issue } from "@/src/domain/tool/gitHostingPlatform/issue";
import { ChatContextRepository } from "@/src/domain/repositories/chatContextRepository";
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("IssueComplexityAnalyzer", () => {
  let mockGitHostingPlatform: GitHostingPlatform;
  let evaluator: IssueComplexityEvaluator;
  let extractor: IssueSignalsExtractor;
  let analyzer: IssueComplexityAnalyzer;

  beforeEach(() => {
    mockGitHostingPlatform = {
      getRepositoryIssues: vi.fn(),
    };
    evaluator = new IssueComplexityEvaluator();
    extractor = new IssueSignalsExtractor();
    analyzer = new IssueComplexityAnalyzer(evaluator, extractor, mockGitHostingPlatform);
    
    // Mock ChatContextRepository.getInstance to avoid Supabase dependency
    vi.spyOn(ChatContextRepository, 'getInstance').mockResolvedValue({
      getUserAuth: vi.fn().mockResolvedValue("mock-token"),
      saveChat: vi.fn(),
      findChatById: vi.fn(),
      persistChat: vi.fn(),
      getUserChats: vi.fn(),
      deleteChat: vi.fn(),
    } as any);
  });

  describe("call", () => {
    it("should analyze issues complexity for a repository", async () => {
      const mockIssue = new Issue(
        1,
        "Test issue",
        new Date(),
        new Date(),
        "This needs research"
      );

      vi.mocked(mockGitHostingPlatform.getRepositoryIssues).mockResolvedValue([mockIssue]);

      const result = await analyzer.call("chat-123", "repo-name", "owner");

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
    });

    it("should return analysis with complexity level", async () => {
      const mockIssue = new Issue(
        1,
        "Simple issue",
        new Date(),
        new Date(),
        "Just fix this"
      );

      vi.mocked(mockGitHostingPlatform.getRepositoryIssues).mockResolvedValue([mockIssue]);

      const result = await analyzer.call("chat-123", "repo-name", "owner");

      expect(result[0]).toHaveProperty("complexity");
      expect(result[0]).toHaveProperty("criteria");
    });

    it("should handle multiple issues", async () => {
      const issues = [
        new Issue(1, "Issue 1", new Date(), new Date(), "Simple"),
        new Issue(2, "Issue 2", new Date(), new Date(), "Research needed"),
        new Issue(3, "Issue 3", new Date(), new Date(), "Design required"),
      ];

      vi.mocked(mockGitHostingPlatform.getRepositoryIssues).mockResolvedValue(issues);

      const result = await analyzer.call("chat-123", "repo-name", "owner");

      expect(result.length).toBe(3);
    });

    it("should throw exception on GitHostingPlatform error", async () => {
      const error = new Error("GitHub API error");
      vi.mocked(mockGitHostingPlatform.getRepositoryIssues).mockRejectedValue(error);

      await expect(
        analyzer.call("chat-123", "repo-name", "owner")
      ).rejects.toThrow();
    });

    it("should process issues with all complexity signals", async () => {
      const complexIssue = new Issue(
        1,
        "Complex refactoring with unclear requirements",
        new Date(),
        new Date(),
        "Need to research architecture, affects multiple components, requires design decisions, no clear acceptance criteria"
      );

      vi.mocked(mockGitHostingPlatform.getRepositoryIssues).mockResolvedValue([complexIssue]);

      const result = await analyzer.call("chat-123", "repo-name", "owner");

      expect(result[0].complexity).toBeDefined();
      expect(result[0].criteria).toBeDefined();
    });
  });
});
