"use client";

import React, { useState, useCallback } from "react";
import StoryCard from "./StoryCard";
import { readStreamableValue } from "ai/rsc";
import { generate, reprompt, saveProject } from "../lib/actions";
import { Story } from "../models/story";
import { useChat } from "@ai-sdk/react";
import ProjectBar from "./ProjectBar";
import { Project } from "../models/project";
import SaveProjectModal from "./SaveProjectModal";
import mongoose from "mongoose";

interface ProjectViewProps {
  id: string;
  name: string;
  description: string;
  stories: Story[];
}

interface ProjectViewComponentProps {
  username: string;
  projects: Project[];
  stories: Story[];
}

export default function ProjectView({
  username,
  projects,
  stories: initialStories,
}: ProjectViewComponentProps) {
  const [lists, setLists] = useState<ProjectViewProps[]>([
    { id: "todo", name: "To Do", description: "", stories: initialStories },
    { id: "in-progress", name: "In Progress", description: "", stories: [] },
    { id: "done", name: "Done", description: "", stories: [] },
  ]);

  const [projectList, setProjectList] = useState<Project[]>(projects);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { input, handleInputChange } = useChat();
  const [draggedStory, setDraggedStory] = useState<{
    story: Story;
    sourceListId: string;
  } | null>(null);

  const onDragStart = (story: Story, sourceListId: string) => {
    setDraggedStory({ story, sourceListId });
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const onDrop = (targetListId: string) => {
    if (!draggedStory) return;
    setLists((prevLists) =>
      prevLists.map((list) => {
        if (list.id === draggedStory.sourceListId) {
          return {
            ...list,
            stories: list.stories.filter(
              (s) => s.name !== draggedStory.story.name
            ),
          };
        }
        if (list.id === targetListId) {
          return { ...list, stories: [...list.stories, draggedStory.story] };
        }
        return list;
      })
    );
    setDraggedStory(null);
  };

  const handleSave = async () => {
    const todoList = lists.find((list) => list.id === "todo");
    if (!todoList) return;

    const projectToEdit = {
      name: "Example Project",
      description: "Project generated from stories",
      stories: todoList.stories,
    };

    // Cast so that it can set it to a Project
    setSelectedProject(projectToEdit as Project);
    setIsModalOpen(true);
  };

  const handleConfirm = (updatedProject: Project) => {
    setSelectedProject(updatedProject);
    saveProject(updatedProject);
    setProjectList((prevProjects) => [...prevProjects, updatedProject]);
    setIsModalOpen(false);
  };

  const handleSelectProject = async (project: Project) => {
    if (project != null)
      setSelectedProject(project);

    setLists((prevLists) =>
      prevLists.map((list) =>
        list.id === "todo" ? { ...list, stories: [...project.stories] } : list
      )
    );
  };

  const handleAsk = useCallback(async () => {
    try {

      if (lists[0].stories.length == 0){
        const { object } = await generate(input);

      // Stream partial responses and update the cards immediately
      for await (const partial of readStreamableValue(object)) {
        if (partial?.stories) {
          const newStories: Story[] = partial.stories.map((story: Story) => ({
            name: story.name,
            description: story.description,
            acceptanceCriteria: story.acceptanceCriteria ?? [],
          }));
          setLists((prevLists) =>
            prevLists.map((list) =>
              list.id === "todo"
                ? { ...list, stories: newStories }
                : list
            )
          );
        }
      }
      }
      else {
        const project  = await reprompt(input, selectedProject!);

           // Flatten the nested stories structure into a single Story[] array.
         const flattenedStories: Story[] = project.stories.flatMap(story => {
           const newStory: Story = {
                 name: story.name,
                 description: story.description,
                 acceptanceCriteria: story.acceptanceCriteria,
                 _id: new mongoose.Types.ObjectId(),
                 id: "", // This will be set by the post hook if applicable, or you can manually set it to _id.toString()
               } as Story;
               console.log(newStory);
               return newStory;
         })

         //Now update the state.
         setLists(prevLists =>
           prevLists.map(list =>
             list.id === "todo"
               ? { ...list, stories: flattenedStories }
               : list
           )
         );
        //console.log(project.stories);
      }
      
    } catch (error) {
      console.error("Error during generation:", error);
    }
  }, [input]);

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      handleAsk();
    },
    [handleAsk]
  );

  return (
    <div className="grid grid-cols-[1fr_10fr] gap-4">
      <div className="h-full pt-4">
        <ProjectBar
          username={username}
          projects={projectList}
          onSelectProject={handleSelectProject}
        />
      </div>
      <div className="w-full h-full overflow-auto">
        <div className="ps-4 pt-4">
          <h2>{selectedProject?.name ?? "Unsaved Project"}</h2>
        </div>
        <div className="grid grid-cols-3 gap-4 p-4 ">
          {lists.map((list) => (
            <div
              key={list.id}
              className="border p-4 rounded-lg shadow-sm bg-light flex-1"
              onDragOver={onDragOver}
              onDrop={() => onDrop(list.id)}
            >
              <h2 className="font-bold text-lg mb-4">{list.name}</h2>
              {list.stories.map((story, index) => (
                <div
                  key={`${story.name}-${index}`}
                  className="mb-4"
                  draggable
                  onDragStart={() => onDragStart(story, list.id)}
                >
                  <StoryCard story={story} />
                </div>
              ))}
            </div>
          ))}
          <div className="col-span-3 flex justify-center p-4">
            <div className="flex w-full max-w-2xl items-center">
              <input
                type="text"
                className="flex-1 rounded-l border border-zinc-300 p-4 text-lg"
                value={input}
                onChange={handleInputChange}
                placeholder="Describe your project..."
              />
              <button
                type="submit"
                className="rounded-r bg-blue-600 px-6 py-4 text-white shadow transition-colors hover:bg-blue-700"
                onClick={handleSubmit}
              >
                Ask
              </button>
              <div>
                <button
                  type="button"
                  onClick={handleSave}
                  className="ml-2 bg-green-600 px-6 py-4 text-white shadow transition-colors hover:bg-green-700 rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      {isModalOpen && selectedProject && (
        <SaveProjectModal
          project={selectedProject}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
  
}
