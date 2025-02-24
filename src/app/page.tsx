"use server";

import { redirect } from "next/navigation";
import ProjectView from "./components/ProjectView";
import ProjectBar from "./components/ProjectBar";
import { validateRequest } from "./lib/auth";
import { Story } from "./models/story";
import { Project } from "./models/project";


export default async function Chat() {
  const {user} = await validateRequest();
  if (!user) {
      redirect("/login");
  }

  return (
    <div className="relative min-h-screen">
      <h1 className="text-center">User Story Generator</h1>
      <div className="flex justify-center p-4 overflow-y-auto h-screen pb-5">
        <ProjectView stories={[]} />
      </div>
    </div>
  );
}
