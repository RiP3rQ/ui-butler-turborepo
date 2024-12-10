import { createOpenAI } from '@ai-sdk/openai';

export const openAIProvider = createOpenAI({
  // ...
  baseURL: 'http://localhost:1234/v1',
});
