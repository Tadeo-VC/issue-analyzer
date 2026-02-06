import fetch from "node-fetch";
import { GitHostingPlatform } from "./gitHostingPlatform";
import { Issue, Label } from "./issue";
import z from "zod";
import {
  GitHubRateLimitError,
  GitHubAPIError,
  GitHubInvalidResponseError,
  GitHubRequestTimeoutError,
} from "../../errors";

export class GitHubAPIClient implements GitHostingPlatform {
  private baseUrl = "https://api.github.com";

  constructor() {}

  async getRepositoryIssues(
    authHeader: string, 
    repositoryName: string,
    ownerName: string
  ): Promise<Issue[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000); // 7s timeout

    try {
      const res = await fetch(`${this.baseUrl}/repos/${ownerName}/${repositoryName}/issues`, {
        headers: {
          Authorization: `token ${authHeader}`,
          Accept: "application/vnd.github+json",
        },
        signal: controller.signal,
      });

      if (!res.ok) {
        // manejo básico de rate limit
        if (res.status === 403 && res.headers.get("X-RateLimit-Remaining") === "0") {
          throw new GitHubRateLimitError();
        }
        throw new GitHubAPIError(res.status, res.statusText);
      }

      const data = await res.json();

      const result = IssuesResponseSchema.safeParse(data);
      if (!result.success) {
        throw new GitHubInvalidResponseError(result.error.message);
      }

      const issues = result.data.map(issue => ({
        number: issue.number,
        title: issue.title,
        body: issue.body,
        labels: issue.labels.map(l => (typeof l === "string" ? l : l.name)),
      }));

      return issues.map(
        (issue: any) =>
          new Issue(
            issue.number,
            issue.title,
            new Date(issue.created_at),
            new Date(issue.updated_at),
            issue.body || undefined,
            issue.labels.map((l: any) => new Label(typeof l === "string" ? l : l.name))
          )
      );
    } catch (err: any) {
      if (err.name === "AbortError") throw new GitHubRequestTimeoutError();
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }
}

// Response Schema

const LabelSchema = z.union([
  z.string(), // puede venir como string
  z.object({
    id: z.number(),
    name: z.string(),
    color: z.string().optional(),
  }),
]);

const IssueSchema = z.object({
  number: z.number(),
  title: z.string(),
  body: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  labels: z.array(LabelSchema),
});

const IssuesResponseSchema = z.array(IssueSchema);