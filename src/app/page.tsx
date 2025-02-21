"use server";

import { redirect } from "next/navigation";
import ProjectView from "./components/ProjectView";
import ProjectBar from "./components/ProjectBar";
import { validateRequest } from "./lib/auth";
import { User, UserModel } from "./models/user";
import { Story } from "./models/story";


export default async function Chat() {
  const {user} = await validateRequest();
  if (!user) {
      redirect("/login");
  }

  const user2 : User | null = await UserModel.findOne({ username: user.username });
  const stories: Story[] = user2?.projects?.at(0)?.stories ?? [];

  return (
    <div className="relative min-h-screen">
      <h1 className="text-center">User Story Generator</h1>
      <div className="flex justify-left p-4 overflow-y-auto h-[38rem] absolute">
        <ProjectBar username={user.username}></ProjectBar>
      </div>
      <div className="flex justify-center p-4 overflow-y-auto h-[38rem]">
        <ProjectView stories={JSON.parse(JSON.stringify(stories))} />
      </div>
    </div>
  );
}
