// components/Container.tsx
import React, { useState, useCallback, useEffect } from "react";
import StoryCard from "./StoryCard";
import { useChat } from "ai/react";
import { readStreamableValue } from "ai/rsc";
import { generate, saveProject } from "../lib/actions";
import { Story } from "../models/story";

interface ContainerProps {
  stories: Story[];
}

export default function Container({ stories: initialStories }: ContainerProps) {
  const { input, handleInputChange } = useChat();
  const [stories, setStories] = useState<Story[]>(initialStories);

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

  return (
    <div className="grid">
      {stories.map((story, index) => (
        <StoryCard key={index} story={story} />
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
  );
}
