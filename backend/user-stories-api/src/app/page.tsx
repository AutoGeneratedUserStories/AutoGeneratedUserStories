"use client";

import { useChat } from "ai/react";
import { useState, useCallback } from "react";
import { generate } from "./lib/actions";
import { readStreamableValue } from "ai/rsc";

export default function Chat() {
  const { input, handleInputChange } = useChat();
  const [generation, setGeneration] = useState("");

  const handleAsk = useCallback(async () => {
    try {
      const { object } = await generate(input);
      // Stream the partial responses
      for await (const partial of readStreamableValue(object)) {
        if (partial?.stories) {
          setGeneration(JSON.stringify(partial.stories, null, 2));
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
      <pre className="p-4">{generation}</pre>
      <form onSubmit={handleSubmit} className="fixed inset-x-0 bottom-0 flex justify-center p-4">
        <div className="flex w-full max-w-md">
          <input
            type="text"
            className="flex-1 rounded-l border border-zinc-300 p-2 shadow outline-none dark:border-zinc-800 dark:bg-zinc-900"
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
