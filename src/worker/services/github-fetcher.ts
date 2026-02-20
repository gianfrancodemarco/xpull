import type { Octokit } from "@octokit/rest";
import type { GitHubRateLimiter } from "~/server/lib/rate-limiter";

export type NormalizedRepo = {
  externalId: string;
  ownerLogin: string;
  isPrivate: boolean;
  defaultBranch: string | null;
  primaryLanguage: string | null;
};

export type NormalizedCommit = {
  sha: string;
  authorLogin: string | null;
  date: Date;
  linesAdded: number;
  linesRemoved: number;
  filesChanged: number;
  messageLength: number;
  languages: LanguageEntry[];
};

export type NormalizedPR = {
  number: number;
  externalId: string;
  title: string;
  titleLength: number;
  mergedAt: Date;
  linesAdded: number;
  linesRemoved: number;
  filesChanged: number;
};

export type NormalizedReview = {
  externalId: string;
  prNumber: number;
  state: string;
  submittedAt: Date;
};

export type LanguageEntry = {
  language: string;
  bytes: number;
};

async function checkRateLimit(rateLimiter: GitHubRateLimiter): Promise<void> {
  if (rateLimiter.shouldPause()) {
    await rateLimiter.waitForReset();
  }
}

function extractRateLimitHeaders(
  headers: Record<string, string | number | undefined>,
): Record<string, string | undefined> {
  return {
    "x-ratelimit-remaining": String(headers["x-ratelimit-remaining"] ?? ""),
    "x-ratelimit-limit": String(headers["x-ratelimit-limit"] ?? ""),
    "x-ratelimit-reset": String(headers["x-ratelimit-reset"] ?? ""),
  };
}

export async function fetchUserRepositories(
  octokit: Octokit,
  rateLimiter: GitHubRateLimiter,
): Promise<NormalizedRepo[]> {
  await checkRateLimit(rateLimiter);

  const repos = await octokit.paginate(octokit.rest.repos.listForAuthenticatedUser, {
    per_page: 100,
    type: "owner",
  });

  const lastResponse = await octokit.rest.repos.listForAuthenticatedUser({ per_page: 1 });
  rateLimiter.handleResponse(
    extractRateLimitHeaders(lastResponse.headers as Record<string, string | number | undefined>),
  );

  return repos.map((repo) => ({
    externalId: String(repo.id),
    ownerLogin: repo.owner?.login ?? "",
    isPrivate: repo.private,
    defaultBranch: repo.default_branch ?? null,
    primaryLanguage: repo.language ?? null,
  }));
}

export async function fetchRepositoryCommits(
  octokit: Octokit,
  owner: string,
  repo: string,
  rateLimiter: GitHubRateLimiter,
  since?: Date,
): Promise<NormalizedCommit[]> {
  await checkRateLimit(rateLimiter);

  const params: Parameters<typeof octokit.rest.repos.listCommits>[0] = {
    owner,
    repo,
    per_page: 100,
    ...(since && { since: since.toISOString() }),
  };

  const commits = await octokit.paginate(octokit.rest.repos.listCommits, params);

  const lastResponse = await octokit.rest.repos.listCommits({ owner, repo, per_page: 1 });
  rateLimiter.handleResponse(
    extractRateLimitHeaders(lastResponse.headers as Record<string, string | number | undefined>),
  );

  return commits.map((commit) => ({
    sha: commit.sha,
    authorLogin: commit.author?.login ?? null,
    date: new Date(commit.commit.author?.date ?? commit.commit.committer?.date ?? ""),
    linesAdded: (commit as unknown as { stats?: { additions?: number } }).stats?.additions ?? 0,
    linesRemoved: (commit as unknown as { stats?: { deletions?: number } }).stats?.deletions ?? 0,
    filesChanged: (commit as unknown as { files?: unknown[] }).files?.length ?? 0,
    messageLength: commit.commit.message?.length ?? 0,
    languages: detectLanguages(
      ((commit as unknown as { files?: { filename?: string }[] }).files ?? []).map((f) => ({
        filename: f.filename ?? "",
      })),
    ),
  }));
}

export async function fetchRepositoryPullRequests(
  octokit: Octokit,
  owner: string,
  repo: string,
  rateLimiter: GitHubRateLimiter,
  since?: Date,
): Promise<NormalizedPR[]> {
  await checkRateLimit(rateLimiter);

  const pulls = await octokit.paginate(octokit.rest.pulls.list, {
    owner,
    repo,
    state: "closed",
    sort: "updated",
    direction: "desc",
    per_page: 100,
  });

  const lastResponse = await octokit.rest.pulls.list({ owner, repo, state: "closed", per_page: 1 });
  rateLimiter.handleResponse(
    extractRateLimitHeaders(lastResponse.headers as Record<string, string | number | undefined>),
  );

  return pulls
    .filter((pr) => pr.merged_at !== null)
    .filter((pr) => !since || new Date(pr.merged_at!) >= since)
    .map((pr) => {
      const prData = pr as unknown as {
        number: number;
        id: number;
        title: string;
        merged_at: string;
        additions?: number;
        deletions?: number;
        changed_files?: number;
      };
      return {
        number: prData.number,
        externalId: String(prData.id),
        title: prData.title,
        titleLength: prData.title.length,
        mergedAt: new Date(prData.merged_at),
        linesAdded: prData.additions ?? 0,
        linesRemoved: prData.deletions ?? 0,
        filesChanged: prData.changed_files ?? 0,
      };
    });
}

export async function fetchPullRequestReviews(
  octokit: Octokit,
  owner: string,
  repo: string,
  pullNumber: number,
  rateLimiter: GitHubRateLimiter,
): Promise<NormalizedReview[]> {
  await checkRateLimit(rateLimiter);

  const response = await octokit.rest.pulls.listReviews({
    owner,
    repo,
    pull_number: pullNumber,
    per_page: 100,
  });

  rateLimiter.handleResponse(
    extractRateLimitHeaders(response.headers as Record<string, string | number | undefined>),
  );

  return response.data.map((review) => ({
    externalId: String(review.id),
    prNumber: pullNumber,
    state: review.state,
    submittedAt: new Date(review.submitted_at ?? ""),
  }));
}

const EXTENSION_LANGUAGE_MAP: Record<string, string> = {
  ".ts": "TypeScript",
  ".tsx": "TypeScript",
  ".js": "JavaScript",
  ".jsx": "JavaScript",
  ".mjs": "JavaScript",
  ".cjs": "JavaScript",
  ".py": "Python",
  ".rb": "Ruby",
  ".go": "Go",
  ".rs": "Rust",
  ".java": "Java",
  ".kt": "Kotlin",
  ".kts": "Kotlin",
  ".swift": "Swift",
  ".c": "C",
  ".h": "C",
  ".cpp": "C++",
  ".cc": "C++",
  ".cxx": "C++",
  ".hpp": "C++",
  ".cs": "C#",
  ".php": "PHP",
  ".scala": "Scala",
  ".clj": "Clojure",
  ".ex": "Elixir",
  ".exs": "Elixir",
  ".erl": "Erlang",
  ".hs": "Haskell",
  ".lua": "Lua",
  ".r": "R",
  ".R": "R",
  ".dart": "Dart",
  ".vue": "Vue",
  ".svelte": "Svelte",
  ".html": "HTML",
  ".css": "CSS",
  ".scss": "SCSS",
  ".sass": "Sass",
  ".less": "Less",
  ".json": "JSON",
  ".yaml": "YAML",
  ".yml": "YAML",
  ".xml": "XML",
  ".sql": "SQL",
  ".sh": "Shell",
  ".bash": "Shell",
  ".zsh": "Shell",
  ".md": "Markdown",
  ".mdx": "Markdown",
  ".toml": "TOML",
  ".graphql": "GraphQL",
  ".gql": "GraphQL",
  ".proto": "Protocol Buffers",
  ".tf": "HCL",
  ".zig": "Zig",
  ".nim": "Nim",
  ".v": "V",
  ".pl": "Perl",
  ".pm": "Perl",
};

export function detectLanguages(
  files: { filename: string }[],
): LanguageEntry[] {
  const languageBytes = new Map<string, number>();

  for (const file of files) {
    const ext = getFileExtension(file.filename);
    const language = EXTENSION_LANGUAGE_MAP[ext];
    if (language) {
      const current = languageBytes.get(language) ?? 0;
      languageBytes.set(language, current + 1);
    }
  }

  return Array.from(languageBytes.entries()).map(([language, bytes]) => ({
    language,
    bytes,
  }));
}

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return "";
  return filename.slice(lastDot);
}
