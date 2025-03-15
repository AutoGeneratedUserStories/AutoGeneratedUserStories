"use client";

import React, { useState, useCallback } from "react";
import StoryCard from "./StoryCard";
import { readStreamableValue } from "ai/rsc";
import { exportProject, generate, reprompt, saveProject } from "../lib/actions";
import { Story } from "../models/story";
import { useChat } from "@ai-sdk/react";
import ProjectBar from "./ProjectBar";
import { Project } from "../models/project";
import SaveProjectModal from "./SaveProjectModal";
import Toast from "./Toast";
import ResetModal from "./ResetModal";
import ExportModal from "./ExportModal";
import { User } from "../models/user";

interface ProjectViewProps {
  id: string;
  name: string;
  description: string;
  stories: Story[];
}

interface ProjectViewComponentProps {
  user: User;
  projects: Project[];
  stories: Story[];
}

export default function ProjectView({
  user,
  projects,
  stories: initialStories,
}: ProjectViewComponentProps) {
  const [lists, setLists] = useState<ProjectViewProps[]>([
    { id: "todo", name: "To Do", description: "", stories: initialStories },
    { id: "in-progress", name: "In Progress", description: "", stories: [] },
    { id: "done", name: "Done", description: "", stories: [] },
  ]);

  const [projectList, setProjectList] = useState<Project[]>(projects);
  const [isSaveModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [draggedStory, setDraggedStory] = useState<{
    story: Story;
    sourceListId: string;
  } | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [isAskBarExpanded, setIsAskBarExpanded] = useState(true);
  const [isProjectManagementExpanded, setIsProjectManagementExpanded] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const { input, handleInputChange } = useChat();

  const resetLists = () => {
    setLists([
      { id: "todo", name: "To Do", description: "", stories: [] },
      { id: "in-progress", name: "In Progress", description: "", stories: [] },
      { id: "done", name: "Done", description: "", stories: [] },
    ]);
    handleInputChange({ target: { value: "" } } as React.ChangeEvent<HTMLTextAreaElement>);
  };

  const [toast, setToast] = useState<{ message: string; show: boolean }>({
    message: "",
    show: false,
  });

  const showToastMessage = (message: string, duration = 3000) => {
    setToast({ message, show: true });
    setTimeout(() => {
      setToast({ message: "", show: false });
    }, duration);
  };

  const onDragStart = (story: Story, sourceListId: string) => {
    setDraggedStory({ story, sourceListId });
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const onDrop = (targetListId: string, targetIndex?: number) => {
    if (!draggedStory) return;

    setLists((prevLists) =>
      prevLists.map((list) => {
        if (list.id === draggedStory.sourceListId) {
          // Remove story from source list.
          return {
            ...list,
            stories: list.stories.filter((s) => s.name !== draggedStory.story.name),
          };
        }
        if (list.id === targetListId) {
          // Insert into target list.
          const newStories = [...list.stories];
          if (typeof targetIndex === "number") {
            newStories.splice(targetIndex, 0, { ...draggedStory.story, category: targetListId });
          } else {
            newStories.push({ ...draggedStory.story, category: targetListId });
          }
          return { ...list, stories: newStories };
        }
        return list;
      })
    );
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
    showToastMessage("Project saved successfully!");
  };

  const handleDeleteStory = (storyToDelete: Story) => {
    setLists((prevLists) =>
      prevLists.map((list) => ({
        ...list,
        stories: list.stories.filter((story) => story.name !== storyToDelete.name),
      }))
    );
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

  const handleAddStory = () => {
    const newStory: Story = {
      name: "New Story",
      description: "",
      acceptanceCriteria: [],
      category: "todo",
    };
    setLists((prevLists) =>
      prevLists.map((list) =>
        list.id === "todo" ? { ...list, stories: [...list.stories, newStory] } : list
      )
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
                list.id === "todo" ? { ...list, stories: newStories } : list
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
        showToastMessage("Reprompting...", 3000);
        const project = (await reprompt(input, currProject)) as Project;
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
            stories: flattenedStories.filter((story) => story.category === list.id),
          }))
        );
        showToastMessage("Reprompt complete!", 3000);
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

  // Combine all stories for grid view.
  const allStories: Story[] = lists.reduce(
    (acc, list) => [...acc, ...list.stories],
    [] as Story[]
  );

  const handleExportClicked = () => {
    setIsExportModalOpen(true);
  };

  const handleExportConfirmed = () => {
    exportProject(selectedProject!);
    alert("Project has been exported to Trello!");
    setIsExportModalOpen(false);
  };

  return (
    <div className="grid grid-cols-[1fr_10fr] gap-4">
      <div className="h-full pt-4">
        <ProjectBar user={user} projects={projectList} onSelectProject={handleSelectProject} />
      </div>
      <div className="w-full h-full overflow-auto pb-24">
        <div className="ps-4 pt-4 flex items-center">
          <h2 className="mr-4">{selectedProject?.name ?? "Unsaved Project"}</h2>
          <button
            onClick={handleAddStory}
            className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
          >
            +
          </button>
        </div>
        <div className="p-4 flex justify-end">
          <button
            onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
          >
            {viewMode === "list" ? "Return to Grid View" : "Track Project Progress"}
          </button>
        </div>
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
                    <StoryCard story={story} onDelete={handleDeleteStory} />
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
                <StoryCard story={story} onDelete={handleDeleteStory} />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 w-full max-w-4xl z-50">
        <button
          onClick={() => setIsAskBarExpanded(!isAskBarExpanded)}
          className="w-full flex justify-center items-center bg-transparent text-gray-700 hover:text-gray-900 transition-colors gap-2"
        >
          {!isAskBarExpanded && (
            <span className="text-sm font-medium text-gray-600">
              Edit using AI Prompts
            </span>
          )}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 transform transition-transform ${
              isAskBarExpanded ? "rotate-0" : "rotate-180"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isAskBarExpanded && (
          <form
            onSubmit={handleSubmit}
            className="bg-white/50 backdrop-blur-md shadow-2xl rounded-2xl px-6 pt-2 pb-4 flex items-end border border-white/20 mt-2"
          >
            <textarea
              className="w-full bg-transparent outline-none placeholder-gray-600 text-lg px-4 py-2"
              style={{ height: "auto", resize: "none", overflow: "hidden" }}
              value={input}
              onChange={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
                handleInputChange(e);
              }}
              placeholder="Describe your project..."
            />
            <button
              type="submit"
              className="ml-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-700 px-6 py-3 text-white shadow-lg transition-transform hover:scale-105 focus:outline-none"
            >
              Ask
            </button>
          </form>
        )}
      </div>
      <div className="fixed bottom-2 right-2 w-[213px] max-w-4xl z-50 flex flex-col gap-4 ">

        <button
          onClick={() => setIsProjectManagementExpanded(!isProjectManagementExpanded)}
          className="w-full flex items-center bg-transparent text-gray-700 hover:text-gray-900 transition-colors gap-2 justify-center"
        >
          {!isProjectManagementExpanded && (
            <span className="text-sm font-medium text-gray-600">
              Project Management
            </span>
          )}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 transform transition-transform ${
              isProjectManagementExpanded ? "rotate-0" : "rotate-180"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isProjectManagementExpanded && (
          <div className="bg-white/50 backdrop-blur-md shadow-2xl rounded-2xl pr-3 pt-4 pb-4 flex flex-col border border-white/20">
            <button
              onClick={handleSave}
              className="ml-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-700 px-6 py-3 text-white shadow-lg transition-transform hover:scale-105 focus:outline-none mb-2"
            >
              Save Project
            </button>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="ml-4 rounded-2xl bg-gradient-to-r from-green-500 to-green-700 px-6 py-3 text-white shadow-lg transition-transform hover:scale-105 focus:outline-none mb-2"
            >
              Export Project
            </button>
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="ml-4 rounded-2xl bg-gradient-to-r from-red-500 to-red-700 px-6 py-3 text-white shadow-lg transition-transform hover:scale-105 focus:outline-none"
            >
              Reset Project
            </button>
          </div>
        )}
      </div>
      <ResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onSaveAndReset={() => {
          handleSave();
          resetLists();
          setIsResetModalOpen(false);
        }}
        onDeleteAndReset={() => {
          resetLists();
          setIsResetModalOpen(false);
        }}
      />
      {toast.show && (
        <Toast
          message={toast.message}
          duration={3000}
          onClose={() => setToast({ message: "", show: false })}
        />
      )}
      {isSaveModalOpen && selectedProject && ( <SaveProjectModal project={selectedProject} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirm} />)}

      {isExportModalOpen && selectedProject && (
        <ExportModal
          project={selectedProject}
          board={""}
          onClose={() => setIsExportModalOpen(false)}
          onConfirm={handleExportConfirmed}
        />
      )}
    </div>
  );
}
