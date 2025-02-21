"use server";

import { streamObject } from "ai";
import { google } from "@ai-sdk/google";
import { createStreamableValue } from "ai/rsc";
import { storySchema } from "./schema";
import { Story } from "../models/story"; // Import the Story model
import connectDB from "./connectDB";
import { ProjectModel } from "../models/project";
import { ActionResult } from "next/dist/server/app-render/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validateRequest, lucia } from "./auth";

export async function generate(input: string) {
  const stream = createStreamableValue();

  (async () => {
    const { partialObjectStream } = streamObject({
      model: google("gemini-2.0-flash"),
      system:
        "As a software engineering project manager, " +
        "Your job is to take a given project description and generate every necessary user story " +
        "to take the project to completion. Also generate acceptance criteria for each user story as necessary",
      prompt: input,
      schema: storySchema,
    });

    for await (const partialObject of partialObjectStream) {
      stream.update(partialObject);
    }

    stream.done();
  })();

  return { object: stream.value };
}

export async function saveProject(data: { name: string; description?: string; stories: Story[] }) {
  try {
    await connectDB();

    const { name, description, stories } = data;

    const project = new ProjectModel({
      name,
      description,
      stories,
    });

    // Save the project to the database
    const savedProject = await project.save();
    // return savedProject; // Maybe something should be returned, but not this
  } catch (error) {
    return { error };
  }
}

export async function logout(): Promise<ActionResult> {
  'use server';
  const { session } = await validateRequest();
  if (!session) {
    return {
      error: 'Unauthorized',
    };
  }
 
  await lucia.invalidateSession(session.id);
 
  const sessionCookie = lucia.createBlankSessionCookie();
  (await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
  return redirect('/login');
}