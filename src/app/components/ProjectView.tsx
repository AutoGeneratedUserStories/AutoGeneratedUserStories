// components/ProjectView.tsx
import React, { useState, useCallback, useEffect } from "react";
import StoryCard from "./StoryCard";
import { useChat } from "ai/react";
import { readStreamableValue } from "ai/rsc";
import { generate, saveProject } from "../lib/actions";
import { Story } from "../models/story";
import ProjectBar from "./ProjectBar";

interface ProjectViewProps {
    id: string;
    name: string;
    description: string;
    stories: Story[];
}

export default function ProjectView({ stories: initialStories }: { stories: Story[] }) {
    const [lists, setLists] = useState<ProjectViewProps[]>([
        { id: "todo", name: "To Do", description:" ",stories: initialStories },
        { id: "in-progress", name: "In Progress", description:" ",stories: [] },
        { id: "done", name: "Done", description:" ",stories: [] },
    ]);
    const { input, handleInputChange } = useChat();
    const [draggedStory, setDraggedStory] = useState<{ story: Story; sourceListId: string } | null>(null);

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
                    return { ...list, stories: list.stories.filter((s) => s.name !== draggedStory.story.name) };
                }
                if (list.id === targetListId) {
                    return { ...list, stories: [...list.stories, draggedStory.story] };
                }
                return list;
            })
        );

        setDraggedStory(null);
    };

    const handleAsk = useCallback(async () => {
        try {
            const { object } = await generate(input);
            let updatedStories: Story[] = [];

            // Stream the partial responses
            for await (const partial of readStreamableValue(object)) {
                if (partial && partial.stories) {  
                    updatedStories = partial.stories.map((story: Story) => ({
                        name: story.name,
                        description: story.description,
                        acceptanceCriteria: story.acceptanceCriteria ?? [],
                    }));
                }
            }
            setLists((prevLists) =>
                prevLists.map((list) =>
                    list.id === "todo" ? { ...list, stories: [...list.stories, ...updatedStories] } : list
                )
            );
            // TODO: Maybe we shouldn't save by default and the user should be asked
            // Users will be able to customize their name and description.
            // It also will need to be associated with a user
            // It very likely might break if two people have the same project name
            await saveProject({
                name: "My Awesome Project",
                description: "Project generated from stories",
                stories: updatedStories,
            });
        } catch (error) {
            console.error("Error during generation:", error);
        }
    }, [input]);

    const handleSubmit = useCallback(
        (event: React.FormEvent) => {
            event.preventDefault(); // Prevent the page from reloading
            handleAsk();
        },
        [handleAsk]
    );

    // Initialize stories list when the page loads
    // useEffect(() => {
    //     setStories(initialStories);
    // }, [initialStories]);

    return (
        <div className="grid grid-cols-[200px_minmax(900px,_1fr)_100px] gap-4 p-4 overflow-auto">
              <div className="h-[38rem]">
            {/* This ensures the ProjectBar will fill the height of the screen */}
            <ProjectBar />
        </div>
            <div className="grid grid-cols-3 gap-4 p-4 w-full h-full overflow-auto">
                {lists.map((list) => (
                    <div key={list.id}  className="border p-4 rounded-lg shadow-sm flex-1" onDragOver={onDragOver} onDrop={() => onDrop(list.id)}>
                        <h2 className="font-bold text-lg">{list.name}</h2>
                        {list.stories.map((story, index) => (
                            <StoryCard key={`${story.name}-${index}`} story={story} onDragStart={() => onDragStart(story, list.id)} />
                        ))}
                    </div>
                ))}
                <form onSubmit={handleSubmit} className="flex justify-center p-4 justify-items-flexend">
                    <div className="flex w-full max-w-md items-end">
                        <input
                            type="text"
                            className="flex-1 rounded-l border border-zinc-300 p-2"
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Describe your project..."
                        />
                        <button
                            type="submit"
                            className="rounded-r bg-blue-600 px-4 py-2 text-white shadow transition-colors hover:bg-blue-700"
                        >
                            Ask
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
