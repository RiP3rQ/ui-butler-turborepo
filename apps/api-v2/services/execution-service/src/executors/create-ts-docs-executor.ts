import { ExecutionEnvironment } from '@repo/types';
import { ServerCreateTypeScriptDocsTaskType } from '@repo/tasks-registry';
import { generateObject } from 'ai';
import { GEMINI_MODEL } from '../../common/openai/ai';
import { z } from 'zod';
import { CreateTypescriptDocsPrompt } from '@repo/prompts';

export async function createTsDocsExecutor(
  environment: ExecutionEnvironment<ServerCreateTypeScriptDocsTaskType>,
): Promise<boolean> {
  try {
    const codeContext = environment.getCode();
    if (!codeContext) {
      environment.log.ERROR('Code context is empty');
      throw new Error('Code context is empty');
    }

    console.log('codeContext', codeContext);

    environment.log.INFO('Generating typescript docs...');

    const { object } = await generateObject({
      model: GEMINI_MODEL,
      schema: z.object({
        typescriptDocs: z.string(),
      }),
      system: CreateTypescriptDocsPrompt,
      messages: [
        {
          role: 'user',
          content: codeContext,
        },
      ],
    });

    if (!object.typescriptDocs) {
      environment.log.ERROR('Typescript docs are empty');
      throw new Error('Failed to generate typescript docs');
    }

    environment.setOutput('TypeScript Docs', object.typescriptDocs);
    environment.setTsDocs(object.typescriptDocs);
    environment.log.SUCCESS('Typescript docs generated successfully');
    return true;
  } catch (e) {
    const errorMesage = e instanceof Error ? e.message : JSON.stringify(e);
    environment.log.ERROR(`Error in createTsDocsExecutor: ${errorMesage}`);
    return false;
  }
}
