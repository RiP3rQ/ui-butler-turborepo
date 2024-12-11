import { ExecutionEnvironment } from '@repo/types';
import { ServerCreateE2ETestsTaskType } from '@repo/tasks-registry';
import { generateObject } from 'ai';
import { GEMINI_MODEL } from '../../common/openai/ai';
import { z } from 'zod';
import { CreateE2eTestsPrompt } from '@repo/prompts';

export async function createE2ETestsExecutor(
  environment: ExecutionEnvironment<ServerCreateE2ETestsTaskType>,
): Promise<boolean> {
  try {
    const codeContext = environment.getCode();
    if (!codeContext) {
      environment.log.ERROR('Code context is empty');
      throw new Error('Code context is empty');
    }

    environment.log.INFO('Generating E2E tests...');

    const { object } = await generateObject({
      model: GEMINI_MODEL,
      schema: z.object({
        e2eTests: z.string(),
      }),
      system: CreateE2eTestsPrompt,
      messages: [
        {
          role: 'user',
          content: codeContext,
        },
      ],
    });

    if (!object.e2eTests) {
      environment.log.ERROR('E2E tests are empty');
      throw new Error('Failed to generate E2E tests');
    }

    environment.setOutput('E2E Tests', object.e2eTests);
    environment.log.SUCCESS('E2E tests generated successfully');
    return true;
  } catch (e) {
    const errorMesage = e instanceof Error ? e.message : JSON.stringify(e);
    environment.log.ERROR(`Error in createE2ETestsExecutor: ${errorMesage}`);
    return false;
  }
}
