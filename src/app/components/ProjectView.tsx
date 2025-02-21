// components/ProjectView.tsx
import React, { useState, useCallback, useEffect } from "react";
import StoryCard from "./StoryCard";
import { useChat } from "ai/react";
import { readStreamableValue } from "ai/rsc";
import { generate, saveProject } from "../lib/actions";
import { Story } from "../models/story";
import ProjectBar from "./ProjectBar";

interface ProjectViewProps {
    stories: Story[];
}

export default function ProjectView({ stories: initialStories }: ProjectViewProps) {
    const { input, handleInputChange } = useChat();
    const [stories, setStories] = useState<Story[]>(initialStories);
    const [draggedStoryId, setDraggedStoryId] = useState<string | null>(null);

    const handleAsk = useCallback(async () => {
        try {
            const { object } = await generate(input);
            let updatedStories: Story[] = [];

            // Stream the partial responses
            for await (const partial of readStreamableValue(object)) {
                if (partial?.stories) {
                    updatedStories = partial.stories.map((story: Story) => ({
                        name: story.name,
                        description: story.description,
                        acceptanceCriteria: story.acceptanceCriteria ?? [],
                    }));
                    setStories(updatedStories);
                }
            }

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
    useEffect(() => {
        setStories(initialStories);
    }, [initialStories]);

    const onDragStart = (e: React.DragEvent, storyId: string) => {
        setDraggedStoryId(storyId); // Set the story being dragged
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Prevent default to allow drop
    };

    const onDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        if (draggedStoryId) {
            const draggedIndex = stories.findIndex((story) => `story-${story.name}` === draggedStoryId);
            const updatedStories = [...stories];
            const [draggedStory] = updatedStories.splice(draggedIndex, 1); // Remove dragged story
            updatedStories.splice(targetIndex, 0, draggedStory); // Insert the dragged story in the target position
            setStories(updatedStories);
        }
    };

    return (
        <div className="grid grid-cols-[200px_minmax(900px,_1fr)_100px] grid-rows-1">
            <div className="col">
            </div>
            <div className="col">
                {stories.map((story, index) => (
                    <div
                    key={index}
                    onDragOver={(e) => onDragOver(e)}
                    onDrop={(e) => onDrop(e, index)}
                >
                    <StoryCard
                        key={story.name}
                        story={story}
                        onDragStart={onDragStart}
                    />
                </div>
                ))}
                <form onSubmit={handleSubmit} className="fixed inset-x-0 bottom-0 flex justify-center p-4">
                    <div className="flex w-full max-w-md">
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
