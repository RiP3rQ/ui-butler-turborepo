import { ExecutionEnvironment } from '@repo/types';
import { ServerImproveStylesTaskType } from '@repo/tasks-registry';
import { generateObject } from 'ai';
import { GEMINI_MODEL } from '../../common/openai/ai';
import { z } from 'zod';
import { ImproveCssPrompt } from '@repo/prompts';

export async function improveStylesExecutor(
  environment: ExecutionEnvironment<ServerImproveStylesTaskType>,
): Promise<boolean> {
  try {
    const codeContext = environment.getCode();
    if (!codeContext) {
      environment.log.ERROR('Code context is empty');
      throw new Error('Code context is empty');
    }

    environment.log.INFO('Improving styles...');

    const { object } = await generateObject({
      model: GEMINI_MODEL,
      schema: z.object({
        improvedCode: z.object({
          code: z.string(),
        }),
      }),
      system: ImproveCssPrompt,
      messages: [
        {
          role: 'user',
          content: codeContext,
        },
      ],
    });

    if (!object.improvedCode) {
      environment.log.ERROR('Improved code styles is empty');
      throw new Error('Failed to improve code styles');
    }

    environment.setCode(object.improvedCode.code);
    environment.log.SUCCESS('Styles improved successfully');
    return true;
  } catch (e) {
    const errorMesage = e instanceof Error ? e.message : JSON.stringify(e);
    environment.log.ERROR(`Error in improveStylesExecutor: ${errorMesage}`);
    return false;
  }
}
