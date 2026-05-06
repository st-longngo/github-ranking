/**
 * GitHub REST API response shapes.
 * Used by services to type-assert `fetch` responses — never exposed to the UI layer.
 */

/** Generic search API envelope returned by /search/repositories and /search/users. */
export interface GitHubSearchResponse<T> {
  total_count: number;
  items: T[];
}

/**
 * Repository item returned by /search/repositories.
 * `name` and `owner` are always present in GitHub responses; include them here
 * so all three services (github, trending, cronFetcher) can share one type.
 */
export interface GitHubRepoItem {
  full_name: string;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  owner: { login: string; avatar_url: string };
}

/** User or organisation item returned by /search/users. */
export interface GitHubUserItem {
  login: string;
  avatar_url: string;
  html_url: string;
  type: string;
  followers: number;
}

/** Single release object returned by /repos/{owner}/{repo}/releases. */
export interface GitHubRelease {
  tag_name: string;
  name: string | null;
  published_at: string;
  html_url: string;
  draft: boolean;
  prerelease: boolean;
}

/** Stargazer record returned by /repos/{owner}/{repo}/stargazers (star+json media type). */
export interface GitHubStargazerItem {
  starred_at: string;
}

/** Full repository detail returned by /repos/{owner}/{repo}. */
export interface GitHubRepoDetail {
  full_name: string;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  license: { spdx_id: string | null; name: string } | null;
  created_at: string;
  pushed_at: string;
  owner: { login: string; avatar_url: string };
}
