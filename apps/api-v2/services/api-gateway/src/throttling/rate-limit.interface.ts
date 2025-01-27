export interface RateLimitConfig {
  ttl: number; // Time window in seconds
  limit: number; // Maximum number of requests within the time window
  errorMessage?: string;
}

export interface RateLimitInfo {
  totalHits: number;
  remainingHits: number;
  resetsIn: number;
}

export interface GlobalRateLimitConfig {
  ttl: number;
  limit: number;
}
