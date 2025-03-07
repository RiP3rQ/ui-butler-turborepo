import { GET_GEMINI_MODEL } from '@microservices/common';
import { ImproveCssPrompt } from '@shared/prompts';
import { type ServerImproveStylesTaskType } from '@shared/tasks-registry';
import { type ExecutionEnvironment } from '@shared/types';
import { generateObject } from 'ai';
import { z } from 'zod';

export async function improveStylesExecutor(
  environment: ExecutionEnvironment<ServerImproveStylesTaskType>,
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

    environment.log.INFO('Improving styles...');

    const { object } = await generateObject({
      model: GET_GEMINI_MODEL(credentials),
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
    environment.setOutput('Code', object.improvedCode.code);
    environment.log.SUCCESS('Styles improved successfully');
    return true;
  } catch (e) {
    const errorMesage = e instanceof Error ? e.message : JSON.stringify(e);
    environment.log.ERROR(`Error in improveStylesExecutor: ${errorMesage}`);
    return false;
  }
}
