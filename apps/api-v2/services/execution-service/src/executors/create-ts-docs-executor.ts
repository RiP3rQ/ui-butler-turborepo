import { GET_GEMINI_MODEL } from '@microservices/common';
import { CreateTypescriptDocsPrompt } from '@shared/prompts';
import { type ServerCreateTypeScriptDocsTaskType } from '@shared/tasks-registry';
import { type ExecutionEnvironment } from '@shared/types';
import { generateObject } from 'ai';
import { z } from 'zod';

export async function createTsDocsExecutor(
  environment: ExecutionEnvironment<ServerCreateTypeScriptDocsTaskType>,
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

    console.log('codeContext', codeContext);

    environment.log.INFO('Generating typescript docs...');

    const { object } = await generateObject({
      model: GET_GEMINI_MODEL(credentials),
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
