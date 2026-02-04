import { Octokit } from "octokit";
import { GitHostingPlatform } from "./GitHostingPlatform";
import { Issue, Label } from "./Issue";

export class GitHub implements GitHostingPlatform {
  async getRepositoryIssues(authHeader: string, repositoryName: string, ownerName: string): Promise<Issue[]> {
       
    const octokit = new Octokit({
        auth: authHeader
    })

    const rawIssues = await octokit.request('GET /repos/{owner}/{repo}/issues', {
        owner: ownerName,
        repo: repositoryName,
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    })

    return rawIssues.data.map(issue => new Issue(
      issue.number,
      issue.title,
      new Date(issue.created_at),
      new Date(issue.updated_at),
      issue.body || undefined,
      issue.labels.map((label: any) => new Label(typeof label === 'string' ? label : label.name))
    ));
  }
}