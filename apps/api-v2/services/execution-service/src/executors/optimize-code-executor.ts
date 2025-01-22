import { type ExecutionEnvironment } from '@repo/types';
import { type ServerOptimizeCodeTaskType } from '@repo/tasks-registry';
import { generateObject } from 'ai';
import { z } from 'zod';
import { OptimizePerformancePrompt } from '@repo/prompts';
import { GET_GEMINI_MODEL } from '@app/common';

export async function optimizeCodeExecutor(
  environment: ExecutionEnvironment<ServerOptimizeCodeTaskType>,
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

    environment.log.INFO('Optimizing code...');

    const { object } = await generateObject({
      model: GET_GEMINI_MODEL(credentials),
      schema: z.object({
        optimizedCode: z.object({
          code: z.string(),
        }),
      }),
      system: OptimizePerformancePrompt,
      messages: [
        {
          role: 'user',
          content: codeContext,
        },
      ],
    });

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- LLM can return empty object
    if (!object.optimizedCode) {
      environment.log.ERROR('Optimized code is empty');
      throw new Error('Failed to optimize code');
    }

    environment.setCode(object.optimizedCode.code);
    environment.setOutput('Code', object.optimizedCode.code);
    environment.log.SUCCESS('Code optimized successfully');
    return true;
  } catch (e) {
    const errorMesage = e instanceof Error ? e.message : JSON.stringify(e);
    environment.log.ERROR(`Error in optimizeCodeExecutor: ${errorMesage}`);
    return false;
  }
}
