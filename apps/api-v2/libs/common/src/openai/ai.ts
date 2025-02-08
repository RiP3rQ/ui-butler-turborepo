import { createGoogleGenerativeAI, type google } from "@ai-sdk/google";

// Define types for the model
type GeminiModel = ReturnType<typeof google>;

/**
 * Gets a configured Gemini model instance using either a user's API key or the default website key
 * @param userApiKey - Optional user-provided Google AI API key
 * @returns Configured Gemini model instance
 */
export function GET_GEMINI_MODEL(userApiKey?: string): GeminiModel {
  const apiKey =
    userApiKey && userApiKey.length > 0
      ? userApiKey
      : process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    throw new Error("No API key provided and no fallback key available");
  }

  const googleAI = createGoogleGenerativeAI({
    apiKey,
  });

  return googleAI("gemini-1.5-flash-latest");
}
