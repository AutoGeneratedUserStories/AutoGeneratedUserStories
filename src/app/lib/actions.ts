"use server";

import { streamObject } from "ai";
import { google } from "@ai-sdk/google";
import { createStreamableValue } from "ai/rsc";
import { storySchema } from "./schema";
import { Story } from "../models/story"; // Import the Story model
import connectDB from "./connectDB";
import { Project, ProjectModel } from "../models/project";
import { ActionResult } from "next/dist/server/app-render/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validateRequest, lucia } from "./auth";
import { UserModel } from "../models/user";
import mongoose from "mongoose";

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

export async function saveProject(data: { name: string; description?: string; stories: Story[]}) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return {
        error: "Unauthorized",
      };
    }

    await connectDB();

    const { name, description, stories } = data;
  
    const username = user.username;

    const newProject: Project = {
      name,
      description,
      stories,
      _id: new mongoose.Types.ObjectId(),
      id: "", // This will be set by the post hook if applicable, or you can manually set it to _id.toString()
    } as Project;

    // Update the user document to embed the new project.
    const updatedUser = await UserModel.findOneAndUpdate(
      { username },
      { $push: { projects: newProject } },
      { new: true }
    );

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