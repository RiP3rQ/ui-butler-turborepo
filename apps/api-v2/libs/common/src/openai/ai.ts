import { createGoogleGenerativeAI, google } from "@ai-sdk/google";

// Define a type for the model
type GeminiModel = ReturnType<typeof google>;

const googleAI = createGoogleGenerativeAI({
  // custom settings
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const GEMINI_MODEL: GeminiModel = googleAI("gemini-1.5-flash-latest");
