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
  const [draggedStory, setDraggedStory] = useState<{
    story: Story;
    sourceListId: string;
  } | null>(null);

  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");

  const { input, handleInputChange } = useChat();

  const onDragStart = (story: Story, sourceListId: string) => {
    setDraggedStory({ story, sourceListId });
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const onDrop = (targetListId: string, targetIndex?: number) => {
    if (!draggedStory) return;

    if (targetListId === draggedStory.sourceListId) {
      setLists((prevLists) =>
        prevLists.map((list) => {
          if (list.id !== targetListId) return list;
          const filteredStories = list.stories.filter(
            (s) => s.name !== draggedStory.story.name
          );
          const newStories = [...filteredStories];
          if (typeof targetIndex === "number") {
            newStories.splice(targetIndex, 0, {
              ...draggedStory.story,
              category: targetListId,
            });
          } else {
            newStories.push({ ...draggedStory.story, category: targetListId });
          }
          return { ...list, stories: newStories };
        })
      );
    } else {
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
            const newStories = [...list.stories];
            if (typeof targetIndex === "number") {
              newStories.splice(targetIndex, 0, {
                ...draggedStory.story,
                category: targetListId,
              });
            } else {
              newStories.push({ ...draggedStory.story, category: targetListId });
            }
            return { ...list, stories: newStories };
          }
          return list;
        })
      );
    }
    setDraggedStory(null);
  };

  const handleSave = async () => {
    const allStories: Story[] = lists.reduce(
      (acc, list) => [...acc, ...list.stories],
      [] as Story[]
    );

    const projectToEdit = {
      name: "New Project",
      description: input,
      stories: allStories,
      id: "",
    } as Project;

    setSelectedProject(projectToEdit);
    setIsModalOpen(true);
  };

  const handleConfirm = (updatedProject: Project) => {
    setSelectedProject(updatedProject);
    saveProject(updatedProject);
    setProjectList((prevProjects) => [...prevProjects, updatedProject]);
    setIsModalOpen(false);
  };

  const handleSelectProject = async (project: Project) => {
    setSelectedProject(project);
    setLists((prevLists) =>
      prevLists.map((list) => ({
        ...list,
        stories: project.stories.filter((story) => story.category === list.id),
      }))
    );
  };

  const handleAsk = useCallback(async () => {
    const allStories: Story[] = lists.reduce(
      (acc, list) => [...acc, ...list.stories],
      [] as Story[]
    );

    try {
      if (allStories.length === 0) {
        const { object } = await generate(input);
        for await (const partial of readStreamableValue(object)) {
          if (partial?.stories) {
            const newStories: Story[] = partial.stories.map((story: Story) => ({
              name: story.name,
              description: story.description,
              acceptanceCriteria: story.acceptanceCriteria ?? [],
              category: "todo",
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
      } else {
        let currProject = selectedProject;
        if (!currProject) {
          currProject = {
            name: "Example Project",
            description: "Project generated from stories",
            stories: allStories,
          } as Project;
          setSelectedProject(currProject);
        }
        const project = (await reprompt(input, currProject!)) as Project;
        setSelectedProject(project);

        const flattenedStories: Story[] = project.stories.map((story) => ({
          name: story.name,
          description: story.description,
          acceptanceCriteria: story.acceptanceCriteria,
          category: story.category,
          id: story.id,
          _id: story._id,
        }));

        setLists((prevLists) =>
          prevLists.map((list) => ({
            ...list,
            stories: flattenedStories.filter(
              (story) => story.category === list.id
            ),
          }))
        );
      }
    } catch (error) {
      console.error("Error during generation:", error);
    }
  }, [input, lists, selectedProject]);

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      handleAsk();
    },
    [handleAsk]
  );

  // Combine all stories for grid view
  const allStories: Story[] = lists.reduce(
    (acc, list) => [...acc, ...list.stories],
    [] as Story[]
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
      <div className="w-full h-full overflow-auto pb-24">
        <div className="ps-4 pt-4">
          <h2>{selectedProject?.name ?? "Unsaved Project"}</h2>
        </div>

        {/* Toggle Button */}
        <div className="p-4 flex justify-end">
          <button
            onClick={() =>
              setViewMode(viewMode === "list" ? "grid" : "list")
            }
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
          >
            {viewMode === "list" ? "Return to Grid View" : "Track Project Progress"}
          </button>
        </div>

        {/* Conditional rendering based on view mode */}
        {viewMode === "list" ? (
          <div className="grid grid-cols-3 gap-4 p-4">
            {lists.map((list) => (
              <div
                key={list.id}
                className="border p-4 rounded-lg shadow-sm bg-light flex-1"
                onDragOver={onDragOver}
                onDrop={(e) => {
                  e.stopPropagation();
                  onDrop(list.id);
                }}
              >
                <h2 className="font-bold text-lg mb-4">{list.name}</h2>
                {list.stories.map((story, index) => (
                  <div
                    key={`${story.name}-${index}`}
                    className="mb-4"
                    draggable
                    onDragStart={() => onDragStart(story, list.id)}
                    onDragOver={onDragOver}
                    onDrop={(e) => {
                      e.stopPropagation();
                      onDrop(list.id, index);
                    }}
                  >
                    <StoryCard story={story} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
            {allStories.map((story, index) => (
              <div
                key={`${story.name}-${index}`}
                className="p-6 rounded-lg shadow-md bg-gray-50 hover:shadow-lg transition-shadow hover:scale-105 transform duration-200"
              >
                <StoryCard story={story} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Ask Bar */}
      <form
        onSubmit={handleSubmit}
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl bg-white/50 backdrop-blur-md shadow-2xl rounded-full px-6 py-4 flex items-center z-50 border border-white/30"
      >
        <input
          type="text"
          className="flex-1 bg-transparent outline-none placeholder-gray-600 text-lg px-4 py-2"
          value={input}
          onChange={handleInputChange}
          placeholder="Describe your project..."
        />
        <button
          type="submit"
          className="ml-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 px-6 py-3 text-white shadow-lg transition-transform hover:scale-105 focus:outline-none"
        >
          Ask
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="ml-4 rounded-full bg-gradient-to-r from-green-500 to-green-700 px-6 py-3 text-white shadow-lg transition-transform hover:scale-105 focus:outline-none"
        >
          Save
        </button>
      </form>

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
