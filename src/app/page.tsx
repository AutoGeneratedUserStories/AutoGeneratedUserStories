"use server";

import { redirect } from "next/navigation";
import ProjectView from "./components/ProjectView";
import { validateRequest } from "./lib/auth";
import { User } from "./models/user";

export default async function Chat() {
  const {user} = await validateRequest();
  if (!user) {
      redirect("/login");
  }

  return (
      <div className="flex justify-center ps-4 h-[97vh] pb-5">
        <ProjectView stories={[]} user={user as unknown as User} projects={JSON.parse(JSON.stringify(user.projects))}/>
      </div>
  );
}
