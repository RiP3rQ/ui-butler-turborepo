import { createGoogleGenerativeAI, google } from "@ai-sdk/google";

// Define a type for the model
type GeminiModel = ReturnType<typeof google>;

const googleAI = createGoogleGenerativeAI({
  // custom settings
});

export const GEMINI_MODEL: GeminiModel = googleAI("gemini-1.5-flash-latest");
