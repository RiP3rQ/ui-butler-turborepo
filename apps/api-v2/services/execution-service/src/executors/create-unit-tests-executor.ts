import { GET_GEMINI_MODEL } from '@microservices/common';
import { CreateUnitTestsPrompt } from '@shared/prompts';
import { type ServerCreateUnitTestsTaskType } from '@shared/tasks-registry';
import { type ExecutionEnvironment } from '@shared/types';
import { generateObject } from 'ai';
import { z } from 'zod';

export async function createUnitTestsExecutor(
  environment: ExecutionEnvironment<ServerCreateUnitTestsTaskType>,
): Promise<boolean> {
  try {
    const codeContext = environment.getCode();
    if (!codeContext) {
      environment.log.ERROR('Code context is empty');
      throw new Error('Code context is empty');
    }

    const credentials = environment.getInput('API key');
    if (!credentials) {
      environment.log.WARNING(
        "We didn't found you AI API credentials. Fallback to UI-Butler's API key",
      );
    }

    environment.log.INFO('Generating unit tests...');

    const { object } = await generateObject({
      model: GET_GEMINI_MODEL(credentials),
      schema: z.object({
        unitTests: z.string(),
      }),
      system: CreateUnitTestsPrompt,
      messages: [
        {
          role: 'user',
          content: codeContext,
        },
      ],
    });

    if (!object.unitTests) {
      environment.log.ERROR('Unit tests are empty');
      throw new Error('Failed to generate unit tests');
    }

    environment.setOutput('Unit Tests', object.unitTests);
    environment.setUnitTests(object.unitTests);
    environment.log.SUCCESS('Unit tests generated successfully');
    return true;
  } catch (e) {
    const errorMesage = e instanceof Error ? e.message : JSON.stringify(e);
    environment.log.ERROR(`Error in createUnitTestsExecutor: ${errorMesage}`);
    return false;
  }
}
