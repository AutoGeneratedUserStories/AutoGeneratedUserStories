"use server";

import { generateObject, streamObject } from "ai";
import { google } from "@ai-sdk/google";
import { createStreamableValue } from "ai/rsc";
import { projectSchema, storiesSchema, storySchema } from "./schema";
import { Story } from "../models/story"; // Import the Story model
import { Project, ProjectModel } from "../models/project";
import { ActionResult } from "next/dist/server/app-render/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validateRequest, lucia } from "./auth";
import { UserModel } from "../models/user";
import mongoose from "mongoose";
import TrelloService from "../service/TrelloService";

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
      schema: storiesSchema,
    });

    for await (const partialObject of partialObjectStream) {
      stream.update(partialObject);
    }

    stream.done();
  })();

  return { object: stream.value };
}

export async function reprompt(input: string, project: Project) {
  const { object } = await generateObject({
    model: google("gemini-2.0-flash"),
    system:
      "Your job is to take this existing project and adjust the user stories based on user input. Return all" +
      "of the user stories you edited along with the unchanged user stories in the same order. Here is the project: " +
      JSON.stringify(project),
    prompt: input,
    schema: projectSchema,
  });
  return object;
}

export async function exportProject(project: Project) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return {
        error: "Unauthorized",
      };
    }
    const service = new TrelloService(user.trelloApiKey, user.trelloApiToken);
    const data = await service.createBoard(project.name);

    if (!data) {
      return {
        error: "Failed to create board",
      };
    }

    const toDoData = await service.createList("To Do", data.id);
    const inProgressData = await service.createList("In Progress", data.id);
    const doneData = await service.createList("Done", data.id);

    project.stories.forEach(async (story: Story) => {
      let cardData;
      if (story.category === "todo") {
        cardData = await service.createCard(toDoData.id, story.name, story.description);
      } else if (story.category === "in-progress") {
        cardData = await service.createCard(inProgressData.id, story.name, story.description);
      } else {
        cardData = await service.createCard(doneData.id, story.name, story.description);
      }
      const checkListData = await service.CreateChecklist(cardData.id);
      story.acceptanceCriteria?.forEach(async (acceptanceCriteria: string) => {
        service.addToChecklist(checkListData.id, acceptanceCriteria);
      });
    });
  } catch (error) {
    console.log(error);
  }
}

export async function saveSettings(data: {
  geminiKey?: string;
  trelloApiKey?: string;
  trelloApiToken?: string;
}) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return {
        error: "Unauthorized",
      };
    }

    const { geminiKey, trelloApiKey, trelloApiToken } = data;

    const username = user.username;

    // Update the user document to embed the new project.
    const updatedUser = await UserModel.findOneAndUpdate(
      { username },
      {
        $set: { geminiKey: geminiKey, trelloApiKey: trelloApiKey, trelloApiToken: trelloApiToken },
      },
      { new: true }
    );
  } catch (error) {
    console.log(error);
  }
}

export async function saveProject(data: { name: string; description?: string; stories: Story[] }) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return {
        error: "Unauthorized",
      };
    }

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
    console.log(error);
    // return { error };
  }
}

export async function logout(): Promise<ActionResult> {
  "use server";
  const { session } = await validateRequest();
  if (!session) {
    return {
      error: "Unauthorized",
    };
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  (await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  return redirect("/login");
}
