"use server";

import { redirect } from "next/navigation";
import ProjectView from "./components/ProjectView";
import { validateRequest } from "./lib/auth";

export default async function Chat() {
  const {user} = await validateRequest();
  if (!user) {
      redirect("/login");
  }

  return (
    <div className="min-h-screen w-full flex flex-col">
      <h1 className="text-center">User Story Generator</h1>
      <div className="flex justify-center ps-4 h-screen">
        <ProjectView stories={[]} username={user.username} projects={JSON.parse(JSON.stringify(user.projects))}/>
      </div>
    </div>
  );
}
