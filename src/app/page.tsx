"use client";

import ProjectView from "./components/ProjectView";
import ProjectBar from "./components/ProjectBar";

export default function Chat() {
  

  return (
    <div className="relative min-h-screen">
      <h1 className="text-center">User Story Generator</h1>
      {/* <div className="flex justify-left p-4 overflow-y-auto h-[38rem] absolute">
        <ProjectBar></ProjectBar>
      </div> */}
      <div className="flex justify-center p-4 overflow-y-auto h-screen pb-5">
        <ProjectView stories={[]} />
      </div>
    </div>
  );
}
