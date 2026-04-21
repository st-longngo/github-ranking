export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class GitHubApiError extends AppError {
  constructor(message: string) {
    super(message, 'GITHUB_API_ERROR', 503);
    this.name = 'GitHubApiError';
  }
}

export class RateLimitError extends AppError {
  constructor(public readonly resetAt: Date) {
    super(
      `GitHub API rate limit exceeded. Resets at ${resetAt.toISOString()}`,
      'RATE_LIMIT',
      429,
    );
    this.name = 'RateLimitError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}
