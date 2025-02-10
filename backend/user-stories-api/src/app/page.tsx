'use client';

import { useChat } from 'ai/react';
import { useState, useCallback } from 'react';
import { generate } from './lib/actions';
import { readStreamableValue } from 'ai/rsc';

export default function Chat() {
  const { input, handleInputChange } = useChat();
  const [generation, setGeneration] = useState('');

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
      console.error('Error during generation:', error);
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
    <div className="min-h-screen relative">
      <pre className="p-4">{generation}</pre>
      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 inset-x-0 p-4 flex justify-center"
      >
        <div className="flex w-full max-w-md">
          <input
            type="text"
            className="flex-1 dark:bg-zinc-900 p-2 border border-zinc-300 dark:border-zinc-800 rounded-l shadow outline-none"
            value={input}
            onChange={handleInputChange}
            placeholder="Say something..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-r shadow hover:bg-blue-700 transition-colors"
          >
            Ask
          </button>
        </div>
      </form>
    </div>
  );
}
