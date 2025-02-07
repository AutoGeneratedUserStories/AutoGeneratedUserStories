import { generateObject, streamText } from 'ai';
import { createGoogleGenerativeAI, google } from "@ai-sdk/google"
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const gemini = createGoogleGenerativeAI

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google('gemini-2.0-flash'),
    system:
    "As a software engineering project manager, " +
    "Your job is to take a given project description and generate every necessary user story " +
    "to take the project to completion.",
    messages,
  });
  return result.toDataStreamResponse();
}