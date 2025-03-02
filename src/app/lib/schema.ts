import { z } from "zod";

export const storySchema = z.object({
  stories: z.array(
    z.object({
      name: z.string().describe("Name of the user story."),
      description: z.string().describe("Description of the user story."),
      acceptanceCriteria: z.array(z.string()).describe("List of acceptance criteria."),
    })
  ),
});

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" })
    .max(17, { message: "Username must be less than 17 characters" }),
  password: z
    .string()
    .min(4, { message: "Password must be at least 4 characters long" })
    .max(40, { message: "Password must be less than 40 characters" })
});