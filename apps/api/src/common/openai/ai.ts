import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  // custom settings
});

export const GEMINI_MODEL = google('gemini-1.5-flash-latest');
