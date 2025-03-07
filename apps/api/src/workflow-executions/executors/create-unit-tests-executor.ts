import { ExecutionEnvironment } from '@shared/types';
import { ServerCreateUnitTestsTaskType } from '@shared/tasks-registry';
import { generateObject } from 'ai';
import { GEMINI_MODEL } from '../../common/openai/ai';
import { z } from 'zod';
import { CreateUnitTestsPrompt } from '@shared/prompts';

export async function createUnitTestsExecutor(
  environment: ExecutionEnvironment<ServerCreateUnitTestsTaskType>,
): Promise<boolean> {
  try {
    const codeContext = environment.getCode();
    if (!codeContext) {
      environment.log.ERROR('Code context is empty');
      throw new Error('Code context is empty');
    }

    environment.log.INFO('Generating unit tests...');

    const { object } = await generateObject({
      model: GEMINI_MODEL,
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
