/**
 * Returns the base URL for the API
 */
export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL
    ? String(`${process.env.NEXT_PUBLIC_API_URL}/api`)
    : "http://localhost:3333/api";
}
