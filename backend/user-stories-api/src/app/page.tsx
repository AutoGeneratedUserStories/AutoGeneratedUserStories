"use client";

import { useChat } from "ai/react";
import { useState, useCallback } from "react";
import { generate } from "./lib/actions";
import { readStreamableValue } from "ai/rsc";
import { Story } from "./models/story";
import Container from "./components/container";

export default function Chat() {
  const { input, handleInputChange } = useChat();
  const [stories, setStories] = useState<Story[]>([]);

  const handleAsk = useCallback(async () => {
    try {
      const { object } = await generate(input);
      // Stream the partial responses
      for await (const partial of readStreamableValue(object)) {
        if (partial?.stories) {
          const newStories = partial.stories.map(
            (story: any) =>
              new Story(story.name, story.description, story.acceptanceCriteria)
          );
          setStories(newStories);
        }
      }
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

  return (
    <div className="relative min-h-screen">
      <div className="flex justify-center p-4 overflow-y-auto h-[38rem]">
        <Container stories={stories} />
      </div>
      <form onSubmit={handleSubmit} className="fixed inset-x-0 bottom-0 flex justify-center p-4">
        <div className="flex w-full max-w-md">
          <input
            type="text"
            className="flex-1 rounded-l border border-zinc-300 p-2"
            value={input}
            onChange={handleInputChange}
            placeholder="Say something..."
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
