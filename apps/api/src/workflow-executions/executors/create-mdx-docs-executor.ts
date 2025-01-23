import { ExecutionEnvironment } from '@shared/types';
import { ServerCreateMDXDocsTaskType } from '@shared/tasks-registry';
import { generateObject } from 'ai';
import { GEMINI_MODEL } from '../../common/openai/ai';
import { z } from 'zod';
import { CreateMdxDocsPrompt } from '@shared/prompts';

export async function createMdxDocsExecutor(
  environment: ExecutionEnvironment<ServerCreateMDXDocsTaskType>,
): Promise<boolean> {
  try {
    const codeContext = environment.getCode();
    if (!codeContext) {
      environment.log.ERROR('Code context is empty');
      throw new Error('Code context is empty');
    }

    environment.log.INFO('Generating mdx docs...');

    const { object } = await generateObject({
      model: GEMINI_MODEL,
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
