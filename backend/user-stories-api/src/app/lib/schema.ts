import { z } from 'zod';

export const storySchema = z.object({
    stories: z.array(
      z.object({
        name: z.string().describe('Name of the user story.'),
        description: z.string().describe('Description of the user story.'),
        acceptance_criteria: z.array(z.string()).describe('List of acceptance criteria.'),
      }),
    ),
  });