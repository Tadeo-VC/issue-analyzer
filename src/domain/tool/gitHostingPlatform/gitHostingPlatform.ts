import { Issue } from "./issue";

export interface GitHostingPlatform {
  getRepositoryIssues(authHeader: string, repositoryName: string, ownerName: string): Promise<Issue[]>;
}