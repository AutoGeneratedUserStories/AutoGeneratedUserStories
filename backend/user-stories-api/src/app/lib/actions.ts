'use server';

import { streamObject } from 'ai';
import { google } from "@ai-sdk/google"
import { createStreamableValue } from 'ai/rsc';
import { z } from 'zod';

export async function generate(input: string) {
  'use server';

  const stream = createStreamableValue();

  (async () => {
    const { partialObjectStream } = streamObject({
        model: google('gemini-2.0-flash'),
        system: "As a software engineering project manager, " +
    "Your job is to take a given project description and generate every necessary user story " +
    "to take the project to completion. Also generate acceptance criteria for each user story as necessary",
      prompt: input,
      schema: z.object({
        stories: z.array(
          z.object({
            name: z.string().describe('Name of the user story.'),
            description: z.string().describe('Description of the user story.'),
            acceptance_criteria: z.string(),
          }),
        ),
      }),
    });
    
    for await (const partialObject of partialObjectStream) {
      stream.update(partialObject);
    }

    stream.done();
  })();

  return { object: stream.value };
}