import { ExecutionEnvironment } from '@repo/types';
import { ServerOptimizeCodeTaskType } from '@repo/tasks-registry';
import { generateObject } from 'ai';
import { z } from 'zod';
import { OptimizePerformancePrompt } from '@repo/prompts';
import { GEMINI_MODEL } from '@app/common';

export async function optimizeCodeExecutor(
  environment: ExecutionEnvironment<ServerOptimizeCodeTaskType>,
): Promise<boolean> {
  try {
    const codeContext = environment.getCode();
    if (!codeContext) {
      environment.log.ERROR('Code context is empty');
      throw new Error('Code context is empty');
    }
    environment.log.INFO('Optimizing code...');

    const { object } = await generateObject({
      model: GEMINI_MODEL,
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
