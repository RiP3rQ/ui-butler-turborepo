import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  // custom settings
  apiKey: process.env.GOOGLE_API_KEY,
});

const GEMINI_MODEL = google('gemini-1.5-pro-latest');
