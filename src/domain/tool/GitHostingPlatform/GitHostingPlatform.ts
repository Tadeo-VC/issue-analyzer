import { Issue } from "./Issue";

export interface GitHostingPlatform {
  getRepositoryIssues(authHeader: string, repositoryName: string, ownerName: string): Promise<Issue[]>;
}