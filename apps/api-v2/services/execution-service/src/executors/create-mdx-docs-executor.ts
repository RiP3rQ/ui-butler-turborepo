import { type ExecutionEnvironment } from '@shared/types';
import { type ServerCreateMDXDocsTaskType } from '@shared/tasks-registry';
import { generateObject } from 'ai';
import { z } from 'zod';
import { CreateMdxDocsPrompt } from '@shared/prompts';
import { GET_GEMINI_MODEL } from '@app/common';

export async function createMdxDocsExecutor(
  environment: ExecutionEnvironment<ServerCreateMDXDocsTaskType>,
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

    environment.log.INFO('Generating mdx docs...');

    const { object } = await generateObject({
      model: GET_GEMINI_MODEL(credentials),
      schema: z.object({
        mdxDocs: z.string(),
      }),
      system: CreateMdxDocsPrompt,
      messages: [
        {
          role: 'user',
          content: codeContext,
        },
      ],
    });

    if (!object.mdxDocs) {
      environment.log.ERROR('Mdx docs are empty');
      throw new Error('Failed to generate mdx docs');
    }

    environment.setOutput('MDX Docs', object.mdxDocs);
    environment.setMdxDocs(object.mdxDocs);
    environment.log.SUCCESS('Mdx docs generated successfully');
    return true;
  } catch (e) {
    const errorMesage = e instanceof Error ? e.message : JSON.stringify(e);
    environment.log.ERROR(`Error in createMdxDocsExecutor: ${errorMesage}`);
    return false;
  }
}
